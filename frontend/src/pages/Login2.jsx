import { motion } from 'framer-motion';
import React, { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../context/AppContext";

const Login2 = () => {
  const { setAToken, setDToken, backendUrl, aToken, dToken } = useContext(AppContext);
  const navigate = useNavigate();

  const onSubmitHandler = (event) => {
    event.preventDefault();
    window.open("http://localhost:5174/Professor-login", "_blank");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* University-themed background patterns */}
        <svg className="absolute top-0 left-0 h-64 w-64 text-blue-200/30" fill="currentColor" viewBox="0 0 100 100">
          <path d="M20 20H80V80H20V20Z" />
          <path d="M30 30H70V70H30V30Z" />
          <path d="M40 40H60V60H40V40Z" />
        </svg>
        
        <svg className="absolute bottom-0 right-0 h-64 w-64 text-blue-200/30" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="20" />
        </svg>
        
        {/* Animated floating elements */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.7, 0.3],
            y: [0, -15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300/40" fill="currentColor">
            <path d="M50 10L10 90H90L50 10Z" />
            <path d="M50 30L30 70H70L50 30Z" />
          </svg>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.6, 0.2],
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-24 h-24"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400/30" fill="currentColor">
            <path d="M10 40H90V60H10V40Z" />
            <path d="M40 10H60V90H40V10Z" />
          </svg>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="grid md:grid-cols-2">
              {/* Left side - Image and info */}
              <div className="p-8 md:p-10 order-2 md:order-1">
                <div className="h-full flex flex-col">
                  <div className="mb-8">
                    <motion.div 
                      whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500 text-white mb-4"
                    >
                      <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Professor Portal</h2>
                    <p className="text-slate-500 mb-6">Access your dashboard to manage student projects</p>
                  </div>
                  
                  <div className="relative bg-blue-600 rounded-2xl shadow-lg p-6 text-white overflow-hidden mb-8 flex-grow">
                    {/* University lecture hall illustration */}
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 40H180V160H20V40Z" fill="white"/>
                        <path d="M20 40H180V60H20V40Z" fill="white"/>
                        <path d="M40 70H60V90H40V70Z" fill="white"/>
                        <path d="M70 70H90V90H70V70Z" fill="white"/>
                        <path d="M100 70H120V90H100V70Z" fill="white"/>
                        <path d="M130 70H150V90H130V70Z" fill="white"/>
                        <path d="M40 100H60V120H40V100Z" fill="white"/>
                        <path d="M70 100H90V120H70V100Z" fill="white"/>
                        <path d="M100 100H120V120H100V100Z" fill="white"/>
                        <path d="M130 100H150V120H130V100Z" fill="white"/>
                        <path d="M80 130H120V160H80V130Z" fill="white"/>
                      </svg>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold mb-3">Guide Student Projects</h3>
                      <p className="text-blue-50">Supervise and evaluate student progress effectively</p>
                      
                      {/* Animated professor icon */}
                      <motion.div 
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, 0]
                        }}
                        transition={{ 
                          y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                          rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" }
                        }}
                        className="absolute -top-4 -right-4 w-16 h-16"
                      >
                        <svg viewBox="0 0 24 24" className="w-full h-full text-white/30" fill="currentColor">
                          <path d="M20 17a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9.46c.35.61.54 1.3.54 2h10v11h-9v2h9zM15 7v2H9v13H7v-6H5v6H3v-8H1.5V9a2 2 0 0 1 2-2H15zM8 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
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
                      <p className="ml-4 text-slate-600">Review student submissions</p>
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
                      <p className="ml-4 text-slate-600">Schedule consultations</p>
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
                      <p className="ml-4 text-slate-600">Evaluate project milestones</p>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Login button */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 md:p-10 flex flex-col justify-center order-1 md:order-2 relative overflow-hidden">
                {/* Academic pattern background */}
                <div className="absolute inset-0">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                    <g opacity="0.1" stroke="white" strokeWidth="1">
                      <path d="M0 20H100" />
                      <path d="M0 40H100" />
                      <path d="M0 60H100" />
                      <path d="M0 80H100" />
                      <path d="M20 0V100" />
                      <path d="M40 0V100" />
                      <path d="M60 0V100" />
                      <path d="M80 0V100" />
                    </g>
                  </svg>
                </div>
                
                {/* Animated academic elements */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 right-10 w-20 h-20"
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white/20" fill="currentColor">
                    <path d="M12 3L1 9l11 6l11-6l-11-6M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    y: [0, 10, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 7,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-10 left-10 w-16 h-16"
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white/20" fill="currentColor">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                  </svg>
                </motion.div>
                
                <div className="text-center mb-10 relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Professor Access</h2>
                  <p className="text-blue-100">Sign in to your professor account to manage student projects</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onSubmitHandler}
                  className="bg-white text-blue-600 py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 group relative z-10"
                >
                  <span>Login to Professor Dashboard</span>
                  <svg 
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
                
                <div className="mt-12 text-center relative z-10">
                  <p className="text-blue-100 text-sm">
                    Need help accessing your account?<br />
                    Contact IT support at <span className="text-white font-medium">support@university.edu</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login2;
