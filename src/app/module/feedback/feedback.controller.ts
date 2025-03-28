import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FeedbackService } from './feedback.services';

const createFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const { houseId } = req.params;
  const result = await FeedbackService.giveFeedback(id, houseId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback send Successfully',
    data: result,
  });
});
const getOwnersAllFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const result = await FeedbackService.getOwnersAllFeedback(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback retrieve Successfully',
    data: result,
  });
});
const getTenantAllFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const result = await FeedbackService.getTenantAllFeedback(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback retrieve Successfully',
    data: result,
  });
});
const feedbackDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FeedbackService.feedbackDetails(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback retrieve Successfully',
    data: result,
  });
});
const deleteFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.user as any;
  const result = await FeedbackService.deleteFeedback(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback retrieve Successfully',
    data: result,
  });
});
const updateFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.user as any;
  const result = await FeedbackService.updateFeedback(id, userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback update Successfully',
    data: result,
  });
});
export const FeedbackController = {
  createFeedback,
  getOwnersAllFeedback,
  getTenantAllFeedback,
  feedbackDetails,
  deleteFeedback,
  updateFeedback,
};
