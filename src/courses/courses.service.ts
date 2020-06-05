import { AWsService } from './../aws.service';
import { UserInterface } from './../users/user.interface';
import { CoursesDTO } from './courses.dto';
import { CourseInterface } from './course.interface';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CoursesService {
  DOMAIN_URL = 'http://udemyminiclone-env.eba-cjmfj938.us-east-2.elasticbeanstalk.com/';
  // DOMAIN_URL = 'http://localhost:8080/';
  resultsPerPage = 6;

  constructor(
    @InjectModel('Course') private readonly courseModel: Model<CourseInterface>,
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
    private awsService: AWsService
  ) {}

  async createCourse(courseContent: CoursesDTO, file, req) {
    const fileUrl = await this.awsService.uploadFile(file, 'image');
    const newCourse = new this.courseModel({
      courseTitle: courseContent.courseTitle,
      courseDescription: courseContent.courseDescription,
      coursePrice: courseContent.coursePrice,
      coursePhoto: fileUrl,
      courseCategory: courseContent.courseCategory,
      enrolledUsers: [],
      profession: courseContent.profession,
      courseSubtitle: courseContent.courseSubtitle,
      courseRequirements: courseContent.courseRequirements,
      instructorDescription: courseContent.instructorDescription,
      studentLearn: courseContent.studentLearn,
      sections: courseContent.sections,
      user: req.user._id,
    });

    const saveCourse = await newCourse.save();
    const { user, ...result } = saveCourse._doc;

    const targetUser = await this.userModel.findOne({ _id: req.user._id });
    targetUser.ownCourses.push(saveCourse._id);
    await targetUser.save();

    return {
      ...result,
      user: {
        email: req.user.email,
        enrolledCourses: req.user.enrolledCourses,
        ownCourses: req.user.ownCourses,
        userPhoto: req.user.userPhoto,
        username: req.user.username,
      },
    };
  }

  async getAllCoursess(search, category, datesort, pageNumber) {
    const sortDate = () => {
      if (datesort === 'Newest') {
        return '-createdAt';
      } else {
        return 'createdAt';
      }
    };

    let paginatedAllCoursesFromDB;
    let arrCount = 0;

    if (
      category === undefined ||
      category === null ||
      category === '' ||
      category === 'All'
    ) {
      paginatedAllCoursesFromDB = await this.courseModel
        .find()
        .sort(sortDate())
        .skip(this.resultsPerPage * pageNumber - this.resultsPerPage)
        .limit(this.resultsPerPage)
        .populate('user')
        .exec();
      arrCount = await this.courseModel.countDocuments();
    } else {
      paginatedAllCoursesFromDB = await this.courseModel
        .find({ courseCategory: category })
        .sort(sortDate())
        .skip(this.resultsPerPage * pageNumber - this.resultsPerPage)
        .limit(this.resultsPerPage)
        .populate('user')
        .exec();
      arrCount = await this.courseModel.countDocuments({
        courseCategory: category,
      });
    }

    // search query handle
    if (
      search === undefined ||
      search === null ||
      search === '' ||
      search === 'all'
    ) {
      const returnedResult = [];
      if (paginatedAllCoursesFromDB.length > 0) {
        paginatedAllCoursesFromDB.forEach(course => {
          const sectionArr = [];
          course._doc.sections.forEach(section => {
            sectionArr.push({
              ...section,
              sectionLessons: section.sectionLessons.map(lesson => {
                const { lessonVideoFile, ...lessonRes } = lesson;
                return lessonRes;
              }),
            });
          });
          const {
            resetToken,
            resetTokenExpiration,
            _id,
            password,
            cart,
            orders,
            wishlist,
            ...userRes
          } = course._doc.user._doc;
          returnedResult.push({
            ...course._doc,
            sections: sectionArr,
            user: userRes,
          });
        });
      }
      return {
        resArray: returnedResult,
        currentPage: pageNumber || 1,
        pages: Math.ceil(arrCount / this.resultsPerPage),
        totalNumberOfItems: arrCount,
        pageSize: this.resultsPerPage,
      };
    } else {
      const allCourses = [...paginatedAllCoursesFromDB];
      const filteredCourses = allCourses.filter(course => {
        return (
          course.courseTitle.includes(search) ||
          course.courseDescription.includes(search) ||
          course.courseSubtitle.includes(search) ||
          course.profession.includes(search)
        );
      });
      return {
        resArray: filteredCourses,
        currentPage: pageNumber || 1,
        pages: Math.ceil(filteredCourses.length / this.resultsPerPage),
        totalNumberOfItems: filteredCourses.length,
        pageSize: this.resultsPerPage,
      };
    }
  }

  async getOwnCourses(user, search, pageNumber) {
    const ownCoursesIds = await user.ownCourses;
    const ownCourses = await this.courseModel
      .find({
        _id: { $in: ownCoursesIds },
      })
      .skip(this.resultsPerPage * pageNumber - this.resultsPerPage)
      .limit(this.resultsPerPage)
      .populate('user');
    const ownCoursesCount = await this.courseModel.countDocuments({
      _id: { $in: ownCoursesIds },
    });

    const editedUserOwnCourses = [];
    ownCourses.forEach(course => {
      const sectionArr = [];
      course._doc.sections.forEach(section => {
        sectionArr.push({
          ...section,
          sectionLessons: section.sectionLessons.map(lesson => {
            const { lessonVideoFile, ...lessonRes } = lesson;
            return lessonRes;
          }),
        });
      });
      const {
        resetToken,
        resetTokenExpiration,
        _id,
        password,
        cart,
        orders,
        wishlist,
        ...userRes
      } = course._doc.user._doc;
      editedUserOwnCourses.push({
        ...course._doc,
        sections: sectionArr,
        user: userRes,
      });
    });
    let resultCourses;

    if (
      search === 'all' ||
      search === '' ||
      search === null ||
      search === undefined
    ) {
      resultCourses = {
        resultArr: editedUserOwnCourses,
        resCount: ownCoursesCount,
        pages: Math.ceil(ownCoursesCount / this.resultsPerPage),
        totalNumberOfItems: ownCoursesCount,
        pageSize: this.resultsPerPage,
      };
    } else {
      const filteredSearch = editedUserOwnCourses.filter(course => {
        return (
          course.courseTitle.includes(search) ||
          course.courseDescription.includes(search) ||
          course.courseSubtitle.includes(search) ||
          course.profession.includes(search)
        );
      });
      resultCourses = {
        resultArr: filteredSearch,
        resCount: ownCoursesCount,
        pages: Math.ceil(filteredSearch.length / this.resultsPerPage),
        totalNumberOfItems: filteredSearch.length,
        pageSize: this.resultsPerPage,
      };
    }

    return resultCourses;
  }

  async getSingleCourse(id) {
    const course = await this.courseModel
      .findOne({ _id: id })
      .populate('user')
      .exec();
    const sectionArr = [];
    course._doc.sections.forEach(section => {
      sectionArr.push({
        ...section,
        sectionLessons: section.sectionLessons.map(lesson => {
          const { lessonVideoFile, ...lessonRes } = lesson;
          return lessonRes;
        }),
      });
    });
    const {
      resetToken,
      resetTokenExpiration,
      _id,
      password,
      cart,
      orders,
      wishlist,
      ...userRes
    } = course._doc.user._doc;
    return {
      ...course._doc,
      sections: sectionArr,
      user: userRes,
    };
  }

  async getSingleCourseForEdit(id) {
    const course = await this.courseModel
      .findOne({ _id: id })
      .populate('user')
      .exec();
    const {
      resetToken,
      resetTokenExpiration,
      _id,
      password,
      cart,
      orders,
      wishlist,
      ...userRes
    } = course._doc.user._doc;
    return {
      ...course._doc,
      user: userRes,
    };
  }

  async deleteCourse(courseid, user, target) {
    const course = await this.courseModel
      .findOne({ _id: courseid })
      .populate('user');

    if (user._id.toString() !== course.user._id.toString()) {
      throw new BadRequestException('You are not the creator of this course');
    }

    if (course.enrolledUsers.length > 0) {
      throw new BadRequestException('You can not delete this course as some students are already enrolled');
    }

    await this.courseModel.deleteOne({ _id: course._id });

    const userFromDB = await this.userModel.findOne({ _id: user._id });
    userFromDB.ownCourses.pull(course._id);
    await userFromDB.save();

    let allOwOwnCourses = [];
    let allOrOwnCoursesCount;

    if (target === 'allcourses') {
      allOwOwnCourses = await this.courseModel
      .find()
      .skip(this.resultsPerPage * 1 - this.resultsPerPage)
      .limit(this.resultsPerPage)
      .populate('user');

      allOrOwnCoursesCount = await this.courseModel.countDocuments();
    } else {
      const ownCoursesIds = await user.ownCourses;
      allOwOwnCourses = await this.courseModel
      .find({_id: { $in: ownCoursesIds }})
      .skip(this.resultsPerPage * 1 - this.resultsPerPage)
      .limit(this.resultsPerPage)
      .populate('user');

      allOrOwnCoursesCount = await this.courseModel.countDocuments({_id: { $in: ownCoursesIds }});

    }

    const editedCourses = [];

    const {
      resetToken,
      resetTokenExpiration,
      _id,
      password,
      cart,
      orders,
      wishlist,
      ...userRes
    } = course._doc.user._doc;

    allOwOwnCourses.forEach(course => {
      editedCourses.push({
        ...course._doc,
        user: userRes,
      });
    })

    return {
      resultArr: editedCourses,
      resCount: allOrOwnCoursesCount,
      pages: Math.ceil(allOrOwnCoursesCount / this.resultsPerPage),
      totalNumberOfItems: allOrOwnCoursesCount,
      pageSize: this.resultsPerPage,
    };
  }

  async editCourse(courseContent: CoursesDTO, file, user, courseId) {
    const targetedCourse = await this.courseModel
      .findOne({ _id: courseId })
      .populate('user')
      .exec();
    const {
      resetToken,
      resetTokenExpiration,
      _id,
      password,
      cart,
      orders,
      wishlist,
      ...userRes
    } = targetedCourse._doc.user._doc;

    targetedCourse.courseCategory = courseContent.courseCategory;
    targetedCourse.courseDescription = courseContent.courseDescription;
    targetedCourse.coursePrice = courseContent.coursePrice.toString();
    targetedCourse.courseRequirements = courseContent.courseRequirements;
    targetedCourse.courseSubtitle = courseContent.courseSubtitle;
    targetedCourse.courseTitle = courseContent.courseTitle;
    targetedCourse.instructorDescription = courseContent.instructorDescription;
    targetedCourse.profession = courseContent.profession;
    targetedCourse.sections = courseContent.sections;
    targetedCourse.studentLearn = courseContent.studentLearn;
    targetedCourse.updatedAt = courseContent.updatedAt;
    targetedCourse.coursePhoto =
      file && file.path
        ? this.DOMAIN_URL + file.path
        : targetedCourse.coursePhoto;
    await targetedCourse.save();
    return {
      ...targetedCourse._doc,
      user: userRes,
    };
  }

  async addWishlist(user, courseId) {
    const targetUser = await this.userModel.findOne({ _id: user._id });
    if (targetUser.wishlist.indexOf(courseId) > -1) {
      targetUser.wishlist.pull(courseId);
    } else {
      targetUser.wishlist.push(courseId);
    }
    await targetUser.save();
    return { courseId: courseId };
  }

  async getWishlist(user, pageNumber) {
    const wishlistIds = await user.wishlist;
    const wishlist = await this.courseModel
      .find({
        _id: { $in: wishlistIds },
      })
      .skip(this.resultsPerPage * pageNumber - this.resultsPerPage)
      .limit(this.resultsPerPage)
      .populate('user');

    const wishlistCount = await this.courseModel.countDocuments({
      _id: { $in: wishlistIds },
    });

    const editedUserwishlist = [];
    wishlist.forEach(course => {
      const sectionArr = [];
      course._doc.sections.forEach(section => {
        sectionArr.push({
          ...section,
          sectionLessons: section.sectionLessons.map(lesson => {
            const { lessonVideoFile, ...lessonRes } = lesson;
            return lessonRes;
          }),
        });
      });
      const {
        resetToken,
        resetTokenExpiration,
        _id,
        password,
        cart,
        orders,
        wishlist,
        ...userRes
      } = course._doc.user._doc;
      editedUserwishlist.push({
        ...course._doc,
        sections: sectionArr,
        user: userRes,
      });
    });

    return {
      resArray: editedUserwishlist,
      currentPage: pageNumber || 1,
      pages: Math.ceil(wishlistCount / this.resultsPerPage),
      totalNumberOfItems: wishlistCount,
      pageSize: this.resultsPerPage,
    };
  }

  async getEnrolledCourses(user, pageNumber, instructor) {
    console.log('instructorrr', instructor);
    const enrolledCoursesIds = await user.enrolledCourses;

    let enrolledCount = await this.courseModel.countDocuments({
      _id: { $in: enrolledCoursesIds },
    });
    let enrolledCourses = await this.courseModel
      .find({
        _id: { $in: enrolledCoursesIds },
      })
      .skip(this.resultsPerPage * pageNumber - this.resultsPerPage)
      .limit(this.resultsPerPage)
      .populate('user');

    if (
      instructor !== 'All' &&
      instructor !== '' &&
      instructor !== null &&
      instructor !== undefined
    ) {
      enrolledCourses = enrolledCourses.filter(
        course => course.user.username === instructor,
      );
      enrolledCount = enrolledCourses.length;
    }

    const editedUserenrolledCourses = [];
    const instructors = [];

    if (enrolledCourses.length > 0) {
      enrolledCourses.forEach(course => {
        const sectionArr = [];
        course._doc.sections.forEach(section => {
          sectionArr.push({
            ...section,
            sectionLessons: section.sectionLessons.map(lesson => {
              const { lessonVideoFile, ...lessonRes } = lesson;
              return lessonRes;
            }),
          });
        });
        const {
          resetToken,
          resetTokenExpiration,
          _id,
          password,
          cart,
          orders,
          wishlist,
          ...userRes
        } = course._doc.user._doc;
        editedUserenrolledCourses.push({
          ...course._doc,
          sections: sectionArr,
          user: userRes,
        });
        if (instructors.indexOf(userRes.username) < 0) {
          instructors.push(userRes.username);
        }
      });
    }

    return {
      resArray: editedUserenrolledCourses,
      currentPage: pageNumber || 1,
      pages: Math.ceil(enrolledCount / this.resultsPerPage),
      totalNumberOfItems: enrolledCount,
      pageSize: this.resultsPerPage,
      instructors: instructors,
    };
  }

  async getCourseToBegin(user, courseId) {
    const targetedCourseFromDB = await this.courseModel.findOne({_id: courseId}).populate('user');
    const userFromDB = await this.userModel.findOne({_id: user._id});
    if (!targetedCourseFromDB) {
      throw new BadRequestException('Wrong URL!!!');
    }
    if (userFromDB.enrolledCourses.indexOf(courseId) > -1 || userFromDB.ownCourses.indexOf(courseId) > -1) {
      const {
        resetToken,
        resetTokenExpiration,
        _id,
        password,
        cart,
        orders,
        wishlist,
        ...userRes
      } = targetedCourseFromDB._doc.user._doc;
      return {
        ...targetedCourseFromDB._doc,
        user: userRes,
      }
    } else {
      throw new BadRequestException('You are not authorized to view this course');
    }
  }

}
