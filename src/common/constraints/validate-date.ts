/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationArguments, registerDecorator } from 'class-validator';

export function IsDateFormat(
  format: string,
  validationOptions?: { message?: string },
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [format],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          const regex = /^\d{4}-\d{2}-\d{2}$/;
          return regex.test(value);
        },

        defaultMessage(args: ValidationArguments) {
          return (
            validationOptions?.message ||
            `${args.property} must be in yyyy-mm-dd format`
          );
        },
      },
    });
  };
}
