import { NestMiddleware, Injectable } from '@nestjs/common';
import {Request, Response} from "express"
import { join } from 'path';

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    res.sendFile(join(__dirname, '../', 'frontBuild', 'udemy-mini-clone', 'index.html'));
  }
}
