import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    type: { 
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ['pfe_submission', 'defense'],
        message: "Type must be either 'pfe_submission' or 'defense'"
      }
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ['open', 'closed'],
        message: "Status must be either 'open' or 'closed'"
      },
      default: 'closed'
    },
    startDate: { 
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: "Start date must be in the future"
      }
    },
    endDate: { 
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function(value) {
          return value > this.startDate;
        },
        message: "End date must be after start date"
      }
    }
  },
  { 
    timestamps: true 
  }
);

// Initialisation automatique
const initializeSessions = async () => {
  try {
    const types = ['pfe_submission', 'defense'];
    for (const type of types) {
      const exists = await mongoose.model('Session').exists({ type });
      if (!exists) {
        const start = new Date();
        const end = new Date(start);
        end.setMonth(start.getMonth() + (type === 'pfe_submission' ? 1 : 2));
        
        await mongoose.model('Session').create({
          type,
          status: 'closed',
          startDate: start,
          endDate: end
        });
        console.log(`${type} session initialized`);
      }
    }
  } catch (error) {
  }
};

// Appel après la définition du modèle
setTimeout(initializeSessions, 2000);

export default mongoose.model("Session", SessionSchema);