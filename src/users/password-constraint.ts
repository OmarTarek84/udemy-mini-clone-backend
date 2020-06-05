import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({name: 'passValid', async: false})
export class PasswordConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z\W\S]{1,}$/;
    return passwordRegex.test(text);
  }

  defaultMessage() {
    return 'Password should have at least 1 upper character and 1 number';
  }
}
