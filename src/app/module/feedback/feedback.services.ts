import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
export type IFeedback = {
  rating: number;
  comment: string;
};
const giveFeedback = async (
  userId: string,
  houseId: string,
  payload: IFeedback,
) => {
  const isHouseExist = await prisma.house.findUnique({
    where: { id: houseId },
  });
  if (!isHouseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'House Not found');
  }

  const isValidTenant = await prisma.request.findFirst({
    where: {
      AND: [
        { tenantId: userId },
        { houseId: houseId },
        { requestStatus: 'ACCEPTED' },
      ],
    },
  });

  if (!isValidTenant) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'You are not valid tenant');
  }
  const isFeedbackExist = await prisma.feedback.findFirst({
    where: {
      AND: [{ tenantId: userId }, { houseId: houseId }],
    },
  });
  if (isFeedbackExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You have already give the feedback',
    );
  }

  const result = await prisma.feedback.create({
    data: { ...payload, houseId: houseId, tenantId: userId },
  });
  return result;
};

const getOwnersAllFeedback = async (userId: string) => {
  const result = await prisma.feedback.findMany({
    where: { house: { ownerId: userId } },
  });
  return result;
};
const getTenantAllFeedback = async (userId: string) => {
  const result = await prisma.feedback.findMany({
    where: { tenantId: userId },
  });
  return result;
};
const feedbackDetails = async (id: string) => {
  const result = await prisma.feedback.findMany({
    where: {
      id: id,
    },
    include: {
      house: { include: { houseOwner: true } },
      tenant: true,
    },
  });
  return result;
};

const deleteFeedback = async (id: string, userId: string) => {
  const isFeedbackExist = await prisma.feedback.findUnique({
    where: { id: id },
  });
  if (!isFeedbackExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback not found');
  }
  if (isFeedbackExist.tenantId !== userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback tenant not match');
  }
  const result = await prisma.feedback.delete({ where: { id: id } });
  return result;
};
const updateFeedback = async (
  id: string,
  userId: string,
  payload: IFeedback,
) => {
  const isFeedbackExist = await prisma.feedback.findUnique({
    where: { id: id },
  });
  if (!isFeedbackExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback not found');
  }
  if (isFeedbackExist.tenantId !== userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback tenant not match');
  }
  const result = await prisma.feedback.update({
    where: { id: id },
    data: { ...payload },
  });
  return result;
};

export const FeedbackService = {
  giveFeedback,
  getOwnersAllFeedback,
  getTenantAllFeedback,
  feedbackDetails,
  deleteFeedback,
  updateFeedback,
};
