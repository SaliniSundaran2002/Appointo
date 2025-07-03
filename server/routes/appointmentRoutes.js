const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  const { doctorName, date, reason } = req.body;

  try {
    const appointmentDate = new Date(date);
    const day = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    const doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (!doctor.availableDays.includes(day)) {
      return res.status(400).json({ message: `Doctor is not available on ${day}` });
    }

    const existingAppointments = await Appointment.countDocuments({
      doctorName,
      date
    });

    if (existingAppointments >= doctor.maxAppointmentsPerDay) {
      return res.status(400).json({ message: 'No more slots available for this doctor on the selected date' });
    }

    const dutyTimeParts = doctor.dutyTime.split(' - ');
    const start = dutyTimeParts[0]; // e.g., "10:30 AM"
    const end = dutyTimeParts[1];   // e.g., "12:00 PM"

    // Parse start time
    const [startHourMin, startPeriod] = start.trim().split(' ');
    const [startHour, startMin] = startHourMin.split(':').map(Number);
    let baseHour = startPeriod === 'PM' && startHour !== 12 ? startHour + 12 : startHour;
    if (startPeriod === 'AM' && startHour === 12) baseHour = 0;
    let baseMinute = startMin;

    // Parse end time for validation
    const [endHourMin, endPeriod] = end.trim().split(' ');
    const [endHourRaw, endMin] = endHourMin.split(':').map(Number);
    let endHour = endHourRaw;
    if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
    if (endPeriod === 'AM' && endHour === 12) endHour = 0;

    // ✅ Check if booking today and current time > duty end time
    const now = new Date();
    const isToday =
      appointmentDate.getFullYear() === now.getFullYear() &&
      appointmentDate.getMonth() === now.getMonth() &&
      appointmentDate.getDate() === now.getDate();

    if (isToday) {
      const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
      const endTotalMinutes = endHour * 60 + endMin;

      if (nowTotalMinutes >= endTotalMinutes) {
        return res.status(400).json({
          message: `Doctor's duty time is over for today. Cannot book appointment.`,
        });
      }
    }

    // Calculate reporting time
    const slot = existingAppointments;
    const reportingHour = baseHour + Math.floor((slot * 10 + baseMinute) / 60);
    const reportingMinute = (baseMinute + slot * 10) % 60;

    // Format current time
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const time = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    const reportingTimeFormatted = `${(reportingHour % 12 || 12)
      .toString()
      .padStart(2, '0')}:${reportingMinute.toString().padStart(2, '0')} ${reportingHour >= 12 ? 'PM' : 'AM'
      }`;

    const newAppointment = new Appointment({
      userId: req.user.id,
      doctorName,
      date,
      time,
      reason,
      day,
      token: slot + 1,
      reportingTime: reportingTimeFormatted,
    });

    await newAppointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      token: existingAppointments + 1,
      time
    });

  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;



// Get all appointments for the logged-in user
router.get('/getAppointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(appointments);

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

module.exports = router;


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

// Cancel an appointment
router.put('/cancel/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment already cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
});


router.delete('/deleteAppointment/:id', async (req, res) => {
  try {
    console.log("DELETE appointment hit with ID:", req.params.id); // <-- Add this
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Deleted successfully' });
  } catch
  (err) {
      console.error('Delete error:', err);
      res.status(500).json({ message: 'Failed to delete appointment' });
    } 
  }
);

