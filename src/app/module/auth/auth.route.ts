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

export const AuthRoutes = router;
