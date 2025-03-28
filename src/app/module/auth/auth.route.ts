import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.makeUserZodSchema),
  AuthController.userRegistration,
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.userLogin,
);

// router.post(
//   '/changePassword',
//   auth(

//     ENUM_USER_ROLE.OWNER,
//     ENUM_USER_ROLE.TENANT,
//   ),
//   validateRequest(AuthValidation.changePasswordZodSchema),
//   AuthController.changePassword,
// );

// router.get(
//   '/sendVerificationLink',
//   auth(
//     ENUM_USER_ROLE.OWNER,
//     ENUM_USER_ROLE.TENANT,
//   ),
//   AuthController.sendEmailForVerifyAccount,
// );
// router.post(
//   '/verifyEmail/:email/:token',

//   AuthController.verifyEmail,
// );
// router.post('/forgetPasswordEmailSend', AuthController.forgetPasswordOTPSend);
// router.post('/forgetPasswordOTPVerify', AuthController.forgetPasswordOTPVerify);
// router.post(
//   '/forgetPasswordSetNewPassword',
//   AuthController.forgetPasswordSetNewPassword,
// );

export const AuthRoutes = router;
