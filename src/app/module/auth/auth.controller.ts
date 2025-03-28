/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ILoginUserResponse } from './auth.interface';
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

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.userLogin(req.body);
  const { refreshToken, ...others } = result;
  // set refresh token in to cookie
  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOption);
  sendResponse<ILoginUserResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login successfully',
    data: others,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;
  await AuthServices.changePassword(user, passwordData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
  });
});

const forgetPasswordOTPSend = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    AuthServices.forgetPasswordOTPSend(email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OTP SEND TO EMAIL !',
    });
  },
);
const forgetPasswordOTPVerify = catchAsync(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await AuthServices.forgetPasswordOTPVerify(email, otp);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OTP matched',
    });
  },
);

const forgetPasswordSetNewPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await AuthServices.forgetPasswordSetNewPassword(email, otp, newPassword);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Successfully password changed',
    });
  },
);

export const AuthController = {
  userRegistration,
  userLogin,
  changePassword,
  forgetPasswordOTPSend,
  forgetPasswordOTPVerify,
  forgetPasswordSetNewPassword,
};
