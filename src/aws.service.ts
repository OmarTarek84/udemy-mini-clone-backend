import { editFileName } from './images.interceptor';
import {Injectable} from '@nestjs/common';
import {extname} from 'path';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';

const AWS_S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
})

@Injectable()
export class AWsService {

    public async uploadFile(file, ch) {
        const name = file.originalname.split('.')[0];
        const fileExtName = extname(file.originalname);
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        let fileBuffer;
        if (file.path) {
          fileBuffer = await fs.readFileSync(file.path)
        } else {
          fileBuffer = file.buffer
        }
        const editedName = `${name}-${randomName}${fileExtName}`;
        const urlKey = ch === 'image' ? `images/${editedName}`: `videos/${editedName}`;
        const params = {
          Body: fileBuffer || file.buffer,
          Bucket: AWS_S3_BUCKET_NAME,
          Key: urlKey,
          ACL:'public-read'
        }
        const options = { partSize: 5 * 1024 * 1024, queueSize: 10 };
        const dataa = await s3.upload(params, options).promise().then(data => {
            return urlKey;
        }, err => {
            return err;
        })

        return `https://${AWS_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${dataa}`;
    }

}
