
import mongoose from "mongoose";



const PartnershipSchema = new mongoose.Schema(
  {
    initiator_type: {
      type: String,
      enum: ['University', 'Company'],
      required: [true, "Le type d'initiateur est requis"],
    },
    initiator_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "L'ID de l'initiateur est requis"],
      refPath: 'initiator_type',
    },
    target_type: {
      type: String,
      enum: ['University', 'Company'],
      required: [true, "Le type de cible est requis"],
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "L'ID de la cible est requis"],
      refPath: 'target_type',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      required: true,
    },
    request_message: {
      type: String,
      trim: true,
    },
    response_message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a pre-save hook to ensure initiator and target are different entities
PartnershipSchema.pre('save', function(next) {
  if (this.initiator_type === this.target_type && this.initiator_id.equals(this.target_id)) {
    return next(new Error('L\'initiateur et la cible ne peuvent pas être la même entité.'));
  }
  next();
});

const Partnership = mongoose.model("Partnership", PartnershipSchema);

export default Partnership;
