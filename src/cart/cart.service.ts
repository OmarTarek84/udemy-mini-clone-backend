import { CourseInterface } from './../courses/course.interface';
import { UserInterface } from './../users/user.interface';
import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
    @InjectModel('Course') private readonly courseModel: Model<CourseInterface>,
  ) {}

  async addToCart(courseId, user) {
    const userFromDB = await this.userModel.findOne({ _id: user._id });
    const courseFromDB = await this.courseModel
      .findOne({ _id: courseId })
      .populate('user')
      .exec();

    const {
      resetToken,
      resetTokenExpiration,
      _id,
      password,
      cart,
      orders,
      wishlist,
      ...userRes
    } = courseFromDB._doc.user._doc;

    userFromDB.cart.push(courseId);
    await userFromDB.save();
    return {
      course: {
        ...courseFromDB._doc,
        user: userRes,
      },
      courseId: courseId,
    };
  }

  async getCart(user) {
    const userFromDB = await this.userModel.findOne({ _id: user._id });
    const coursesCart = await this.courseModel
      .find({ _id: { $in: userFromDB.cart } })
      .populate('user');

    const resArray = [];
    coursesCart.forEach(course => {
      const {
        resetToken,
        resetTokenExpiration,
        _id,
        password,
        cart,
        orders,
        wishlist,
        ...userRes
      } = course._doc.user._doc;
      resArray.push({
        ...course._doc,
        user: userRes,
      });
    });

    return resArray;
  }

  async removeFromCart(user, courseId) {
    const userFromDB = await this.userModel.findOne({ _id: user._id });
    userFromDB.cart.pull(courseId);
    await userFromDB.save();
    return { courseId: courseId };
  }

  async movetowishlist(user, courseId) {
    const userFromDB = await this.userModel.findOne({ _id: user._id });
    userFromDB.cart.pull(courseId);

    const hasWishlist = user.wishlist.some(w => w._id === courseId);

    if (!hasWishlist) {
      userFromDB.wishlist.push(courseId);
    }

    await userFromDB.save();
    return {
      courseId: courseId,
      courseToBeAddedToWishlist: !hasWishlist
        ? await this.courseModel.findOne({ _id: courseId })
        : null,
    };
  }

  async clearCartt(user) {
    const userFromDB = await this.userModel.findOne({ _id: user._id });
    userFromDB.cart = [];
    await userFromDB.save();
    return { message: 'deleted' };
  }

  async orderr(user, courseIds) {
    const courses = await this.courseModel.find({_id: {$in: courseIds}});
    let price = 0;
    courses.forEach(course => {
      price += Number(course.coursePrice);
    })

    const courseobjectIds = [];
    const targetedUser = await this.userModel.findOne({ _id: user._id });
    courseIds.forEach(courseid => {
      targetedUser.enrolledCourses.push(courseid);
      courseobjectIds.push(new mongoose.mongo.ObjectId(courseid))
    })
    targetedUser.cart = [];
    targetedUser.orders.push({
      courseIds: courseobjectIds,
      totalPrice: price.toFixed(2),
      date: new Date().toLocaleDateString()
    })

    let modifiedWishlists = [...targetedUser.wishlist];
    for (let i = modifiedWishlists.length - 1; i >= 0; i--) {
      for (let j = 0; j < courseIds.length; j++) {
        if (modifiedWishlists[i] == courseIds[j]) {
          modifiedWishlists = modifiedWishlists.filter(p => p != modifiedWishlists[i]);
        }
      }
    }
    targetedUser.wishlist = modifiedWishlists;
    await targetedUser.save();
    await courses.forEach(async (course) => {
      course.enrolledUsers.push(targetedUser._id);
      await course.save();
    });
    return {message: 'Success'}
  }
}
