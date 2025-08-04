import axios from "axios"
import { motion } from "framer-motion"
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { AdminContext } from "../context/AdminContext"
import { ProfessorContext } from "../context/ProfessorContext"

const ProfessorLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  const { backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(ProfessorContext)
  const navigate = useNavigate()


  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await axios.post("http://localhost:4000/api/Professor/login", { email, password })
      if (data.success) {
        localStorage.setItem("dToken", data.token)
        setDToken(data.token)
        toast.success("Professor logged in successfully!")
        navigate("/Professor-dashboard")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
 
    }
  }

  // Example: Storing the token after login
  const handleLogin = async (email, password) => {
    try {
        const response = await axios.post('http://localhost:4000/api/Professor/login', { email, password });
        if (response.data.success) {
            localStorage.setItem('professorToken', response.data.token); // Store the token
            console.log("Token stored in localStorage:", response.data.token);
        } else {
            console.error("Login failed:", response.data.message);
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* University-themed background patterns */}
        <svg className="absolute top-0 right-0 h-64 w-64 text-blue-200/30" fill="currentColor" viewBox="0 0 100 100">
          <path d="M50 0L0 25L50 50L100 25L50 0Z" />
          <path d="M0 25V75L50 100V50L0 25Z" />
          <path d="M100 25V75L50 100V50L100 25Z" />
        </svg>

        <svg className="absolute bottom-0 left-0 h-64 w-64 text-blue-200/30" fill="currentColor" viewBox="0 0 100 100">
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
            rotate: [0, 5, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 8,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 w-32 h-32"
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
            rotate: [0, -5, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 10,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 left-1/4 w-24 h-24"
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
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Branding and info */}
            <div className="hidden md:block">
              <div className="mb-8">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 text-white mb-4"
                >
                  <svg
                    className="w-8 h-8"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Professor Portal</h1>
                <p className="text-slate-500 text-lg">PFE Supervision Dashboard</p>
              </div>

              <div className="relative bg-blue-600 rounded-2xl shadow-xl p-8 text-white overflow-hidden mb-8">
                {/* University lecture hall illustration */}
                <div className="absolute inset-0 opacity-10">
                  <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 40H180V160H20V40Z" fill="white" />
                    <path d="M20 40H180V60H20V40Z" fill="white" />
                    <path d="M40 70H60V90H40V70Z" fill="white" />
                    <path d="M70 70H90V90H70V70Z" fill="white" />
                    <path d="M100 70H120V90H100V70Z" fill="white" />
                    <path d="M130 70H150V90H130V70Z" fill="white" />
                    <path d="M40 100H60V120H40V100Z" fill="white" />
                    <path d="M70 100H90V120H70V100Z" fill="white" />
                    <path d="M100 100H120V120H100V100Z" fill="white" />
                    <path d="M130 100H150V120H130V100Z" fill="white" />
                    <path d="M80 130H120V160H80V130Z" fill="white" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-4">Guide Student Projects</h3>
                  <p className="text-blue-50 mb-6">Supervise and evaluate student progress effectively</p>

                  {/* Animated professor icon */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      y: { repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" },
                      rotate: { repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" },
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
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
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
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
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
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="ml-4 text-slate-600">Evaluate project milestones</p>
                </motion.div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div>
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-slate-100 relative">
                {/* Decorative elements */}
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/10 rounded-full"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full"></div>

                {/* Animated books */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -top-6 -right-6 w-16 h-16 hidden md:block"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                      y: [0, -5, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 5,
                      ease: "easeInOut",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full text-blue-400/50" fill="currentColor">
                      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                    </svg>
                  </motion.div>
                </motion.div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Professor Login</h2>
                  <p className="text-slate-500">Sign in to access your supervision dashboard</p>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      </div>
                      <input
                        className="w-full pl-10 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="professor@university.edu"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-slate-700">Password</label>
                      <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">Forgot password?</p>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        className="w-full pl-10 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500 hover:text-blue-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide" : "Show"}
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
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        Sign in to Dashboard
                        <svg
                          className="ml-2 w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-slate-500 text-sm">
                    Need help accessing your account?
                    <br />
                    Contact IT support at <span className="text-blue-600 font-medium">support@university.edu</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfessorLogin

