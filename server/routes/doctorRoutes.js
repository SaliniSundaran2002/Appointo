const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
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
  const { name, day } = req.query;

  try {
    const doctor = await Doctor.findOne({ name });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const isAvailable = doctor.availableDays.includes(day);
    if (!isAvailable) return res.status(400).json({ message: 'Doctor not available on this day' });

    const appointmentsCount = await Appointment.countDocuments({ doctorName: name, day }); // Use `day` in your schema

    return res.status(200).json({
      availableSlots: doctor.maxAppointmentsPerDay - appointmentsCount,
      existingAppointments: appointmentsCount,
      maxAppointments: doctor.maxAppointmentsPerDay,
      dutyStart: doctor.dutyTime.split(' ')[0],
      dutyStartPeriod: doctor.dutyTime.split(' ')[1],
      availableDays: doctor.availableDays
    });
  } catch (err) {
    console.error('Availability check failed:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
router.get('/availability', async (req, res) => {
  const { name, day } = req.query;

  try {
    const doctor = await Doctor.findOne({ name });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const isAvailable = doctor.availableDays.includes(day);
    if (!isAvailable) return res.status(400).json({ message: 'Doctor not available on this day' });

    const appointmentsCount = await Appointment.countDocuments({ doctorName: name, day }); // Use `day` in your schema

    return res.status(200).json({
      availableSlots: doctor.maxAppointmentsPerDay - appointmentsCount,
      existingAppointments: appointmentsCount,
      maxAppointments: doctor.maxAppointmentsPerDay,
      dutyStart: doctor.dutyTime.split(' ')[0],
      dutyStartPeriod: doctor.dutyTime.split(' ')[1],
      availableDays: doctor.availableDays
    });
  } catch (err) {
    console.error('Availability check failed:', err);
    return res.status(500).json({ message: 'Server error' });
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
