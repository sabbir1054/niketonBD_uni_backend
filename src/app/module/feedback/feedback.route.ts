import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { FeedbackController } from './feedback.controller';

const router = express.Router();

router.post(
  '/submit',
  auth(ENUM_USER_ROLE.TENANT),
  FeedbackController.createFeedback,
);

export const FeedbackRoutes = router;
