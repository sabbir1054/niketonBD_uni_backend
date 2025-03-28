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
router.get(
  '/ownerFeedback',
  auth(ENUM_USER_ROLE.OWNER),
  FeedbackController.getOwnersAllFeedback,
);

router.get(
  '/tenantFeedback',
  auth(ENUM_USER_ROLE.TENANT),
  FeedbackController.getTenantAllFeedback,
);
router.get('/details/:id', FeedbackController.feedbackDetails);
router.delete(
  '/delete/:id',
  auth(ENUM_USER_ROLE.TENANT),
  FeedbackController.deleteFeedback,
);
export const FeedbackRoutes = router;
