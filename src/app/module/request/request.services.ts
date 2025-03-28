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

const getOwnerAllRequest = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
  }
  const result = await prisma.request.findMany({ where: { ownerId: userId } });
  return result;
};

export const RequestServices = {
  createRequest,
  getOwnerAllRequest,
};
