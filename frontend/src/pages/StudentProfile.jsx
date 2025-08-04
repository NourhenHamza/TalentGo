import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

// --- Icons for a polished UI ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AcademicCapIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
const LocationIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const DocumentTextIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const EditIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const CancelIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;


const StudentProfile = ( ) => {
  const { userData, token, backendUrl, loadUserProfileData, loadingUser } = useContext(AppContext);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        phone: userData.profile?.phone || '',
        linkedin: userData.profile?.linkedin || '',
        bio: userData.profile?.bio || '',
        address: {
          street: userData.profile?.address?.street || '',
          city: userData.profile?.address?.city || '',
          zipCode: userData.profile?.address?.zipCode || '',
          country: userData.profile?.address?.country || 'Tunisia',
        },
        specialization: userData.specialization || '',
        currentClass: userData.currentClass || '',
        academicYear: userData.academicYear || '',
        gpa: userData.studentData?.gpa ?? '',
      });
    }
  }, [userData]);

  const getCVUrl = (filename) => {
    if (!filename) return null;
    return `${backendUrl}/uploads/cvs/${filename}`;
  };

  const handleCVView = (filename) => {
    if (!filename) {
      toast.error("CV filename is missing.");
      return;
    }
    const cvUrl = getCVUrl(filename);
    const newWindow = window.open(cvUrl, '_blank');
    if (!newWindow) {
      toast.error("Popup was blocked. Please allow popups for this site.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Profile updated successfully!');
        await loadUserProfileData();
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Profile update failed.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingUser || !userData) {
    return <div className="flex justify-center items-center h-full w-full text-slate-500">Loading Profile...</div>;
  }

  return (
    // This main div is designed to fill the content area next to a sidebar
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* --- Floating Header --- */}
        <div className="sticky top-4 z-10 mb-8">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{userData.name}</h1>
                        <p className="text-sm sm:text-base text-slate-500 mt-1">{userData.university?.name || 'University not specified'}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button 
                            onClick={() => handleCVView(userData.primaryCV?.filename)}
                            disabled={!userData.primaryCV?.filename}
                            className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            <DocumentTextIcon />
                            View CV
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center justify-center px-3 py-2 rounded-lg font-semibold text-sm transition w-32 text-center ${
                                isEditing
                                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isEditing ? <><CancelIcon />Cancel</> : <><EditIcon />Edit Profile</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Profile Form Content --- */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <ProfileSection icon={<UserIcon />} title="Personal & Contact Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" value={userData.name} disabled />
                <InputField label="Email Address" value={userData.email} disabled />
                <InputField label="National ID (CIN)" value={userData.cin} disabled />
                <InputField label="Date of Birth" value={new Date(userData.dateOfBirth).toLocaleDateString()} disabled />
                <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
                <InputField label="LinkedIn Profile" name="linkedin" value={formData.linkedin} onChange={handleInputChange} disabled={!isEditing} placeholder="https://linkedin.com/in/..." />
              </div>
              <TextAreaField label="Biography" name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} placeholder="Tell us about yourself, your skills, and career goals..." />
            </ProfileSection>

            <ProfileSection icon={<LocationIcon />} title="Address Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Street" name="street" value={formData.address?.street} onChange={handleAddressChange} disabled={!isEditing} />
                    <InputField label="City" name="city" value={formData.address?.city} onChange={handleAddressChange} disabled={!isEditing} />
                    <InputField label="ZIP Code" name="zipCode" value={formData.address?.zipCode} onChange={handleAddressChange} disabled={!isEditing} />
                    <InputField label="Country" name="country" value={formData.address?.country} onChange={handleAddressChange} disabled={!isEditing} />
                </div>
            </ProfileSection>

            <ProfileSection icon={<AcademicCapIcon />} title="Academic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Study Level" value={userData.studyLevel} disabled />
                <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} disabled={!isEditing} />
                <InputField label="Current Class" name="currentClass" value={formData.currentClass} onChange={handleInputChange} disabled={!isEditing} />
                <InputField label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleInputChange} disabled={!isEditing} placeholder="YYYY-YYYY" />
                <InputField label="GPA" name="gpa" type="number" value={formData.gpa} onChange={handleInputChange} disabled={!isEditing} />
              </div>
            </ProfileSection>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                className="mt-8 flex justify-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
             )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

// --- Reusable Form Components ---
const ProfileSection = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
    <div className="flex items-center mb-4 border-b border-slate-200 pb-4">
      <div className="text-blue-600 mr-3">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="space-y-6 pt-2">{children}</div>
  </div>
);

const InputField = ({ label, value, disabled, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
    <input
      value={value ?? ''}
      disabled={disabled}
      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg transition duration-200 ${
        disabled ? 'text-slate-500 bg-slate-100 cursor-not-allowed border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      }`}
      {...props}
    />
  </div>
);

const TextAreaField = ({ label, value, disabled, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <textarea
        value={value ?? ''}
        disabled={disabled}
        rows={4}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg transition duration-200 ${
          disabled ? 'text-slate-500 bg-slate-100 cursor-not-allowed border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }`}
        {...props}
      />
    </div>
  );

export default StudentProfile;
