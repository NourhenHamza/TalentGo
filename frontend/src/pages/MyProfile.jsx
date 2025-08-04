import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext';
import { assets } from './../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const {userData,setUserData ,token,backendUrl,loadUserProfilData}=useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const navigate = useNavigate()

  const updataUserProfileData = async () => {
    try {
      const formdata = new FormData()
      formdata.append('name', userData.name)
      formdata.append('phone', userData.phone)
      formdata.append('address', userData.address)
      formdata.append('gender', userData.gender)
      formdata.append('dateOfBirth', userData.dateOfBirth)
      
      image && formdata.append('image', image)
      
      const {data}= await axios.post(backendUrl + '/api/user/update-profile',formdata,{headers:{token}})
      
      if (data.success) {
        toast.success(data.message)
        await loadUserProfilData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      
    }
    
  }

  useEffect(() => {
    if (!token) {
      alert("create an account before !!")
      navigate('/signup')
    }
  },[token])
  return userData &&  (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      {
        isEdit 
          ? <label htmlFor="image">
            <div className='inline-block relative cursor-pointer'>
              <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image):userData.image} alt="" />
              <img className='w-10 absolute bottom-12 right-12' src={image ?"": assets.upload_icon} alt="" />
            </div>
            <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden />
          </label>
          :  <img className='w-36 rounded' src={userData.image} alt="" />
      }
     
      {
        isEdit
          ? <input className='bg-gray-50 text-3xl font-medium max-w-60 mt-4' type="text" value={userData.name} onChange={(e)=>setUserData(prev=>({...prev,name:e.target.value}))} />
          : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name }</p>
      }
      <hr className='bg-zinc-400 h-[1px] border-none' />
      <div>
        <p className='text-primary underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Email </p>
          {
        isEdit
          ? <input className='bg-gray-100 max-w-52' type="text" value={userData.email} onChange={(e)=>setUserData(prev=>({...prev,email:e.target.value}))} />
          : <p className='text-primary'>{userData.email }</p>
          }
          
          <p className='font-medium'>Phone</p>
          {
        isEdit
          ? <input className='bg-gray-100 max-w-52' type="text" value={userData.phone} onChange={(e)=>setUserData(prev=>({...prev,phone:e.target.value}))} />
          : <p className='text-primary'>{userData.phone }</p>
          }
          <p className='font-medium'>Adresse</p>
            {
        isEdit
          ? <input className='bg-gray-100' type="text" value={userData.address} onChange={(e)=>setUserData(prev=>({...prev,address:e.target.value}))} />
          : <p className='text-primary'>{userData.address }</p>
          }
        

        </div>
      </div>
      <div>
        <p className='text-primary underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender</p>
          {
            isEdit
              ? <select className='max-w-20 bg-gray-100' onChange={(e)=>setUserData(prev=>({...prev,gender:e.target.value}))} value={userData.gender} >
                <option value="Male">Male</option>
                 <option value="Female">Female</option>
              </select>
              : <p className='text-primary'>{ userData.gender}</p>
          }
          <p className='font-medium'>Birthday</p>
          {
            isEdit
              ? <input className='bg-gray-100 max-w-28' type="date" value={userData.dateOfBirth} onChange={(e)=>setUserData(prev=>({...prev , dateOfBirth:e.target.value}))} />
              : <p className='text-primary'>{ userData.dateOfBirth}</p>
          }
        </div>

      </div>
      <div className='mt-10'>
        {
          isEdit
            ? <button className='border border-primary rounded-full px-8 py-2 hover:bg-primary transition-all' onClick={updataUserProfileData}> Save Information</button>
            : <button className='border border-primary rounded-full px-8 py-2  hover:bg-primary transition-all'  onClick={()=> setIsEdit(true)} >Edit</button>
        }
      </div>

      
    </div>
  ) 
  
}

export default MyProfile
