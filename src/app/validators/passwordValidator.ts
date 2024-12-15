import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // If the control is empty, don't validate yet
    if (!control.value) {
      return null;
    }

    // Regular expression checks for the password
    const hasUpperCase = /[A-Z]/.test(control.value);  // Checks for uppercase
    const hasLowerCase = /[a-z]/.test(control.value);  // Checks for lowercase
    const hasDigits = /\d/.test(control.value);  // Checks for digits
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);  // Checks for special characters
    const isValidLength = control.value.length >= 8;  // Checks for length >= 8

    // If any of the conditions is not met, return an error
    if (!hasUpperCase) {
      return { passwordStrength: 'A palavra-passe deve conter pelo menos uma letra maiúscula' };
    }
    if (!hasLowerCase) {
      return { passwordStrength: 'A palavra-passe deve conter pelo menos uma letra minúscula' };
    }
    if (!hasDigits) {
      return { passwordStrength: 'A palavra-passe deve conter pelo menos um dígito' };
    }
    if (!hasSpecialChar) {
      return { passwordStrength: 'A palavra-passe deve conter pelo menos um caracter especial' };
    }
    if (!isValidLength) {
      return { passwordStrength: 'A palavra-passe deve conter pelo menos 8 caracteres' };
    }

    // If all conditions are met, return null (valid)
    return null;
  };
}
