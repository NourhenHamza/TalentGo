import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { ProfessorContext } from '../../context/ProfessorContext';

const ProfessorProfile = () => {
  const { profileData, getProfileData, setProfileData, dToken, backendUrl } = useContext(ProfessorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
        about: profileData.about, // Include the about field in the update data
      };

      const { data } = await axios.post(backendUrl + '/api/Professor/update-profile', updateData, {
        headers: { dToken },
      });

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    } else {
      alert('You must log in first!');
    }
  }, [dToken]);

  return (
    profileData && (
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
          {/* Profile Header */}
          <div className='bg-gradient-to-r from-primary to-secondary p-6'>
            <div className='flex flex-col sm:flex-row items-center gap-6'>
              <img
                className='w-32 h-32 rounded-full border-4 border-white shadow-lg'
                src={assets.upload_area}
                alt='Professor Profile'
              />
              <div className='text-center sm:text-left'>
                <h1 className='text-3xl font-bold text-white'>{profileData.name}</h1>
                <p className='text-gray-500 mt-1'>
                  {profileData.degree} - {profileData.speciality}
                </p>
                <span className='inline-block mt-2 px-3 py-1 text-sm font-semibold bg-white text-primary rounded-full'>
                  {profileData.experience} of Experience
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className='p-6'>
            {/* About Section */}
            <div className='mb-6'>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>About</h2>
              {isEdit ? (
                <textarea
                  value={profileData.about}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, about: e.target.value }))}
                  className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                  rows={4}
                  placeholder='Write about yourself...'
                />
              ) : (
                <p className='text-gray-600'>{profileData.about}</p>
              )}
            </div>

            {/* Fees and Address Section */}
            <div className='space-y-4'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                <p className='text-gray-700 font-medium'>Appointment Fee:</p>
                {isEdit ? (
                  <input
                    type='number'
                    value={profileData.fees}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, fees: e.target.value }))}
                    className='w-full sm:w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                ) : (
                  <p className='text-gray-800 font-semibold'>
                    {profileData.fees} {currency}
                  </p>
                )}
              </div>

              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                <p className='text-gray-700 font-medium'>Address:</p>
                {isEdit ? (
                  <input
                    type='text'
                    value={profileData.address}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                    className='w-full sm:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                ) : (
                  <p className='text-gray-800 font-semibold'>{profileData.address}</p>
                )}
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={profileData.available}
                  onChange={() => isEdit && setProfileData((prev) => ({ ...prev, available: !prev.available }))}
                  className='w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary'
                />
                <label className='text-gray-700 font-medium'>Available for Appointments</label>
              </div>
            </div>

            {/* Edit/Save Button */}
            <div className='mt-6'>
              {isEdit ? (
                <button
                  onClick={updateProfile}
                  className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all'
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEdit(true)}
                  className='px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all'
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProfessorProfile;