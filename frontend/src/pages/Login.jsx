import axios from 'axios';
import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setToken, backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/login`, { email, password });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));
        localStorage.removeItem('adminToken'); // Remove adminToken
        console.log('Stored token:', data.token.substring(0, 10) + '...', 'User:', data.user);
        setToken(data.token);
        toast.success('Logged in successfully!');
        navigate(data.user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      console.log('Token detected, redirecting... User:', user);
      navigate(user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute top-0 right-0 h-64 w-64 text-blue-200/30" fill="currentColor" viewBox="0 0 100 100">
          <path d="M50 0L0 25L50 50L100 25L50 0Z" />
          <path d="M0 25V75L50 100V50L0 25Z" />
          <path d="M100 25V75L50 100V50L100 25Z" />
        </svg>
        
        <svg className="absolute bottom-0 left-0 h-64 w-64 text-blue-200/30" fill="currentColor" viewBox="0 0 100 100">
          <path d="M20 20H80V80H20V20Z" />
          <path d="M30 30H70V70H30V30Z" />
          <path d="M40 40H60V60H40V40Z" />
        </svg>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
            y: [0, -15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-32 h-32"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300/40" fill="currentColor">
            <path d="M50 0L0 25L50 50L100 25L50 0Z" />
            <path d="M15 30V70L50 90V50L15 30Z" />
            <path d="M85 30V70L50 90V50L85 30Z" />
          </svg>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.3, 0.7, 0.3],
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 left-1/4 w-24 h-24"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400/30" fill="currentColor">
            <path d="M20 20C20 20 50 80 80 20" strokeWidth="8" stroke="currentColor" fill="none" />
            <path d="M20 40H80" strokeWidth="8" stroke="currentColor" fill="none" />
            <path d="M30 60H70" strokeWidth="8" stroke="currentColor" fill="none" />
            <path d="M40 80H60" strokeWidth="8" stroke="currentColor" fill="none" />
          </svg>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/3 left-10 w-16 h-16"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300/30" fill="currentColor">
            <rect x="10" y="30" width="80" height="60" />
            <path d="M10 30L50 10L90 30" />
            <rect x="40" y="60" width="20" height="30" />
          </svg>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 text-white mb-4"
                  >
                    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Talent Go</h1>
                  <p className="text-slate-500 text-lg">Student Portal Access</p>
                </div>

                <div className="hidden md:block">
                  <div className="relative bg-blue-600 rounded-2xl shadow-xl p-8 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 20L20 60V180H180V60L100 20Z" fill="white"/>
                        <path d="M100 20L20 60H180L100 20Z" fill="white"/>
                        <path d="M60 80H80V120H60V80Z" fill="white"/>
                        <path d="M100 80H120V120H100V80Z" fill="white"/>
                        <path d="M140 80H160V120H140V80Z" fill="white"/>
                        <path d="M40 120H180V140H40V120Z" fill="white"/>
                        <path d="M90 140H110V180H90V140Z" fill="white"/>
                      </svg>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold mb-4">Manage Your Final Year Project</h3>
                      <p className="text-blue-50 mb-6">Track progress, submit deliverables, and collaborate with professors</p>
                      <motion.div 
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, 0]
                        }}
                        transition={{ 
                          y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                          rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" }
                        }}
                        className="absolute -top-4 -right-4 w-20 h-20"
                      >
                        <svg viewBox="0 0 24 24" className="w-full h-full text-white/30" fill="currentColor">
                          <path d="M12 3L1 9l11 6l11-6l-11-6M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-center"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="ml-4 text-slate-600">Real-time project tracking</p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex items-center"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="ml-4 text-slate-600">Secure document submission</p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex items-center"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="ml-4 text-slate-600">Direct professor communication</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-slate-100 relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/10 rounded-full"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full"></div>
                
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back</h2>
                  <p className="text-slate-500">Sign in to your student account</p>
                </div>
                
                <form onSubmit={onSubmitHandler} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        className="w-full pl-10 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder="your.email@university.edu"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-slate-700">Password</label>
                      <p
                        onClick={() => navigate('/reset-password')}
                        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Forgot password?
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        className="w-full pl-10 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type={showPassword ? 'text' : 'password'}
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500 hover:text-blue-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                      Remember me for 30 days
                    </label>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        Sign in
                        <svg className="ml-2 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">or</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-slate-600">
                      Don't have an account?{' '}
                      <span
                        onClick={() => navigate('/signup')}
                        className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer"
                      >
                        Create account
                      </span>
                    </p>
                  </div>
                </form>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-6 -right-6 w-24 h-24 hidden md:block"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut"
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full text-blue-400/50" fill="currentColor">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z" />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;