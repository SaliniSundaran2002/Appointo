import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";


export default function AppointmentForm() {
  const [form, setForm] = useState({
    doctorName: '',
    date: '',
    time: '',
    reason: ''
  });

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/doctors')
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (form.date && doctors.length) {
      const selectedDay = new Date(form.date).toLocaleDateString('en-US', { weekday: 'long' });
      setFilteredDoctors(
        doctors.filter(doc => doc.availableDays.includes(selectedDay))
      );
      if (
        form.doctorName &&
        !doctors.find(doc => doc.name === form.doctorName && doc.availableDays.includes(selectedDay))
      ) {
        setForm(prev => ({ ...prev, doctorName: '' }));
      }
    } else {
      setFilteredDoctors([]);
      setForm(prev => ({ ...prev, doctorName: '' }));
    }
  }, [form.date, doctors]);

  useEffect(() => {
    if (form.doctorName && form.date) {
      const selectedDay = new Date(form.date).toLocaleDateString('en-US', { weekday: 'long' });
      const selectedDoctor = doctors.find((doc) => doc.name === form.doctorName);

      if (!selectedDoctor || !selectedDoctor.availableDays.includes(selectedDay)) {
        setAvailabilityInfo(null);
        setTokenInfo(null);
        return;
      }

      axios
        .get(`http://localhost:5000/api/doctors/availability`, {
          params: { name: form.doctorName, date: form.date },
        })
        .then((res) => {
          const { availableSlots, dutyStart, maxAppointments } = res.data;

          const token = maxAppointments - availableSlots + 1;
          const hour = parseInt(dutyStart.split(':')[0]);
          const min = parseInt(dutyStart.split(':')[1]);

          const reportingHour = hour + Math.floor((token - 1) * 10 / 60);
          const reportingMin = (min + (token - 1) * 10) % 60;
          const finalHour = reportingHour % 12 || 12;
          const ampm = reportingHour >= 12 ? 'PM' : 'AM';

          const timeStr = `${finalHour}:${reportingMin.toString().padStart(2, '0')} ${ampm}`;

          setAvailabilityInfo({
            availableSlots,
            selectedDay: new Date(form.date).toLocaleDateString('en-US', { weekday: 'long' }),
          });

          setTokenInfo({
            token,
            reportingTime: timeStr,
          });

          setForm((prev) => ({
            ...prev,
            time: `${reportingHour.toString().padStart(2, '0')}:${reportingMin
              .toString()
              .padStart(2, '0')}`,
          }));
        })
        .catch((error) => {
          setAvailabilityInfo(null);
          setTokenInfo(null);
          setFormError(error.response?.data?.message || 'Error fetching availability.');
        });
    } else {
      setAvailabilityInfo(null);
      setTokenInfo(null);
    }
  }, [form.doctorName, form.date, doctors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormError('');
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const selectedDoctor = doctors.find(doc => doc.name === form.doctorName);
    if (!selectedDoctor) {
      setFormError('Doctor not found.');
      return;
    }

    const today = new Date();
    const selectedDate = new Date(form.date);
    const isToday =
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate();

    if (isToday) {
      const dutyEnd = selectedDoctor.dutyTime.split(' - ')[1];
      const [endTime, endPeriod] = dutyEnd.trim().split(' ');
      const [endHourStr, endMinStr] = endTime.split(':');

      let endHour = parseInt(endHourStr);
      const endMin = parseInt(endMinStr);

      if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
      if (endPeriod === 'AM' && endHour === 12) endHour = 0;

      const now = new Date();
      const nowTotalMins = now.getHours() * 60 + now.getMinutes();
      const endTotalMins = endHour * 60 + endMin;

      if (nowTotalMins >= endTotalMins) {
        setFormError(`Doctor's duty time is over for today.`);
        setTimeout(() => navigate('/dashboard'), 1000);
        return;
      }
    }

    try {
      await axios.post('http://localhost:5000/api/appointments', form, {
        withCredentials: true
      });
      toast.success('🎉 Appointment booked!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Booking failed.');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour);
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}${minute !== '00' ? `:${minute}` : ''}`;
  };

  const formatTimeRange = (dutyTime) => {
    if (!dutyTime) return '';
    const [start, end] = dutyTime.split(' - ');
    const formattedStart = `${formatTime(start.split(' ')[0])} ${start.split(' ')[1]}`;
    const formattedEnd = `${formatTime(end.split(' ')[0])} ${end.split(' ')[1]}`;
    return `${formattedStart} - ${formattedEnd}`;
  };

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);


  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-blue-100 to-blue-200 px-4 pt-36 sm:pt-40 font-[Poppins] flex justify-center items-start">

      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-blue-200 shadow-xl rounded-2xl px-6 py-8 space-y-5"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-center text-blue-800 mb-4 drop-shadow mt-10"
        >
          Book Appointment
        </motion.h2>


        <input
          type="date"
          name="date"
          min={new Date().toISOString().split('T')[0]}
          value={form.date}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          name="doctorName"
          value={form.doctorName}
          onChange={handleChange}
          required
          disabled={!form.date}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="">Select Doctor</option>
          {filteredDoctors.map((doc, i) => (
            <option key={i} value={doc.name}>
              {doc.name} ({doc.department}) – {formatTimeRange(doc.dutyTime)}
            </option>
          ))}
        </select>

        {availabilityInfo && (
          <p className="text-sm text-green-700">
            ✅ {availabilityInfo.availableSlots} slots available on {availabilityInfo.selectedDay}
          </p>
        )}

        {tokenInfo && (
          <div className="text-sm text-blue-800 font-medium space-y-1">
            <p>🎟 Token Number: <span className="font-bold">{tokenInfo.token}</span></p>
            <p>🕒 Reporting Time: <span className="font-bold">{tokenInfo.reportingTime}</span></p>
          </div>
        )}

        <textarea
          name="reason"
          placeholder="Reason (optional)"
          value={form.reason}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {formError && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm text-center font-medium">
            ❌ {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={!form.doctorName || !form.date}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow"
        >
          Confirm Appointment
        </button>
      </form>
    </div>
  );

}
