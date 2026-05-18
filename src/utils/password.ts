import { passwordStrength } from "check-password-strength";
import './password.css';
export const checkPasswordStrength = (pwd: string) => {
    const result = passwordStrength(pwd); // use the pwd from input
    // setStrength(result.value); // update state
    return result;
  }