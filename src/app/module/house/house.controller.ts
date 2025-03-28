import { House } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { HouseServices } from './house.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseServices.createNew(req);
  sendResponse<House>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'New house added !',
    data: result,
  });
});
const deleteHouse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { id: userId, role: userRole } = req.user as any;
  const result = await HouseServices.deleteHouse(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'House delete successfully !!',
    data: result,
  });
});

const getAllHouse = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseServices.getAllHouses();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houses fetched successfully !!',
    data: result,
  });
});
const getMyAllHouse = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role: userRole } = req.user as any;
  const result = await HouseServices.getMyAllHouse(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houses fetched successfully !!',
    data: result,
  });
});
const getHouseDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await HouseServices.getHouseDetails(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houses fetched successfully !!',
    data: result,
  });
});
export const HouseController = {
  createNew,
  deleteHouse,
  getAllHouse,
  getMyAllHouse,
  getHouseDetails,
};
