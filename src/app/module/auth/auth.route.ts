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
export const AuthRoutes = router;
