import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FailPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(20); // Countdown timer (20 seconds)

  // Redirect to homepage after 20 seconds
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer); // Cleanup the timer
    } else {
      navigate("/"); // Redirect to homepage after countdown
    }
  }, [countdown, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md w-full mx-4">
        {/* Failure Icon */}
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        

        {/* Countdown Message */}
        <p className="mt-4 text-gray-600">
          You will be redirected to the homepage in{" "}
          <span className="font-semibold text-red-600">{countdown}</span> seconds.
        </p>

     
      </div>
    </div>
  );
};

export default FailPage;