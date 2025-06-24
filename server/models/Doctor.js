const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: String,
  department: String,
  availableDays: [String], // e.g. ["Monday", "Tuesday"]
  dutyTime: String,        // e.g. "10:00 AM - 2:00 PM"
  maxAppointmentsPerDay: Number,
});

module.exports = mongoose.model('Doctor', doctorSchema);
