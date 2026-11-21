// AUTH AREA - the parent account: log in, sign up (+ email code), forgot password (+ code, new password).
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import EmailVerificationScreen from './EmailVerificationScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import PasswordOtpScreen from './PasswordOtpScreen';
import ResetPasswordScreen from './ResetPasswordScreen';

export const SCREENS = [
  { name: 'LogIn', component: LoginScreen },
  { name: 'SignUp', component: SignUpScreen },
  { name: 'EmailVerification', component: EmailVerificationScreen },
  { name: 'ForgotPassword', component: ForgotPasswordScreen },
  { name: 'PasswordOtp', component: PasswordOtpScreen },
  { name: 'ResetPassword', component: ResetPasswordScreen },
];
