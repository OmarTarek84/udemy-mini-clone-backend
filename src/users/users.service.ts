import { AWsService } from './../aws.service';
import { JwtService } from '@nestjs/jwt';
import { UsersDTO } from './users.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserInterface } from './user.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  DOMAIN_URL = 'http://udemyminiclone-env.eba-cjmfj938.us-east-2.elasticbeanstalk.com/';
  // DOMAIN_URL = 'http://localhost:8080/';

  constructor(
    @InjectModel('User') private readonly userModal: Model<UserInterface>,
    private readonly mailerService: MailerService,
    private jwtService: JwtService,
    private awsService: AWsService
  ) {}

  async createUser(userDTO: UsersDTO, image) {
    const existingUser = await this.userModal.findOne({ email: userDTO.email });
    if (existingUser) {
      throw new BadRequestException(['User Already Exists']);
    }
    const fileUrl = image.originalname ? await this.awsService.uploadFile(image, 'image'): image;
    console.log(fileUrl);
    const hashedPass = await bcrypt.hash(userDTO.password, 12);
    const newUser = new this.userModal({
      username: userDTO.fullname,
      email: userDTO.email,
      password: hashedPass,
      userPhoto: fileUrl,
      enrolledCourses: [],
      ownCourses: [],
      wishlist: [],
      cart: [],
      orders: [],
      resetToken: null,
      resetTokenExpiration: null,
    });
    const userCreated = await newUser.save();
    return userCreated;
  }

  async postResetEmail(email, token) {
    const existingUser = await this.userModal.findOne({ email: email });
    if (!existingUser) {
      throw new BadRequestException(['No user was found with This Email']);
    }
    existingUser.resetToken = token;
    existingUser.resetTokenExpiration = Date.now() + (2 * 60 * 60 * 1000);

    await existingUser.save();

    const info = await this.mailerService.sendMail({
      from: 'naxapi5922@beiop.com', // sender address
      to: email, // list of receivers
      subject: 'Password reset',
      html: `
        <h2>Udemy-Mini-Clone Password Reset</h2>
        <p>Click this <a href="${this.DOMAIN_URL}home?token=${token}">link</a> to set a new password.</p>
      `
    });

      console.log('Message sent: %s', info.messageId);
      return {message: 'Email Sent To Your Account'};
  }

  async changePassReset(pass, confirm, token) {
    if (pass.length < 8) {
      throw new BadRequestException(['Password Should be at least 8 characters']);
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z\W\S]{1,}$/;
    if (!passwordRegex.test(pass)) {
      throw new BadRequestException(['Password Should have at least one upper character, one lower character and one number']);
    }
    if (pass !== confirm) {
      throw new BadRequestException(['Passwords Do not Match']);
    }
    const targetedUser = await this.userModal.findOne({ resetToken: token });
    if (!targetedUser) {
      throw new BadRequestException(['Invalid Token, Please Try the link again From Your Mail']);
    }

    if (new Date().getTime() > new Date(targetedUser.resetTokenExpiration).getTime()) {
      throw new BadRequestException(['Sorry, This token has Expired, Please reset password again']);
    }

    const hashedPass = await bcrypt.hash(pass, 12);
    targetedUser.password = hashedPass;
    targetedUser.resetToken = null;
    targetedUser.resetTokenExpiration = null;
    await targetedUser.save();

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



  async editUser(userData, image, req) {
    console.log(userData);
    if (!userData.email || !userData.fullname) {
      throw new BadRequestException(['Please Fill The Required Fields']);
    }

    const {_id, resetToken, resetTokenExpiration, password, ...result} = req.user._doc;
    const targetedUser = await this.userModal.findOne({_id: _id});

    targetedUser.username = userData.fullname;
    targetedUser.email = userData.email;
    if (!image) {
      targetedUser.userPhoto = result.userPhoto;
    } else {
      targetedUser.userPhoto = image.path ? this.DOMAIN_URL + image.path : image
    }

    if (userData.currentpassword && (!userData.password)) {
      throw new BadRequestException(['Please Provide Your New Password and confirm Password with Your Current Password']);
    }

    if (userData.currentpassword) {
      const ifCorrectPass = await bcrypt.compare(userData.currentpassword, targetedUser.password);
      if (!ifCorrectPass) {
        throw new BadRequestException(['Your Current Password Is Not Correct']);
      }
    }

    if (userData.password) {
      if (userData.password && !userData.confirmpassword) {
        throw new BadRequestException(['Please Confirm Your Password']);
      }

      if (userData.password.length < 8) {
        throw new BadRequestException(['Password Should have at least 8 characters']);
      }

      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z\W\S]{1,}$/;
      if (!passwordRegex.test(userData.password)) {
        throw new BadRequestException(['Password Should have at least one upper character, one lower character and one number']);
      }

      if (userData.password !== userData.confirmpassword) {
        throw new BadRequestException(['Passwords do not Match']);
      }

      targetedUser.password = await bcrypt.hash(userData.password, 12);
    }
    await targetedUser.save();

    return {
      email: targetedUser.email,
      userPhoto: targetedUser.userPhoto,
      username: targetedUser.username,
      wishlist: targetedUser.wishlist,
      cart: targetedUser.cart,
      enrolledCourses: targetedUser.enrolledCourses,
      ownCourses: targetedUser.ownCourses
    };
  }

}
