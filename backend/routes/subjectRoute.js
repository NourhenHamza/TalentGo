import express from 'express';
import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Subject from '../models/Subject.js';


const router = express.Router();

// Get all approved subjects (for defense request dropdown)
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find({ status: 'approved' })
      .select('title description technologies company supervisor')
      .sort({ title: 1 });

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ 
      message: 'Failed to fetch subjects' 
    });
  }
});
router.post('/createsubject', async (req, res) => {
    try {
      const { title, description, technologies, company, proposedBy } = req.body;
  
      if (!title || !description || !technologies || !company || !proposedBy) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
  
      const newSubject = await Subject.create({
        title,
        description,
        technologies,
        company,
        proposedBy,
        status: 'approved'
      });
  
      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: newSubject
      });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

  // TEST ROUTE - Create validated final report for specific user
  router.post('/create-validated-report', async (req, res) => {
    try {
      const { subjectId } = req.body;
      const studentId = '67ee6d7707b50a504eea51b8'; // Hardcoded test user ID
  
      // Create test report
      const testReport = {
        student: new mongoose.Types.ObjectId(studentId),
        subject: new mongoose.Types.ObjectId(subjectId),
        fileUrl: 'https://example.com/test-report.pdf',
        type: 'final',
        status: 'validated',
        feedback: 'Automatically validated for testing purposes'
      };
  
      const report = new Report(testReport);
      await report.save();
  
      res.status(201).json({
        success: true,
        message: 'Test report created successfully',
        report
      });
  
    } catch (error) {
      console.error('Error creating test report:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to create test report',
        error: error.message 
      });
    }
  });
export default router;