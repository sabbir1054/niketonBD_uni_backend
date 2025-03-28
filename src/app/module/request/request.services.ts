import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { requestSearchableFields } from './request.constant';

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

const getOwnerAllRequest = async (
  userId: string,
  filters: any,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: requestSearchableFields.map((field: any) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const conditions = Object.entries(filtersData).map(([field, value]) => ({
      [field]: value,
    }));
    andConditions.push({ AND: conditions });
  }
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
  }

  //user id filter
  andConditions.push({ ownerId: userId });

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : { ownerId: userId };
  const result = await prisma.request.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      owner: true,
      tenant: true,
      house: { include: { images: true } },
    },
  });
  const total = await prisma.request.count({
    where: whereConditions,
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getTenantAllRequest = async (
  userId: string,
  filters: any,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: requestSearchableFields.map((field: any) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const conditions = Object.entries(filtersData).map(([field, value]) => ({
      [field]: value,
    }));
    andConditions.push({ AND: conditions });
  }

  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
  }
  //user id filter
  andConditions.push({ tenantId: userId });

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : { tenantId: userId };
  const result = await prisma.request.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      owner: true,
      tenant: true,
      house: { include: { images: true } },
    },
  });
  const total = await prisma.request.count({
    where: whereConditions,
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
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

const updateRequestStatus = async (
  id: string,
  userId: string,
  status: 'ACCEPTED' | 'PENDING' | 'CANCEL',
) => {
  const isExist = await prisma.request.findUnique({ where: { id: id } });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request info not found');
  }
  if (isExist.ownerId !== userId && isExist.tenantId !== userId) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'You are not able to see others booking request',
    );
  }
  const result = await prisma.request.update({
    where: { id: id },
    data: { requestStatus: status },
  });
  return result;
};

export const RequestServices = {
  createRequest,
  getOwnerAllRequest,
  requestDetails,
  getTenantAllRequest,
  updateRequestStatus,
};
