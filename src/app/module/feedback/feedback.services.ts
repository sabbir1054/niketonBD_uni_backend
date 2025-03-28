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

export const FeedbackService = {
  giveFeedback,
  getOwnersAllFeedback,
};
