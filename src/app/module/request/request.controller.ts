import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RequestServices } from './request.services';

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const { houseId } = req.body;
  const result = await RequestServices.createRequest(id, houseId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking Request send Successfully',
    data: result,
  });
});
const getOwnerAllRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const result = await RequestServices.getOwnerAllRequest(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking Request retrieve successfully',
    data: result,
  });
});
const requestDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.user as any;
  const result = await RequestServices.requestDetails(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking Request retrieve ',
    data: result,
  });
});

export const RequestController = {
  createRequest,
  getOwnerAllRequest,
  requestDetails,
};