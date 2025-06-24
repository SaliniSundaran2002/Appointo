import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AppointmentForm() {
  const [form, setForm] = useState({
    doctorName: '',
    date: '',
    time: '',
    reason: ''
  });

  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/doctors')
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (form.doctorName && form.date) {
      const selectedDay = new Date(form.date).toLocaleDateString('en-US', {
        weekday: 'long',
      });

      // Get doctor info from local doctor list
      const selectedDoctor = doctors.find((doc) => doc.name === form.doctorName);

      if (!selectedDoctor) {
        setAvailabilityInfo(null);
        setTokenInfo(null);
        toast.error('Selected doctor not found');
        return;
      }

      const isAvailable = selectedDoctor.availableDays.includes(selectedDay);

      if (!isAvailable) {
        setAvailabilityInfo(null);
        setTokenInfo(null);
        toast.warn(`Doctor is not available on ${selectedDay}. Please choose another day.`);
        return;
      }

      // If available, proceed to get available slots
      axios
        .get(`http://localhost:5000/api/doctors/availability`, {
          params: { name: form.doctorName, date: form.date },
        })
        .then((res) => {
          const { availableSlots, dutyStart, dutyStartPeriod, maxAppointments } = res.data;

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
            selectedDay,
          });

          setTokenInfo({
            token,
            reportingTime: timeStr,
          });
        })
        .catch(() => {
          toast.error('Failed to check availability');
          setAvailabilityInfo(null);
          setTokenInfo(null);
        });
    } else {
      setAvailabilityInfo(null);
      setTokenInfo(null);
    }
  }, [form.doctorName, form.date, doctors]);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:5000/api/appointments', form, {
        withCredentials: true
      });
      toast.success('Appointment booked successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Booking failed');
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-blue-800">Book Appointment</h2>

        <select
          name="doctorName"
          value={form.doctorName}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc, i) => (
            <option key={i} value={doc.name}>
              {doc.name} ({doc.department}) - {formatTimeRange(doc.dutyTime)}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        {availabilityInfo && (
          <p className="text-green-600 text-sm">
            {availabilityInfo.availableSlots} slots left on {availabilityInfo.selectedDay}
          </p>
        )}

        {tokenInfo && (
          <div className="text-blue-600 text-sm">
            Token Number: <strong>{tokenInfo.token}</strong><br />
            Reporting Time: <strong>{tokenInfo.reportingTime}</strong>
          </div>
        )}

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <textarea
          name="reason"
          placeholder="Reason (optional)"
          value={form.reason}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Confirm Appointment
        </button>
      </form>
    </div>
  );
}
