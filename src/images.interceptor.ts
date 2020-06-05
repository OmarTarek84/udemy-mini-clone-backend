import {extname} from 'path';
import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';

export const domainURL = 'http://udemyminiclone-env.eba-cjmfj938.us-east-2.elasticbeanstalk.com/';
// export const domainURL = 'http://localhost:8080/';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new InternalServerErrorException('Only JPG, JPEG, PNG extensions are allowed!'), false);
  }
  callback(null, true);
};

export const videoFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(mp4|mpg|m4v|flv|avi|mov|wmv|divx|f4v|mpeg|vob)$/)) {
    return callback(new InternalServerErrorException('We only Support .mp4, .mpg, .m4v, .flv, .avi, .mov, .wmv, .divx, .f4v, .mpeg and .vob extensions only!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const editVideoName = (req, file, callback) => {
  const name = file.originalname.split('.')[file.originalname.split('.').length - 2].trim().split(' ').join('-');
  const fileExtName = extname(file.originalname);
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
