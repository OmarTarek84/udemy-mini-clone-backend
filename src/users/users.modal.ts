import * as mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userPhoto: {
    type: String,
    required: true
  },
  enrolledCourses: [{
    ref: 'Course',
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  ownCourses: [{
    ref: 'Course',
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  wishlist: [{
    ref: 'Course',
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  cart: [{
    ref: 'Course',
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  orders: {
    type: Array,
    required: true
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiration: {
    type: String,
  }
})
