// components/AdaptedSignup.jsx - Student Registration Form with Enhanced UI/UX
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

// --- Reusable SVG Icons ---
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const AcademicCapIcon = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
);
const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const SignupStudent = () => {
  // --- All original state and logic remains unchanged ---
  const [isLoading, setIsLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    cin: '', dateOfBirth: '', gender: '', university: '',
    studyLevel: '', specialization: '', currentClass: '', academicYear: '',
    phone: '', city: '', street: '', zipCode: '', country: 'Tunisia',
    linkedin: '', bio: '', gpa: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setToken, backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const studyLevelOptions = [
    { value: 'licence', label: 'Licence' },
    { value: 'master', label: 'Master' },
    { value: 'cycle_ingenieur', label: 'Cycle d\'Ingénieur' },
    { value: 'doctorat', label: 'Doctorat' }
  ];
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  useEffect(() => {
    if (token) navigate('/student-dashboard');
    const fetchUniversities = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/universities/approved`);
        if (data.success) setUniversities(data.universities);
      } catch (error) {
        toast.error('Error loading universities');
      }
    };
    fetchUniversities();
  }, [token, navigate, backendUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('CV must be in PDF, DOC, or DOCX format');
        e.target.value = '';
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('CV file size must not exceed 5MB');
        e.target.value = '';
        return;
      }
      setCvFile(file);
      if (errors.cv) setErrors(prev => ({ ...prev, cv: '' }));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error('Please correct the errors before submitting.');
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });
      if (cvFile) formDataToSend.append('cv', cvFile);

      const { data } = await axios.post(`${backendUrl}/api/user/register`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        toast.success("Account created successfully!");
        navigate('/student-dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (!formData.cin.trim()) newErrors.cin = 'CIN is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.university) newErrors.university = 'University is required';
    if (!formData.studyLevel) newErrors.studyLevel = 'Study level is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.currentClass.trim()) newErrors.currentClass = 'Current class is required';
    if (!formData.academicYear.trim()) newErrors.academicYear = 'Academic year is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!cvFile) newErrors.cv = 'CV upload is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.cin && !/^\d{8}$/.test(formData.cin)) newErrors.cin = 'CIN must be exactly 8 digits';
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge < 16) newErrors.dateOfBirth = 'You must be at least 16 years old';
    }
    if (formData.academicYear && !/^\d{4}-\d{4}$/.test(formData.academicYear)) newErrors.academicYear = 'Academic year format should be YYYY-YYYY';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Enhanced UI ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-4">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-5 gap-8 items-start">
            {/* Left side - Branding and Info */}
            <div className="md:col-span-2 text-center md:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="mb-6">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 text-white mb-4"
                  >
                    <AcademicCapIcon />
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Student Portal</h1>
                  <p className="text-slate-500 text-lg">Embark on Your Career Journey</p>
                </div>

                <div className="hidden md:block mt-8 space-y-4">
                  <InfoPoint delay={0.3} text="Showcase your skills and projects" />
                  <InfoPoint delay={0.4} text="Connect with innovative companies" />
                  <InfoPoint delay={0.5} text="Find your perfect internship" />
                </div>
              </motion.div>
            </div>

            {/* Right side - Registration Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-slate-100">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Your Student Account</h2>
                  <p className="text-slate-500">Fill in your details to get started.</p>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                  {/* --- Form Sections --- */}
                  <FormSection title="Personal Information" number={1}>
                    <InputField label="Full Name *" name="name" value={formData.name} onChange={handleInputChange} error={errors.name} placeholder="e.g., Jane Doe" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="CIN Number *" name="cin" value={formData.cin} onChange={handleInputChange} error={errors.cin} maxLength="8" placeholder="8 digits" />
                      <InputField label="Date of Birth *" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} error={errors.dateOfBirth} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Gender *" name="gender" value={formData.gender} options={genderOptions} onChange={handleInputChange} error={errors.gender} />
                        <InputField label="Phone *" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone} placeholder="+216 XX XXX XXX" />
                    </div>
                  </FormSection>

                  <FormSection title="Account & Contact" number={2}>
                    <InputField label="Email *" type="email" name="email" value={formData.email} onChange={handleInputChange} error={errors.email} placeholder="you@university.com" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PasswordField label="Password *" name="password" value={formData.password} onChange={handleInputChange} error={errors.password} show={showPassword} toggleShow={() => setShowPassword(!showPassword)} />
                        <PasswordField label="Confirm Password *" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} show={showConfirmPassword} toggleShow={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="City *" name="city" value={formData.city} onChange={handleInputChange} error={errors.city} />
                        <InputField label="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} error={errors.zipCode} />
                    </div>
                    <InputField label="Street Address" name="street" value={formData.street} onChange={handleInputChange} error={errors.street} />
                  </FormSection>

                  <FormSection title="Academic Information" number={3}>
                    <SelectField label="University *" name="university" value={formData.university} options={universities.map(u => ({ value: u._id, label: u.name }))} onChange={handleInputChange} error={errors.university} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Study Level *" name="studyLevel" value={formData.studyLevel} options={studyLevelOptions} onChange={handleInputChange} error={errors.studyLevel} />
                        <InputField label="Specialization *" name="specialization" value={formData.specialization} onChange={handleInputChange} error={errors.specialization} placeholder="e.g., Software Engineering" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Current Class *" name="currentClass" value={formData.currentClass} onChange={handleInputChange} error={errors.currentClass} placeholder="e.g., 5th Year" />
                        <InputField label="Academic Year *" name="academicYear" value={formData.academicYear} onChange={handleInputChange} error={errors.academicYear} placeholder="e.g., 2024-2025" />
                    </div>
                  </FormSection>

                  <FormSection title="Documents & Profile" number={4}>
                    <FileUploadField label="Upload CV (Required) *" accept=".pdf,.doc,.docx" onChange={handleCvUpload} error={errors.cv} selectedFile={cvFile} helperText="Max 5MB. PDF, DOC, or DOCX format." />
                    <InputField label="GPA (Optional)" name="gpa" type="number" step="0.01" min="0" max="4" value={formData.gpa} onChange={handleInputChange} error={errors.gpa} placeholder="e.g., 3.5" />
                    <InputField label="LinkedIn Profile (Optional)" name="linkedin" value={formData.linkedin} onChange={handleInputChange} error={errors.linkedin} placeholder="https://linkedin.com/in/yourprofile" />
                    <TextAreaField label="Bio (Optional )" name="bio" value={formData.bio} onChange={handleInputChange} error={errors.bio} placeholder="Tell us a bit about your skills and career goals..." />
                  </FormSection>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center justify-center mt-8 disabled:bg-gray-400"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                     ) : 'Create Account'}
                  </motion.button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                  Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:underline">Login here</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Reusable UI Components ---

const FormSection = ({ number, title, children }) => (
  <div className="space-y-4 pt-6 border-t border-slate-200 first:border-t-0 first:pt-0">
    <div className="flex items-center space-x-3 mb-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-blue-600 font-semibold">{number}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoPoint = ({ delay, text }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-center"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
      <CheckIcon />
    </div>
    <p className="ml-4 text-slate-600">{text}</p>
  </motion.div>
);

const InputField = ({ label, type = 'text', name, value, onChange, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

const TextAreaField = ({ label, name, value, onChange, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, options, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-no-repeat bg-right pr-8`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e" )`, backgroundPosition: 'right 0.7rem center', backgroundSize: '1.5em 1.5em' }}
    >
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

const PasswordField = ({ label, name, value, onChange, error, show, toggleShow }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12`}
        placeholder="Min. 8 characters"
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute inset-y-0 right-0 px-4 flex items-center text-sm text-gray-600 hover:text-gray-800"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

const FileUploadField = ({ label, accept, onChange, error, selectedFile, helperText }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <label className={`flex justify-center w-full h-32 px-4 transition bg-slate-50 border-2 ${error ? 'border-red-500' : 'border-slate-200'} border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-400 focus:outline-none`}>
            <span className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-medium text-gray-600">
                    {selectedFile ? 'File selected' : 'Drop file or click to upload'}
                </span>
            </span>
            <input type="file" accept={accept} onChange={onChange} className="hidden" />
        </label>
        {selectedFile && (
            <p className="text-sm text-green-600 mt-1.5">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024 ).toFixed(2)} MB)
            </p>
        )}
        {helperText && <p className="text-xs text-gray-500 mt-1.5">{helperText}</p>}
        {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
);

export default SignupStudent;
