import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { RequestController } from './request.controller';

const router = express.Router();

router.post(
  '/createRequest',
  auth(ENUM_USER_ROLE.TENANT),
  RequestController.createRequest,
);
router.get(
  '/details/:id',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.TENANT),
  RequestController.requestDetails,
);
export const RequestRoutes = router;
