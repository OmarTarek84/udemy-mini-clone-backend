import { Controller, UseGuards, Get, Req, Post, Body, Request, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth(@Req() req) {}

  // @Get('google/redirect')
  // @UseGuards(AuthGuard('google'))
  // googleAuthRedirect(@Req() req) {
  //   return this.authService.googleLogin(req);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const {password, ...user} = req.user._doc;
    return user;
  }

  @Post('login')
  async loginUser(@Body('email') email: string, @Body('password') password: string) {
    const userDetails = await this.authService.userLogin(email, password, false);
    return userDetails;
  }

  @Post('googleLogin')
  async tokenGuard(@Body() userData) {
    const userInfo = await this.authService.googleLogin(userData);
    return userInfo;
  }

}
