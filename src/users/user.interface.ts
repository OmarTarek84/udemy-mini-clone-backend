import { Document } from 'mongoose';

export interface UserInterface extends Document {
    username: string;
    email: string;
    password: string;
    userPhoto: string;
    enrolledCourses: any;
    ownCourses: any;
    wishlist: any;
    cart: any;
    orders: any;
    resetToken: any;
    resetTokenExpiration: any;
}
