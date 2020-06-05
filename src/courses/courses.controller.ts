import { AWsService } from './../aws.service';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { CustomValidationPipe } from './../custom-validation-pipe';
import {
  editFileName,
  videoFileFilter,
  editVideoName,
  imageFileFilter,
  domainURL,
} from '../images.interceptor';
import { diskStorage } from 'multer';
import {
  Controller,
  Post,
  UseInterceptors,
  createParamDecorator,
  ExecutionContext,
  UploadedFile,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
  Body,
  Put,
} from '@nestjs/common';
import { CoursesDTO } from './courses.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service';

export const BodyToJson = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const coursedata = request.body.coursedata;
    return JSON.parse(coursedata);
  },
);

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService, private awsService: AWsService) {}

  @Post('videos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      fileFilter: videoFileFilter,
    }),
  )
 async uploadVideo(@Request() req, @UploadedFile() video) {
    const fileurl = await this.awsService.uploadFile(video, 'video');
    return {
      ...video,
      fileLocation: fileurl
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: imageFileFilter,
    }),
  )
  async createCourse(
    @BodyToJson(new CustomValidationPipe()) courseContent: CoursesDTO,
    @UploadedFile() file,
    @Request() req,
  ) {
    const newCourse = await this.coursesService.createCourse(
      courseContent,
      file,
      req,
    );
    return newCourse;
  }

  @Get('allCourses')
  async getAllCourses(
    @Query('search') search: string,
    @Query('category') category: string,
    @Query('sort') datesort: string,
    @Query('pageNumber') pageNumber: number
  ) {
    const allCourses = await this.coursesService.getAllCoursess(
      search,
      category,
      datesort,
      pageNumber
    );
    return allCourses;
  }

  @Get('ownCourses')
  @UseGuards(JwtAuthGuard)
  async getownCourses(@Request() request, @Query('search') search: string, @Query('pageNumber') pageNumber) {
    const ownCourses = await this.coursesService.getOwnCourses(
      request.user,
      search,
      pageNumber
    );
    return ownCourses;
  }

  @Get('course')
  async getCourse(@Query('courseid') courseid) {
    const resCourse = await this.coursesService.getSingleCourse(courseid);
    return resCourse;
  }

  @Get('getCourseEdit')
  async getsingleCourse(@Query('courseid') courseid) {
    const resCourse = await this.coursesService.getSingleCourseForEdit(courseid);
    return resCourse;
  }

  @Post('deleteCourse')
  @UseGuards(JwtAuthGuard)
  async deleteCourse(@Body('courseId') courseId, @Request() req, @Query('t') target) {
    const deleted = await this.coursesService.deleteCourse(courseId, req.user, target);
    return deleted;
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: imageFileFilter,
    }),
  )
  async editCourse(
    @BodyToJson(new CustomValidationPipe()) courseContent: CoursesDTO,
    @Body('courseId') courseId,
    @UploadedFile() file,
    @Request() req,
  ) {
    const editedCourse = await this.coursesService.editCourse(courseContent, file, req.user, courseId);
    return editedCourse;
  }

  @Post('add-wishlist')
  @UseGuards(JwtAuthGuard)
  async addWishlist(@Request() req, @Body('courseId') courseId) {
    const addedWishlist = await this.coursesService.addWishlist(req.user, courseId);
    return addedWishlist;
  }

  @Get('wishlist')
  @UseGuards(JwtAuthGuard)
  async getWishlist(@Request() req, @Query('pageNumber') pageNumber) {
    const allWishlist = await this.coursesService.getWishlist(req.user, pageNumber);
    return allWishlist;
  }

  @Get('enrolled-courses')
  @UseGuards(JwtAuthGuard)
  async getEnrolled(@Request() req, @Query('pageNumber') pageNumber, @Query('instructor') instructor) {
    const enrolledCoursesRes = await this.coursesService.getEnrolledCourses(req.user, pageNumber, instructor);
    return enrolledCoursesRes;
  }

  @Get('course-begin')
  @UseGuards(JwtAuthGuard)
  async getCourseBegin(@Request() req, @Query('courseId') courseId) {
    const theCourse = await this.coursesService.getCourseToBegin(req.user, courseId);
    return theCourse;
  }
}
