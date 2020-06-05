import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { FrontendMiddleware } from './frontend.middleware';
import {MongooseModule} from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CoursesModule } from './courses/courses.module';
import { CartModule } from './cart/cart.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster1-tmn4p.mongodb.net/${process.env.DATABSE_NAME}?retryWrites=true&w=majority`,
    ),
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: 'apikey', // generated ethereal user
          pass: process.env.SENDGRID_APIKEY, // generated ethereal password
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
    }),
    CoursesModule,
    CartModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'frontBuild', 'udemy-mini-clone'),
    }),
  ]
})
export class AppModule {
  // configure(frontEnd: MiddlewareConsumer) {
  //   frontEnd.apply(FrontendMiddleware).forRoutes({
  //     path: '/**', // For all routes
  //     method: RequestMethod.ALL, // For all methods
  //   });
  // }
}
