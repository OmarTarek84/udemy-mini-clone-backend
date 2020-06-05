import { UsersService } from './../users/users.service';
import { UserInterface } from './../users/user.interface';
import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel('User') private readonly userModal: Model<UserInterface>,
    private userService: UsersService,
  ) {}

  // googleLogin(req) {
  //   if (!req.user) {
  //     return 'No user from google'
  //   }

  //   return {
  //     message: 'User information from google',
  //     user: req.user,
  //     accessToken: this.jwtService.sign(req.user)
  //   }
  // }

  async validateUser(payload) {
    const targetedUser = await this.userModal.findOne({ email: payload.email });
    return targetedUser;
  }

  async userLogin(email: string, password: string, hasGoogle: boolean) {
    const targetedUser = await this.userModal.findOne({ email: email });
    if (!hasGoogle) {
      if (!targetedUser) {
        throw new BadRequestException(['Email Or Password Is Incorrect!']);
      }
      const ifCorrectPass = await bcrypt.compare(
        password,
        targetedUser.password,
      );
      if (!ifCorrectPass) {
        throw new BadRequestException(['Email Or Password Is Incorrect!']);
      }
    }
    const payload = {
      userId: targetedUser._id.toString(),
      email: targetedUser.email,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      userPhoto: targetedUser.userPhoto,
      email: targetedUser.email,
      fullname: targetedUser.username,
      wishlist: targetedUser.wishlist,
      cart: targetedUser.cart,
      enrolledCourses: targetedUser.enrolledCourses,
      ownCourses: targetedUser.ownCourses
    };
  }

  async googleLogin(userData) {
    const targetedUser = await this.userModal.findOne({
      email: userData.email,
    });
    if (!targetedUser) {
      const userCreated = await this.userService.createUser(
        {
          email: userData.email,
          fullname: userData.name,
          password: crypto.randomBytes(256).toString('base64'),
          confirmpassword: crypto.randomBytes(256).toString('base64'),
        },
        userData.photoUrl,
      );
      return userCreated;
    } else {
      const data = await this.userLogin(userData.email, crypto.randomBytes(256).toString('base64'), true);
      return data;
    }
  }
}
