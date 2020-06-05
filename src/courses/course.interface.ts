import { Document } from 'mongoose';

export interface CourseInterface extends Document {
    courseTitle: string;
    courseSubtitle: string;
    coursePrice: number;
    coursePhoto: any;
    courseCategory: string;
    enrolledUsers: any[];
    courseDescription: string;
    studentLearn: string[];
    courseRequirements: string[];
    sections: any[];
    profession: string;
    instructorDescription: string;
    user: string;
}
