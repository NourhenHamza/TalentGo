import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [countdown, setCountdown] = useState(10); // Countdown timer



  // Countdown timer for redirection
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer); // Cleanup the timer
    } else {
      navigate("/"); // Redirect to homepage after countdown
    }
  }, [countdown, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md w-full mx-4">
        {/* Success Icon */}
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        

        {/* Countdown Message */}
        <p className="mt-4 text-gray-600">
          You will be redirected to the homepage in{" "}
          <span className="font-semibold text-green-600">{countdown}</span> seconds.
        </p>

        {/* Return to Homepage Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;