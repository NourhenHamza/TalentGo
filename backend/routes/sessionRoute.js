import express from "express";
import { body, validationResult } from "express-validator";
import Session from "../models/Session.js"; // Ensure the correct path
 

const router = express.Router();

// Route to create a session
router.post(
  "/createsession",
  [
    body("type")
      .isIn(["pfe_submission", "defense"])
      .withMessage("Type must be 'pfe_submission' or 'defense'"),
    body("startDate").isISO8601().withMessage("Invalid start date format"),
    body("endDate").isISO8601().withMessage("Invalid end date format"),
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, startDate, endDate } = req.body;

    try {
      // Check if the session type already exists
      const existingSession = await Session.findOne({ type });
      if (existingSession) {
        return res.status(400).json({ message: `A session of type '${type}' already exists.` });
      }

      // Create new session
      const newSession = await Session.create({
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      res.status(201).json(newSession);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;
