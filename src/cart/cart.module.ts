import { coursesSchema } from './../courses/course.modal';
import { userSchema } from './../users/users.modal';
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [
    MongooseModule.forFeature([{
      name: 'User',
      schema: userSchema
    }]),
    MongooseModule.forFeature([{
      name: 'Course',
      schema: coursesSchema
    }]),
  ]
})
export class CartModule {}
