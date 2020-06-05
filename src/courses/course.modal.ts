import * as mongoose from 'mongoose';

export const coursesSchema = new mongoose.Schema({
  courseTitle: {
    type: String,
    required: true
  },
  courseSubtitle: {
    type: String,
    required: true
  },
  coursePrice: {
    type: String,
    required: true
  },
  courseDescription: {
    type: String,
    required: true
  },
  coursePhoto: {
    type: String,
    required: true
  },
  courseCategory: {
    type: String,
    required: true
  },
  enrolledUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  profession: {
    type: String,
    required: true
  },
  instructorDescription: {
    type: String,
    required: true
  },
  studentLearn: [{
    type: String,
    required: true
  }],
  courseRequirements: [{
    type: String,
    required: true
  }],
  sections: [{
    type: Object,
    required: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {timestamps: true})
