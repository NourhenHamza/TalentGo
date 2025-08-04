import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
 
import axios from 'axios'
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from './../config/emailTemplates.js'
import asyncHandler from 'express-async-handler';

 

// User login API
const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User does not exist' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          studentData: user.studentData,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
             httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?
            'none': 'strict',
           
            
        })

        return res.json({success:true,message:"Logged Out"})
        
    } catch (error) {
       console.log(error);
        res.json({ success: false, message: error.message }); 
    }
}
// Send verification otp to user email
const sendVerifyOtp = async (req, res) => {
    try {

        const { userId } = req.body
        
        const user = await userModel.findById(userId)
        
        if (user.isAccountVerified) {
            return res.json({success:false,message:"Account Already verified"})
            
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
        
        await user.save()

        const mailOption = {
           from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification Otp',
           // text: `Your OTP is ${otp} . Verify your account using this OTP`,
            html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }

        await transporter.sendMail(mailOption)
        return res.json({success:true,message:"Verification Otp sent on your email"})
        
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
    }
}


const verifyEmail = async (req, res) => {
    const { userId,otp } = req.body

    if (!userId || !otp) {
       return res.json({success:false,message:"Missing Details"})
    }
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({success:false,message:"User not found"})
            
        }
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({success:false,message:"Invalid OTP"})
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({success:false,message:"OTP Expired"}) 
        }

        user.isAccountVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0
        
        await user.save()

        return res.json({success:true,message:"Email verified Successfully"}) 
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
        
    }
    
}

// Send Password Reset Otp

const sendResetOtp = async (req, res) => {
    const { email } = req.body
    
    if (!email) {
        return res.json({success:false,message:"Email is required"}) 
        
    }
    try {
        const user = await userModel.findOne({ email })
        
        if (!user) {
             return res.json({success:false,message:"User not found"})
            
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = otp
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        
        await user.save()

        const mailOption = {
           from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset OTP',
           // text: `Your OTP for resetting your password is ${otp} . Use this OTP to procced with resseting your password`,
            html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }

        await transporter.sendMail(mailOption)
        return res.json({success:true,message:" OTP sent to your email"})


        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
        
    }
}

//Reset User Password 
const resetPassword = async (req, res) => {
    const { email,otp,newPassword } = req.body

    if (!email || !otp || !newPassword) {
       return res.json({success:false,message:"Email , OTP and new password are required"})
    }
    try {
        const user = await userModel.findOne({email})
        if (!user) {
            return res.json({success:false,message:"User not found"})
            
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({success:false,message:"Invalid OTP"})
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({success:false,message:"OTP Expired"}) 
        }

         const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt) 

        user.password = hashedPassword
        
        user.resetOtp = ''
        user.resetOtpExpireAt = 0
        
        await user.save()

        return res.json({success:true,message:"Password has been reset Successfully"}) 
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
        
    }
    
}

// api to get user profile data 
const getProfile = async (req, res) => {
    try {

        const { userId } = req.body
        const userData = await userModel.findById(userId)
                                     .populate('university', 'name') // ✅ Add this line
                             .select('-password');

        res.json({success:true , userData})
        
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
        
    }
    
}

// api to update user Profile

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dateOfBirth, gender } = req.body
        const imageFile = req.file
        
        if (!name || !phone || !dateOfBirth || !gender) {
            return res.json({success:false,message:"data Missing"})
        }
        await userModel.findByIdAndUpdate(userId, { name, phone, address, dateOfBirth, gender })
        
        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' }) 
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }

        res.json({success:true,message:"profile updated "})
        
    } catch (error) {
         console.log(error);
        res.json({ success: false, message: error.message });
        
    }
    
}




/**
 * @desc    Mettre à jour le profil de l'étudiant authentifié
 * @route   PUT /api/user/update-profile
 * @access  Private (Étudiant authentifié)
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  // Find the student by ID from the authenticated user
 const student = await userModel.findById(savedStudent._id)
                                       .populate('university', 'name') // ✅ This populates university
                                       .select('-password');
  if (!student) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Update mutable fields
  student.profile.phone = req.body.phone ?? student.profile.phone;
  student.profile.linkedin = req.body.linkedin ?? student.profile.linkedin;
  student.profile.bio = req.body.bio ?? student.profile.bio;

  if (req.body.address) {
    student.profile.address.street = req.body.address.street ?? student.profile.address.street;
    student.profile.address.city = req.body.address.city || student.profile.address.city;
    student.profile.address.zipCode = req.body.address.zipCode ?? student.profile.address.zipCode;
    student.profile.address.country = req.body.address.country || student.profile.address.country;
  }

  student.specialization = req.body.specialization || student.specialization;
  student.currentClass = req.body.currentClass || student.currentClass;
  student.academicYear = req.body.academicYear || student.academicYear;
  
  if (req.body.gpa !== undefined) {
    student.studentData.gpa = req.body.gpa;
  }

  // Save the updated student document
  const savedStudent = await student.save();

  // --- SOLUTION ---
  // After saving, re-fetch the user and populate the university field
  // This ensures the response contains the full university object, not just the ID.
  const populatedStudent = await userModel.findById(savedStudent._id)
                                           .populate('university', 'name') // <-- THE MAGIC LINE
                                           .select('-password');

  // Send the fully populated user data back to the frontend
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    userData: populatedStudent, // <-- Send the populated object
  });
});




 
  






export { getProfile,  loginUser, logout, resetPassword, sendResetOtp, sendVerifyOtp, updateProfile, verifyEmail, updateUserProfile,  }

