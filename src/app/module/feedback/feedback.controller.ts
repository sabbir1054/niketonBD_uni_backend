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
  const result = await FeedbackService.getOwnersAllFeedback(
    id,
 
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback retrieve Successfully',
    data: result,
  });
});

export const FeedbackController = {
  createFeedback,
  getOwnersAllFeedback,
};
