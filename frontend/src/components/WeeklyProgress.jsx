import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { StudentContext } from "../context/StudentContext"; // Adjust path as needed

const WeeklyProgress = () => {
  const [progressText, setProgressText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the apiClient from StudentContext which has proper auth headers
  const { apiClient } = useContext(StudentContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the configured apiClient instead of raw axios
      const response = await apiClient.post('/progress/submit', {
        progress: progressText,
        fileUrl: fileUrl,
        week: 1,
      });

      toast.success("Progress submitted successfully");
      setProgressText("");
      setFileUrl("");
    } catch (error) {
      console.error("Error submitting progress:", error);
      
      // Better error handling
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Weekly Progress Report
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Your Progress
          </label>
          <textarea
            rows="6"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what you worked on this week..."
            value={progressText}
            onChange={(e) => setProgressText(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            File URL
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your draft Github repository URL"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !progressText.trim()}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Progress"}
        </button>
      </form>
    </div>
  );
};

export default WeeklyProgress;