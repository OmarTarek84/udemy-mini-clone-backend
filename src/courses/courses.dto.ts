import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";


class SectionLessons {

  @ApiProperty()
  @IsNotEmpty({message: 'Please fill all lesson names'})
  lessonName: string;

  @IsNotEmpty()
  @ApiProperty()
  lessonVideoFile: any;

  @ApiProperty()
  SubmittedLessonName?: string;

  @ApiProperty()
  lessonMode?: string;

  @ApiProperty()
  videoName?: string;

  @ApiProperty()
  videoDuration?: any;

  @ApiProperty()
  lessonCheckMarked?: any;

  @ApiProperty()
  uploadSuccess?: any;

  @ApiProperty()
  uploadProgress?: any;

}


class Sections {

  @ApiProperty()
  @IsNotEmpty({message: 'Please fill all section names'})
  sectionName: string;

  @ApiProperty()
  SubmittedSectionName: any;

  @ApiProperty()
  mode: any;

  @ApiProperty()
  @IsNotEmpty({message: 'No Lessons are provided!!'})
  @ValidateNested({ each: true })
  @Type(() => SectionLessons)
  sectionLessons: SectionLessons[]
}


export class CoursesDTO {

  @ApiProperty()
  @IsNotEmpty({message: 'Course Title is required'})
  courseTitle: string;

  @ApiProperty()
  @IsNotEmpty({message: 'Course Subtitle is required'})
  courseSubtitle: string;

  @ApiProperty()
  @IsNotEmpty({message: 'Course Description is required'})
  courseDescription: string;

  @ApiProperty()
  @IsNotEmpty({message: 'Please enter your course price'})
  @IsNumber()
  coursePrice: number;

  @ApiProperty()
  @IsNotEmpty({message: 'Please Tell us Your Profession'})
  profession: string;

  @ApiProperty()
  @IsNotEmpty({message: 'Please Tell us about Yourself to the students'})
  instructorDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  courseRequirements: string[];

  @ApiProperty()
  @IsNotEmpty()
  studentLearn: string[];

  @ApiProperty()
  @IsNotEmpty()
  courseCategory: string[];

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Sections)
  sections: Sections[];

  @ApiProperty()
  updatedAt: any;
}
