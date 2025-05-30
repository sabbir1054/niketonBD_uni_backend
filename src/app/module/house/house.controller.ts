import { House } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { HouseServices } from './house.services';
import { paginationFields } from '../../../constants/paginationFields';
import { houseFilterableFields } from './house.constant';
import pick from '../../../shared/pick';

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
  const filters = pick(req.query, houseFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await HouseServices.getAllHouses(filters,options);
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


const addImageToHouse = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseServices.addImageToHouse(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'House photo updated ',
    data: result,
  });
});
const deleteImageFromHouse = catchAsync(async (req: Request, res: Response) => {
  const { imageId, houseId } = req.params;
  const { id: userId } = req.user as any;

  const result = await HouseServices.deleteImageFromHouse(
    imageId,
    houseId,
    userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product photo updated ',
    data: result,
  });
});


const updateHouse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;
  const { id: userId, role: userRole } = req.user as any;
  const result = await HouseServices.updateHouse(id, data, userId, userRole);

  sendResponse<House>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'House updated successfully !!',
    data: result,
  });
});
export const HouseController = {
  createNew,
  deleteHouse,
  getAllHouse,
  getMyAllHouse,
  getHouseDetails,
  updateHouse,
  addImageToHouse,
  deleteImageFromHouse,
};
