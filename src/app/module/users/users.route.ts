import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelpers';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from './../../../enums/user';
import { UsersController } from './users.controller';
const router = express.Router();

router.get(
  '/myProfile',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.TENANT),
  UsersController.getMyProfile,
);
export const UsersRoutes = router;
