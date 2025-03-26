/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthServices } from './auth.services';

const userRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.userRegistration(req.body);

  sendResponse<User>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is created !!',
    data: result,
  });
});

export const AuthController = {
  userRegistration,
};
