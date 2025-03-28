import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';

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

router.post(
  '/changePassword',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.TENANT),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePassword,
);

export const AuthRoutes = router;
