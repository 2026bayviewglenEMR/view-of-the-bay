// models/User.js
const mongoose = require('mongoose');

// 1. Define the Schema
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['doctor', 'admin'],
    required: true 
  },
  firstName: String,
  lastName: String,
  email: String,
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields!
});

// 2. Compile it into a Model and export it
// Mongoose will automatically create a collection called "users" (lowercase, plural)
const User = mongoose.model('User', userSchema);

module.exports = User;