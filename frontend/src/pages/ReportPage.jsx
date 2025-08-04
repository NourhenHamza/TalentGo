import WeeklyReportForm from '../components/WeeklyReportForm';
import ReportList from '../components/ReportList';

const ReportPage = () => {
  const studentId = 'user._id'; // Replace with actual ID from context or props

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Weekly Progress & Feedback
      </h1>
      <WeeklyReportForm studentId={studentId} />
      <ReportList studentId={studentId} />
    </div>
  );
};

export default ReportPage;
