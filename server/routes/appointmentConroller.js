// Create appointment
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

router.post('/', async (req, res) => {
  const { doctorName, date, time, reason } = req.body;

  try {
    // Convert date to day of week
    const appointmentDate = new Date(date);
    const day = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if doctor exists and is available that day
    const doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (!doctor.availableDays.includes(day)) {
      return res.status(400).json({ message: `Doctor is not available on ${day}` });
    }

    // Count appointments for this doctor on that day
    const existingAppointments = await Appointment.countDocuments({
      doctorName,
      date,
    });

    if (existingAppointments >= doctor.maxAppointmentsPerDay) {
      return res.status(400).json({ message: 'No more slots available for this doctor on the selected date' });
    }

    const newAppointment = new Appointment({
      doctorName,
      date,
      time,
      reason,
      day // ✅ Store the weekday in DB
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully', token: existingAppointments + 1 });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


// Get all appointments for the user
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Appointment.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });

    res.json({ message: 'Appointment updated', appointment: updated });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });

    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
