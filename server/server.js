// server/server.js
require('dotenv').config();
const express = require('express');
const { Cluster } = require('couchbase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration from environment variables
const CB_CONNECTION_STRING = process.env.COUCHBASE_CONNECTION_STRING;
const CB_USERNAME = process.env.COUCHBASE_USERNAME;
const CB_PASSWORD = process.env.COUCHBASE_PASSWORD;
const CB_BUCKET_NAME = process.env.COUCHBASE_BUCKET;
const CB_SCOPE_NAME = process.env.COUCHBASE_SCOPE_NAME || '_default';
const CB_COLLECTION_NAME = process.env.COUCHBASE_COLLECTION_NAME || '_default';
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!CB_CONNECTION_STRING || !CB_USERNAME || !CB_PASSWORD || !CB_BUCKET_NAME || !JWT_SECRET) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

let collection;

// Connect to Couchbase with enhanced timeout settings
async function connectToCouchbase() {
  try {
    console.log('🔌 Connecting to Couchbase Cloud...');
    
    const cluster = await Cluster.connect(
      `couchbases://${CB_CONNECTION_STRING}`,
      {
        username: CB_USERNAME,
        password: CB_PASSWORD,
        tls: true,
        // Add extended timeout settings
        timeTravel: {
          kvTimeout: 10000,        // 10 seconds for key-value operations
          queryTimeout: 75000,     // 75 seconds for queries
          viewTimeout: 75000,      // 75 seconds for views
          searchTimeout: 75000,    // 75 seconds for search
          analyticsTimeout: 75000, // 75 seconds for analytics
          managementTimeout: 75000 // 75 seconds for management operations
        }
      }
    );
    
    console.log('✅ Connected to Couchbase cluster');
    
    const bucket = cluster.bucket(CB_BUCKET_NAME);
    console.log(`✅ Connected to bucket: ${CB_BUCKET_NAME}`);
    
    const scope = bucket.scope(CB_SCOPE_NAME);
    collection = scope.collection(CB_COLLECTION_NAME);
    console.log(`✅ Using collection: ${CB_SCOPE_NAME}.${CB_COLLECTION_NAME}`);
    
    // Create primary index with timeout handling
    try {
      await cluster.queryIndexes.createPrimaryIndex(CB_BUCKET_NAME, {
        scopeName: CB_SCOPE_NAME,
        ignoreIfExists: true,
        timeout: 60000
      });
      console.log('✅ Primary index created or exists');
    } catch (indexError) {
      console.log('Index setup complete or not needed');
    }
    
  } catch (error) {
    console.error('❌ Couchbase connection failed:', error.message);
    
    // Provide specific error guidance
    if (error.code === 12004) {
      console.error('Authentication failed - check username/password');
    } else if (error.code === 12003) {
      console.error('Could not connect to host - check connection string');
    } else if (error.message.includes('timeout')) {
      console.error('Connection timeout - check IP whitelisting and network connectivity');
      console.error('Common causes:');
      console.error('1. IP not whitelisted in Couchbase Cloud');
      console.error('2. Firewall blocking port 18091-18094');
      console.error('3. Incorrect connection string format');
    }
    
    process.exit(1);
  }
}

// Test route
app.get('/api/health', async (req, res) => {
  try {
    const { cluster } = await connectToCouchbase();
    const clusterInfo = await cluster.clusterInfo();
    
    res.json({ 
      status: 'Server is running',
      database: 'Couchbase connected',
      cluster: clusterInfo.name,
      bucket: CB_BUCKET_NAME,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Server running, but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email and password' 
      });
    }
    
    // Check if user exists
    try {
      await collection.get(`user::${email}`);
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    } catch (err) {
      if (err.code !== 13) throw err; // Only continue if document not found
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user document
    const userDoc = {
      type: 'user',
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    await collection.upsert(`user::${email}`, userDoc);
    
    // Create JWT token
    const token = jwt.sign({ id: email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: email, name, email }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let result;
    try {
      result = await collection.get(`user::${email}`);
    } catch (err) {
      if (err.code === 13) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
      throw err;
    }
    
    const user = result.content;
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    const token = jwt.sign({ id: email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: email, name: user.name, email: user.email }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Start server
(async () => {
  try {
    await connectToCouchbase();
    app.listen(PORT, () => {
      console.log(`\n🚀 Grass.com Server Started`);
      console.log(`   Port: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Register: POST /api/auth/register`);
      console.log(`   Login: POST /api/auth/login`);
      console.log(`\n✅ Server is ready!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();