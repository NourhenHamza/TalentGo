import React, { useEffect } from 'react'
import { useContext } from 'react';
import { useRef } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const VerifyEmail = () => {
   axios.defaults.withCredentials=true

  const { backendUrl, userData, loadUserProfilData,token } = useContext(AppContext)
  const navigate=useNavigate()


 
  const inputRefs = React.useRef([])
  
  const handleInput = (e,index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length-1) {
        inputRefs.current[index+1].focus()
      }
  }
  
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
       inputRefs.current[index-1].focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value=char
      }
      
    })
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
     
      const otpArray = inputRefs.current.map(e => e.value)
      
      const otp = otpArray.join('')

      const {data}=await axios.post(backendUrl+'/api/user/verify-account',{otp})
      if (data.success) {
        toast.success(data.message)
        navigate('/')
        
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
    
  }
 
  return (
      
       <div className="min-h-screen flex items-center justify-center relative bg-cover bg-center" style={{ backgroundImage: `url(${assets.DocAdm})` }}>
      <div className="absolute inset-0 bg-primary/40"></div>
         
      <form 
        onSubmit={onSubmitHandler}
             
                 className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-2xl z-10"
               >
                 <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                   Email verify otp
        </h1>
        <p className='mb-4 text-center text-primary'>Enter the 6-digit code sent to your email id</p>
                
         
                 <div className="mb-8 justify-between flex " onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input
                     className="w-12 h-12 text-white text-center text-xl rounded-md bg-[#333A5C]"
                      key={index}
                      type="text"
                      maxLength='1'
                   required
              ref={e => inputRefs.current[index] = e}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              
                   />
                     
                   ))}
                   
                 </div>
         
                 
                 <button
                  
                   className="w-full hover:bg-primary/40 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
                  type='submit'
                 >
                Verify email
                 </button>
         
                
               </form>
             </div>
           );
      
   
  
}

export default VerifyEmail
