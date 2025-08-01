const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');
const { sendWhatsApp } = require('../utils/whatsappService');
const router = express.Router();

// ===========================
// POST /api/appointments
// Book a new appointment
// ===========================
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, date, time, symptoms } = req.body;

    // Validate inputs
    if (!name || !email || !phone || !date || !time || !symptoms) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find or create patient
    let patient = await Patient.findOne({ email });
    if (!patient) {
      patient = new Patient({ name, email, phone });
      await patient.save();
    }

    // Create new appointment
    const appointment = new Appointment({
      patient: patient._id,
      date: new Date(date),
      time,
      symptoms
    });

    await appointment.save();
    await appointment.populate('patient');

    // 🔔 Notify DOCTOR via email
    try {
      await sendEmail.newAppointmentToDoctor(appointment);
    } catch (error) {
      console.log("❌ Doctor email error:", error.message);
    }

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('❌ Appointment booking error:', error);
    res.status(500).json({
      message: 'Failed to book appointment',
      error: error.message
    });
  }
});

// ===========================
// GET /api/appointments
// Admin: Get all appointments
// ===========================
router.get('/', auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('❌ Fetch appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===========================
// PUT /api/appointments/:id/status
// Admin: Update appointment status
// ===========================
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patient');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // ✅ If status is confirmed/done, notify PATIENT
    if (status === 'confirmed' || status === 'done') {
      try {
        await sendEmail.appointmentConfirmation(appointment); // Email to patient
        await sendWhatsApp.appointmentConfirmation(appointment); // WhatsApp to patient
      } catch (error) {
        console.log('❌ Patient notification error:', error.message);
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error('❌ Update appointment status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
