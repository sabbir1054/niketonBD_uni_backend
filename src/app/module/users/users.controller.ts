import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UsersServices } from './users.services';

const updateUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UsersServices.updateUserProfile(req, next);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User updated ',
      data: result,
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user as any;
    const result = await UsersServices.getMyProfile(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User updated ',
      data: result,
    });
  },
);
const deleteProfilePicture = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user as any;
    const result = await UsersServices.deleteProfilePicture(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User photo deleted ',
      data: result,
    });
  },
);
const getOwnerDashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user as any;
    const result = await UsersServices.getOwnerDashboard(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User dashboard retrieve done ',
      data: result,
    });
  },
);

export const UsersController = {
  updateUserProfile,
  getMyProfile,
  deleteProfilePicture,
  getOwnerDashboard,
};
