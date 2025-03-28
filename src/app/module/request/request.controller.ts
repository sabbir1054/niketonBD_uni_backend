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

export const RequestController = {
  createRequest,
};
