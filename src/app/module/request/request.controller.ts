import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/paginationFields';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { RequestServices } from './request.services';
import { requestFilterableFields } from './request.constant';

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
  const filters = pick(req.query, requestFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await RequestServices.getOwnerAllRequest(id, filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking Request retrieve successfully',
    meta: result.meta,
    data: result.data,
  });
});
const getTenantAllRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const filters = pick(req.query, requestFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await RequestServices.getTenantAllRequest(
    id,
    filters,
    options,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking Request retrieve successfully',
    meta: result.meta,
    data: result.data,
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
const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.user as any;
  const { status } = req.body;
  const result = await RequestServices.updateRequestStatus(id, userId, status);
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
  updateRequestStatus,
  getTenantAllRequest,
};
