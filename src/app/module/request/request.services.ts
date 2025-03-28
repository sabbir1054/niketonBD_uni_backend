import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createRequest = async (tenantId: string, houseId: string) => {
  const isHouseExist = await prisma.house.findUnique({
    where: { id: houseId },
  });
  if (!isHouseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'House not found');
  }
  const isTenantExist = await prisma.user.findUnique({
    where: { id: tenantId },
  });

  if (!isTenantExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant info not found');
  }
  const result = await prisma.request.create({
    data: {
      tenantId: tenantId,
      ownerId: isHouseExist.ownerId,
      houseId: isHouseExist.id,
    },
  });
  return result;
};
const requestDetails = async (id: string, userId: string) => {
  const result = await prisma.request.findUnique({ where: { id: id } });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request info not found');
  }
  if (result.ownerId !== userId && result.tenantId !== userId) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'You are not able to see others booking request',
    );
  }
  return result;
};

export const RequestServices = {
  createRequest,
  requestDetails
};
