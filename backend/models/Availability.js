import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema(
  {
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      required: [true, "Professor reference is required"]
    },
    availableSlots: [{
      date: {
        type: Date,
        required: [true, "Date is required"],
        validate: {
          validator: function(date) {
            return !isNaN(date.getTime());
          },
          message: "Invalid date format"
        }
      },
      time: {
        type: String,
        required: [true, "Time is required"],
        match: [
          /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
          "Time must be in HH:MM format"
        ],
        validate: {
          validator: function(time) {
            const hours = parseInt(time.split(':')[0]);
            return hours >= 8 && hours < 18;
          },
          message: "Availability must be between 08:00 and 17:59"
        }
      }
    }],
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster querying
AvailabilitySchema.index({ professor: 1, active: 1 });

export default mongoose.model("Availability", AvailabilitySchema);