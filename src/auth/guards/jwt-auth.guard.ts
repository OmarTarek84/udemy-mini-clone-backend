import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info: Error) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        // do stuff when token is expired
        return {message: 'Token Has Expired, Please Login Again'};
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
