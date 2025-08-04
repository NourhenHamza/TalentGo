import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom de l'entreprise est requis"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    adresse: {
      type: String,
      required: [true, "L'adresse de l'entreprise est requise"],
      trim: true,
    },
    ville: {
      type: String,
      required: [true, "La ville de l'entreprise est requise"],
      trim: true,
    },
    code_postal: {
      type: String,
      trim: true,
    },
    pays: {
      type: String,
      required: [true, "Le pays de l'entreprise est requis"],
      trim: true,
    },
    email_contact: {
      type: String,
      required: [true, "L'email de contact de l'entreprise est requis"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Veuillez utiliser une adresse email valide"],
    },
    telephone_contact: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    secteur_activite: {
      type: String,
      trim: true,
    },
    site_web: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, "Veuillez utiliser une URL valide"],
    },
    logo_url: {
      type: String,
      trim: true,
    },
    est_active: {
      type: Boolean,
      default: true,
    },
    // New fields for authentication and registration
    password: {
      type: String,
      // Password is not required initially, will be set during registration completion
      select: false, // Don't include password in queries by default
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    registrationCompletedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove password from JSON output
        delete ret.password;
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove password from object output
        delete ret.password;
        return ret;
      }
    }
  }
);

// Virtual for checking if registration is complete
CompanySchema.virtual('isRegistrationComplete').get(function() {
  return !!(this.password && this.status === 'approved');
});

// Pre-save middleware to hash password if it's modified
CompanySchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Only hash if password exists
  if (this.password) {
    const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  next();
});

// Method to compare password
CompanySchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find company with password for login
CompanySchema.statics.findForLogin = function(email) {
  return this.findOne({ email_contact: email }).select('+password');
};

const Company = mongoose.model("Company", CompanySchema);

export default Company;