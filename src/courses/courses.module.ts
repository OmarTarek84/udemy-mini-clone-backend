import { AWsService } from './../aws.service';
import { userSchema } from './../users/users.modal';
import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { coursesSchema } from './course.modal';

@Module({
  controllers: [CoursesController],
  providers: [
    CoursesService,
    AWsService
  ],
  imports: [
    // MulterModule.registerAsync({
    //   useFactory: () => ({
    //     dest: './videos/',
    //   }),
    // }),
    MongooseModule.forFeature([{
      name: 'Course',
      schema: coursesSchema
    }]),
    MongooseModule.forFeature([{
      name: 'User',
      schema: userSchema
    }]),
  ],
})
export class CoursesModule {}
