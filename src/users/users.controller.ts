import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { CustomValidationPipe } from './../custom-validation-pipe';
import { UsersDTO } from './users.dto';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
  Put
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  imageFileFilter,
  editFileName,
} from '../images.interceptor';
import { UsersService } from './users.service';
import { createParamDecorator, ExecutionContext, Request } from '@nestjs/common';
import * as crypto from 'crypto';


export const BodyToJson = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userData = request.body.userdata;
    return JSON.parse(userData);
  },
);

@Controller('users')
export class UsersController {

  constructor(private userService: UsersService) {}

  @Post('create-user')
  @UseInterceptors(FileInterceptor('image', {
    fileFilter: imageFileFilter
  }))
  async createNewUser(@BodyToJson(new CustomValidationPipe()) userdata: UsersDTO, @UploadedFile() image) {
    if (!image) {
      throw new BadRequestException(['Please Enter Your Profile Photo']);
    }
    const newUser = await this.userService.createUser(userdata, image);
    return newUser;
  }

  @Post('reset-password')
  async sendEmailToReset(@Body('email') email) {
    const buffer = await crypto.randomBytes(32);
    const token = buffer.toString('hex');
    const emailSent = await this.userService.postResetEmail(email, token);
    return emailSent;
  }

  @Post('new-password')
  async changePassword(@Body('password') password: string, @Body('confirm') confirm: string, @Body('token') token: string) {
    const successReset = await this.userService.changePassReset(password, confirm, token);
    return successReset;
  }

  @Put('edit-user')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './images',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editUser(@BodyToJson() userdata, @UploadedFile() image, @Request() req) {
    const editedUser = await this.userService.editUser(userdata, image, req);
    return editedUser;
  }

}
