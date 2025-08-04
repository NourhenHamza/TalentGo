import React, { useContext, useState, useRef } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
   const [showPassword, setShowPassword] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while sending the OTP.');
      console.error(error);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(input => input.value);
    setOtp(otpArray.join(''));
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/reset-password`, { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while resetting the password.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-cover bg-center" style={{ backgroundImage: `url(${assets.DocAdm})` }}>
      <div className="absolute inset-0 bg-primary/40"></div>

      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-2xl z-10">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Reset password</h1>
          <p className="mb-4 text-center text-primary">Enter your registered email address</p>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/40 text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      )}

      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOtp} className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-2xl z-10">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Reset password OTP</h1>
          <p className="mb-4 text-center text-primary">Enter the 6-digit code sent to your email id</p>
          <div className="mb-8 justify-between flex" onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input
                className="w-12 h-12 text-white text-center text-xl rounded-md bg-[#333A5C]"
                key={index}
                type="text"
                maxLength="1"
                required
                ref={el => inputRefs.current[index] = el}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>
          <button
            className="w-full hover:bg-primary/40 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
            type="submit"
          >
            Submit
          </button>
        </form>
      )}

      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-2xl z-10">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">New password</h1>
          <p className="mb-4 text-center text-primary">Enter the new password below</p>
          <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <div className="relative">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              type={showPassword ? 'text' : 'password'}
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
          <button
            className="w-full bg-primary hover:bg-primary/40 text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;