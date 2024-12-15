import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check for a valid birth date:
 * 1. Date must be valid.
 * 2. Date must not be in the future.
 * 3. Date must not exceed a realistic age (default 120 years).
 */
export function birthDateValidator(maxAge: number = 120): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Allow empty values. Use `Validators.required` separately if needed.
    }

    const birthDate = new Date(value);
    const today = new Date();

    // Check if the input is a valid date
    if (isNaN(birthDate.getTime())) {
      return { invalidDate: 'The entered date is not valid.' };
    }

    // Check if the date is in the future
    if (birthDate > today) {
      return { futureDate: 'Birth date cannot be in the future.' };
    }

    // Check if the age is greater than the maximum allowed age
    var age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age based on the current month/day
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age > maxAge) {
      return { maxAgeExceeded: `Age cannot exceed ${maxAge} years.` };
    }

    // If all validations pass
    return null;
  };
}
