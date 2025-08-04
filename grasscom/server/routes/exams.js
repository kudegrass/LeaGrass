const express = require('express');
const router = express.Router();

// Mock exam data
const mockExams = {
  'crop-science': Array(100).fill().map((_, i) => ({
    id: i + 1,
    question: `Crop Science Question ${i + 1}`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A'
  })),
  'soil-science': Array(100).fill().map((_, i) => ({
    id: i + 1,
    question: `Soil Science Question ${i + 1}`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'B'
  }))
  // Add other subjects...
};

// Get exam by subject
router.get('/:subject', (req, res) => {
  const { subject } = req.params;
  if (mockExams[subject]) {
    res.json(mockExams[subject]);
  } else {
    res.status(404).json({ message: 'Exam not found' });
  }
});

module.exports = router;