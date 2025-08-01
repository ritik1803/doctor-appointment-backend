const axios = require('axios');
require('dotenv').config();

const sendWhatsApp = {
  appointmentConfirmation: async (appointment) => {
    const { patient, date, time } = appointment;

    const message = `
Hello ${patient.name}! 👋

Your appointment with ${process.env.DOCTOR_NAME} has been confirmed!

📅 Date: ${new Date(date).toLocaleDateString()}
🕒 Time: ${time}


We look forward to seeing you!
    `.trim();

    try {
      const response = await axios.post(
        `https://api.ultramsg.com/${process.env.WHATSAPP_INSTANCE}/messages/chat`,
        null,
        {
          params: {
            token: process.env.WHATSAPP_TOKEN,
            to: patient.phone,
            body: message,
            priority: 10
          }
        }
      );
      console.log("✅ WhatsApp sent:", response.data);
    } catch (error) {
      console.error("❌ WhatsApp sending error:", error.response?.data || error.message);
    }
  }
};

module.exports = { sendWhatsApp };
