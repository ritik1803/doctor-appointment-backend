const express = require('express');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/patients - Admin only
router.get('/', auth, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('❌ Fetch patients error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
