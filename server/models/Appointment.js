const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String},
  reason: { type: String },
  day: { type: String },
  token: { type: Number }, 
  reportingTime: { type: String }, // Add this field
// ➕ Add this line
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });


module.exports = mongoose.model('Appointment', appointmentSchema);
