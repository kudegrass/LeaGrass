const express = require('express');
const couchbase = require('couchbase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ✅ Correct: Use 'const' and quotes
const CB_CONNECTION_STRING = 'cb.4bvdymrynsvq5fea.cloud.couchbase.com';
const CB_USERNAME = 'grasscom_user';
const CB_PASSWORD = '112600';
const CB_BUCKET_NAME = 'Grasscom';
const CB_SCOPE_NAME = 'Collection';
const CB_COLLECTION_NAME = 'Data';
const JWT_SECRET = '112600';

let collection;

async function connectToCouchbase() {
  try {
    const cluster = await couchbase.Cluster.connect(
      `couchbases://${CB_CONNECTION_STRING}`,
      {
        username: CB_USERNAME,
        password: CB_PASSWORD,
        tlsVerify: false,
        connectTimeout: 30000,
        kvTimeout: 20000,
        resolveTimeout: 20000,
        port: 18093,
      }
    );

    const bucket = cluster.bucket(CB_BUCKET_NAME);
    await bucket.collections().getAllScopes();

    const scope = bucket.scope(CB_SCOPE_NAME);
    collection = scope.collection(CB_COLLECTION_NAME);

    console.log('✅ Connected to Couchbase Cloud');

    try {
      await cluster.query(`CREATE PRIMARY INDEX ON \`${CB_BUCKET_NAME}\`.\`${CB_SCOPE_NAME}\`.\`${CB_COLLECTION_NAME}\``);
    } catch (e) {
      if (!e.message.includes('already exists')) console.warn('Index warning:', e.message);
    }
  } catch (err) {
    console.error('❌ Failed to connect:', err.message || err.code || err);
    process.exit(1);
  }
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  try {
    await collection.get(`user::${username}`);
    return res.status(400).json({ error: 'User already exists' });
  } catch {}

  const hashed = await bcrypt.hash(password, 10);
  await collection.upsert(`user::${username}`, {
    type: 'user',
    username,
    password: hashed,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ message: 'User created' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let result;
  try {
    result = await collection.get(`user::${username}`);
  } catch {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, result.content.password);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, username });
});

app.get('/api/profile', async (req, res) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await collection.get(`user::${decoded.username}`);
    const { password, ...user } = result.content;
    res.json({ user });
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
});

app.get('/', (req, res) => {
  res.send('<h1>LeaGrass API Ready</h1><p>Use /api/register, /api/login</p>');
});

// Start
(async () => {
  await connectToCouchbase();
  app.listen(process.env.PORT || 10000, '0.0.0.0', () => {
    console.log('🚀 Server running on port ' + (process.env.PORT || 10000));
  });
})();