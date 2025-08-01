const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = {
  // ✅ 1. Called immediately after patient books appointment (Doctor gets notified)
  newAppointmentToDoctor: async (appointment) => {
    const { patient, date, time, symptoms } = appointment;

    const doctorMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.DOCTOR_EMAIL,
      subject: '🩺 New Appointment Booking',
      html: `
        <h2>New Appointment Booking</h2>
        <p><strong>Patient Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${patient.name}</li>
          <li><strong>Email:</strong> ${patient.email}</li>
          <li><strong>Phone:</strong> ${patient.phone}</li>
        </ul>
        <p><strong>Appointment Details:</strong></p>
        <ul>
          <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Symptoms:</strong> ${symptoms}</li>
        </ul>
        <p>Please log in to the admin dashboard to manage the appointment.</p>
      `
    };

    await transporter.sendMail(doctorMailOptions);
  },

  // ✅ 2. Called when admin changes status to 'confirmed' or 'done' (Patient gets notified)
  appointmentConfirmation: async (appointment) => {
    const { patient, date, time, symptoms } = appointment;

    const patientMailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: '✅ Your Appointment is Confirmed',
      html: `
        <h2>Appointment Confirmation</h2>
        <p>Dear ${patient.name},</p>
        <p>Your appointment with <strong>${process.env.DOCTOR_NAME}</strong> has been <strong>confirmed</strong>.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Symptoms/Reason:</strong> ${symptoms}</li>
        </ul>
        <p>We look forward to seeing you. Please reach out if you have any questions.</p>
        <p>Best regards,<br/>${process.env.DOCTOR_NAME}</p>
      `
    };

    await transporter.sendMail(patientMailOptions);
  }
};

module.exports = { sendEmail };
