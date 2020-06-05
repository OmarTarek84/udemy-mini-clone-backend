import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsEmail, MinLength, Validate} from 'class-validator';
import {PasswordConstraint} from './password-constraint';
import { Transform } from 'class-transformer';

export class UsersDTO {

  @ApiProperty()
  @IsNotEmpty({message: 'Username Is Required'})
  fullname: string;

  @ApiProperty()
  @IsNotEmpty({message: 'Email Is Required'})
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty({message: 'Password Is Required'})
  @MinLength(8, {message: 'Password should be at least 8 characters'})
  @Validate(PasswordConstraint, {
    message: 'Password should have at least 1 upper character and 1 number'
  })
  password: string;

  @IsNotEmpty({message: 'You Must Confirm Your Password'})
  @ApiProperty()
  confirmpassword: string;
}
