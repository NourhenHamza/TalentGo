import { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const WeeklyReportForm = () => {
  const { user } = useContext(AppContext);
  const [week, setWeek] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await axios.post('/api/reports', {
        studentId: user._id,
        week,
        content,
      });

      toast.success('Report submitted successfully!');
      setWeek('');
      setContent('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit report');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md w-full max-w-lg mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Submit Weekly Progress</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Week</label>
        <input
          type="text"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="e.g. Week 3"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Progress Description</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="What did you work on this week?"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Submit Report
      </button>
    </form>
  );
};

export default WeeklyReportForm;
