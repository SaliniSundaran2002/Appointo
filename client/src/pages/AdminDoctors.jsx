import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    name: '',
    department: '',
    availableDays: [],
    maxAppointmentsPerDay: '',
    dutyStart: '',
    dutyEnd: '',
    dutyStartPeriod: 'AM',
    dutyEndPeriod: 'AM'
  });
  const [days] = useState([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState('');

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        availableDays: checked
          ? [...prev.availableDays, value]
          : prev.availableDays.filter((day) => day !== value)
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.dutyStart || !form.dutyEnd) {
      toast.error('Please fill in duty start and end times.');
      return;
    }

    const fullDutyTime = `${form.dutyStart} ${form.dutyStartPeriod} - ${form.dutyEnd} ${form.dutyEndPeriod}`;

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/doctors/${editingDoctorId}`, {
          department: form.department,
          availableDays: form.availableDays,
          maxAppointmentsPerDay: form.maxAppointmentsPerDay,
          dutyTime: fullDutyTime
        });
        toast.success('Doctor updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/doctors', {
          name: form.name,
          department: form.department,
          availableDays: form.availableDays,
          maxAppointmentsPerDay: form.maxAppointmentsPerDay,
          dutyTime: fullDutyTime
        });
        toast.success('Doctor added successfully!');
      }

      setForm({
        name: '',
        department: '',
        availableDays: [],
        maxAppointmentsPerDay: '',
        dutyStart: '',
        dutyEnd: '',
        dutyStartPeriod: 'AM',
        dutyEndPeriod: 'AM'
      });
      setIsEditing(false);
      setEditingDoctorId('');
      fetchDoctors();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Failed to submit. Try again!');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}${minute !== '00' ? `:${minute}` : ''}`;
  };

  const formatTimeRange = (dutyTime) => {
    if (!dutyTime || !dutyTime.includes(' - ')) return 'Duty time not set';
    const [start, end] = dutyTime.split(' - ');
    const [startTime, startPeriod] = start.split(' ');
    const [endTime, endPeriod] = end.split(' ');
    return `${formatTime(startTime)} ${startPeriod} - ${formatTime(endTime)} ${endPeriod}`;
  };

  const deleteDoctor = async (name) => {
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${encodeURIComponent(name)}`);
      fetchDoctors();
      toast.success(`Dr.${name} deleted successfully!`);
    } catch (err) {
      console.error('Error deleting doctor:', err);
      toast.error('Error deleting doctor.');
    }
  };

  const handleEdit = (doc) => {
    // Parse dutyTime: "09:00 AM - 05:00 PM"
    let startTime = '', startPeriod = 'AM', endTime = '', endPeriod = 'AM';
    if (doc.dutyTime && doc.dutyTime.includes(' - ')) {
      const [start, end] = doc.dutyTime.split(' - ');
      [startTime, startPeriod] = start.split(' ');
      [endTime, endPeriod] = end.split(' ');
    }
    setForm({
      name: doc.name,
      department: doc.department,
      availableDays: doc.availableDays,
      maxAppointmentsPerDay: doc.maxAppointmentsPerDay,
      dutyStart: startTime || '',
      dutyStartPeriod: startPeriod || 'AM',
      dutyEnd: endTime || '',
      dutyEndPeriod: endPeriod || 'AM'
    });
    setIsEditing(true);
    setEditingDoctorId(doc._id);
  };

  const handleCancelEdit = () => {
    setForm({
      name: '',
      department: '',
      availableDays: [],
      maxAppointmentsPerDay: '',
      dutyStart: '',
      dutyEnd: '',
      dutyStartPeriod: 'AM',
      dutyEndPeriod: 'AM'
    });
    setIsEditing(false);
    setEditingDoctorId('');
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Admin Doctor Management</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto space-y-4 mb-10"
      >
        <h2 className="text-xl font-semibold text-indigo-600">
          {isEditing ? 'Update Doctor' : 'Add New Doctor'}
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Doctor's Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
          disabled={isEditing}
        />

        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="" disabled>Select Department</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Dermatology">Dermatology</option>
          <option value="ENT">ENT</option>
          <option value="Gynecology">Gynecology</option>
          <option value="Oncology">Oncology</option>
          <option value="Other">Other</option>
        </select>

        <div className="flex gap-2">
          <input
            type="time"
            name="dutyStart"
            value={form.dutyStart}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <select
            name="dutyStartPeriod"
            value={form.dutyStartPeriod}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <span className="self-center">-</span>
          <input
            type="time"
            name="dutyEnd"
            value={form.dutyEnd}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <select
            name="dutyEndPeriod"
            value={form.dutyEndPeriod}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        <input
          type="number"
          name="maxAppointmentsPerDay"
          placeholder="Max Appointments/Day"
          value={form.maxAppointmentsPerDay}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <div className="flex flex-wrap gap-4">
          {days.map((day) => (
            <label key={day} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="availableDays"
                value={day}
                checked={form.availableDays.includes(day)}
                onChange={handleChange}
              />
              {day}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded ${isEditing
            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
        >
          {isEditing ? 'Update Doctor' : 'Add Doctor'}
        </button>
        {isEditing && (
          <button
            type="button"
            className="w-full py-2 rounded bg-gray-400 text-white mt-2 hover:bg-gray-500"
            onClick={handleCancelEdit}
          >
            Cancel Update
          </button>
        )}
      </form>

      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600 mb-2">All Doctors</h2>
        {doctors.length === 0 ? (
          <p className="text-center text-gray-500">No doctors added yet.</p>
        ) : (
          doctors.map((doc, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{doc.name}</h3>
                <p className="text-sm text-gray-600">
                  {doc.department} • {formatTimeRange(doc.dutyTime)} • Appointments: {doc.maxAppointmentsPerDay}/day
                </p>
                <p className="text-sm text-gray-500">Days: {doc.availableDays.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteDoctor(doc.name)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(doc)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 ml-2"
                >
                  Update
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
