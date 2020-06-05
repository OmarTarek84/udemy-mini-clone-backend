import { AWsService } from './../aws.service';
import { UsersService } from './../users/users.service';
import { userSchema } from './../users/users.modal';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    UsersService,
    AWsService
  ],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '2h' },
    }),
    MongooseModule.forFeature([{
      name: 'User',
      schema: userSchema
    }])
  ],
})
export class AuthModule {}
