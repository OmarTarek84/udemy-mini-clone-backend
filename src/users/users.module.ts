import { AWsService } from './../aws.service';
import { JwtStrategy } from './../auth/strategy/jwt.strategy';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './users.modal';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, AuthService, AWsService],
  exports: [UsersService],
  imports: [
    MongooseModule.forFeature([{
      name: 'User',
      schema: userSchema
    }]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '2h' },
    }),
  ],
})
export class UsersModule {}
