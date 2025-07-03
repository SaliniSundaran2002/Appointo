const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor.js');
const Appointment = require('../models/Appointment.js');
// POST /api/doctors → Add a new doctor
router.post('/', async (req, res) => {
  try {
    const { name, department, availableDays, maxAppointmentsPerDay, dutyTime } = req.body;

    const doctor = new Doctor({
      name,
      department,
      availableDays, // e.g. ["Monday", "Tuesday"]
      maxAppointmentsPerDay,
      dutyTime, // e.g. "10:00 AM - 2:00 PM"
    });

    await doctor.save();
    res.status(201).json({ message: 'Doctor added', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add doctor', error: err.message });
  }
});

// GET /api/doctors/availability?name=Dr.Salini&date=2025-06-24
router.get('/availability', async (req, res) => {
  const { name, date } = req.query;

  console.log('Query received:', { name, date });

  if (!name || !date) {
    return res.status(400).json({ message: 'Doctor name and date are required' });
  }

  try {
    const doctor = await Doctor.findOne({ name });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    console.log('Selected day:', selectedDay);

    if (!doctor.availableDays.includes(selectedDay)) {
      return res.status(400).json({ message: `Doctor is not available on ${selectedDay}` });
    }

    const maxAppointments = doctor.maxAppointmentsPerDay;

    const existingAppointments = await Appointment.countDocuments({
      doctorName: name,
      date,
    });

    const availableSlots = maxAppointments - existingAppointments;

    const dutyTimeParts = doctor.dutyTime.split(' - ');
    const dutyStart = dutyTimeParts[0]?.trim(); // e.g., "10:30 AM"

    return res.status(200).json({
      availableSlots,
      dutyStart,
      maxAppointments,
    });
  } catch (err) {
    console.error('Error in availability route:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




// GET all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// DELETE doctor by name
router.delete('/:name', async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ name: req.params.name });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting doctor' });
  }
});


// Update doctor details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { department, availableDays, maxAppointmentsPerDay, dutyTime } = req.body;

  try {
    const updated = await Doctor.findByIdAndUpdate(
      id,
      { department, availableDays, maxAppointmentsPerDay, dutyTime },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
