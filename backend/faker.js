import mongoose from 'mongoose';
import { Subject, SPECIALITIES } from './models/Subject.js';  // Updated import
import { faker } from '@faker-js/faker';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pfe_management_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const updateSubjectsWithSpecialities = async () => {
  try {
    // Get all existing subjects
    const subjects = await Subject.find({});
    
    // Update each subject with random specialities
    const updatePromises = subjects.map(async subject => {
      // Generate 1-3 random specialities
      const specialities = faker.helpers.arrayElements(
        SPECIALITIES,
        faker.number.int({ min: 1, max: 3 })
      );
      
      // Update the subject
      return Subject.findByIdAndUpdate(
        subject._id,
        { $set: { speciality: specialities } },
        { new: true }
      );
    });
    
    const updatedSubjects = await Promise.all(updatePromises);
    console.log(`Updated ${updatedSubjects.length} subjects with specialities`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating subjects:', error);
    process.exit(1);
  }
};

// Run the update
updateSubjectsWithSpecialities();