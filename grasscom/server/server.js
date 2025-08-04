const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/grasscom', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Your routes here...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Add after other requires
const examRoutes = require('./routes/exams');

// Add before app.listen
app.use('/api/exams', examRoutes);