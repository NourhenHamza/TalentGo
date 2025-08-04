import axios from "axios"
import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const UniversityEmailCheck = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const backendUrl = "http://localhost:4000"

  const handleSubmit = async (e ) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Add validation
      if (!email || !email.includes("@")) {
        toast.error("Veuillez entrer une adresse email valide.")
        setIsLoading(false)
        return
      }

      // URL encode the email to handle special characters
      const { data } = await axios.get(`${backendUrl}/api/admin/universities/check-email/${encodeURIComponent(email)}`)

      if (data.exists) {
        if (data.status !== "approved") {
          toast.error(`Cette université n'est pas encore approuvée pour l'inscription. Statut : ${data.status}`)
          return
        }
        
        // CORRECTION ICI : Utiliser data.hasPassword au lieu de data.loginCredentials?.password
        if (data.hasPassword) { // Si un mot de passe existe déjà
          toast.error("Vous avez déjà terminé l'inscription. Veuillez vous connecter à la place.")
          // Rediriger vers la page de connexion sur le port 5174
          window.location.href = "http://localhost:5174/login"
          return
        }
        
        // Continuer uniquement si approuvé ET qu'aucun mot de passe n'existe
        navigate("/complete-registration", {
          state: {
            universityId: data._id,
            email,
          },
        } )
      } else {
        toast.error("Aucune université approuvée trouvée avec cet email.")
      }
    } catch (error) {
      console.error("Erreur :", error)
      if (error.response) {
        toast.error(error.response.data?.message || "Erreur du serveur")
      } else if (error.request) {
        toast.error("Erreur réseau - veuillez vérifier votre connexion.")
      } else {
        toast.error("Une erreur inattendue est survenue.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background elements and animations remain the same */}
      <div className="absolute inset-0 overflow-hidden">
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
          <svg viewBox="0 0 24 24" className="w-full h-full text-blue-300/40" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
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
          <svg viewBox="0 0 24 24" className="w-full h-full text-blue-400/30" fill="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </motion.div>

        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-xl bg-blue-400/10 rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-xl bg-blue-500/10 -rotate-12"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Left side - Branding and info */}
            <div className="md:col-span-2 text-center md:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="mb-6">
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Vérification d'Email</h1>
                  <p className="text-slate-500 text-lg">Portail d'Accès Sécurisé de l'Université</p>
                </div>

                <div className="hidden md:block">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold mb-4">Processus de Vérification Sécurisé</h3>
                      <p className="text-blue-50 mb-6">
                        Nous vérifions l'email de votre université pour assurer un accès sécurisé à notre plateforme de partenariat académique.
                      </p>
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
                      <p className="ml-4 text-slate-600">Vérification instantanée de l'email</p>
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
                      <p className="ml-4 text-slate-600">Accès réservé aux universités approuvées</p>
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
                      <p className="ml-4 text-slate-600">Processus d'inscription sécurisé</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side - Email verification form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-slate-100 relative">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Vérifier l'Email de l'Université</h2>
                  <p className="text-slate-500">
                    Entrez l'email de contact de votre université pour commencer le processus d'inscription.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email de Contact de l'Université <span className="text-red-500">*</span>
                    </label>
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
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e ) => setEmail(e.target.value)}
                        placeholder="admin@university.edu"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Ceci doit être l'adresse email enregistrée pour votre université dans notre système.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Note Importante</h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <p>
                            Seules les universités qui ont été pré-approuvées par notre administrateur global peuvent finaliser
                            l'inscription. Si votre université n'est pas trouvée, veuillez contacter le support.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
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
                        Vérification de l'email...
                      </>
                     ) : (
                      <>
                        Vérifier l'adresse email
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
                    Besoin d'aide ? Contactez notre équipe de support pour l'assistance à l'inscription universitaire.
                    <br />
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      support@platform.edu
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default UniversityEmailCheck
