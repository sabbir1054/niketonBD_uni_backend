import { House } from '@prisma/client';
import { Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { houseSearchableFields } from './house.constant';
const createNew = async (payload: Request): Promise<House> => {
  const { id: userId } = payload.user as any;

  const userInfo = await prisma.user.findUnique({ where: { id: userId } });
  if (!userInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user info not found');
  }

  const { fileUrls, ...others } = payload.body;
  if (fileUrls) {
    const result = await prisma.house.create({
      data: {
        images: {
          create: fileUrls.map((url: string) => ({ url })),
        },
        ...others,
        ownerId: userId,
      },
      include: {
        houseOwner: true,
        images: true,
      },
    });
    return result;
  } else {
    const result = await prisma.house.create({
      data: { ownerId: userId, ...others },
      include: {
        houseOwner: true,
      },
    });
    return result;
  }
};

const deleteHouse = async (
  id: string,
  userId: string,
  userRole: string,
): Promise<House | null> => {
  const isExist = await prisma.house.findUnique({
    where: { id },
    include: { houseOwner: true, images: true },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'House not exist !');
  }

  if (userRole === 'OWNER' && isExist?.houseOwner?.id !== userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You are not able to make change !',
    );
  }

  const result = await prisma.$transaction(async prisma => {
    // Delete images from the server
    for (const image of isExist.images) {
      const filePath = path.join(
        process.cwd(),
        'uploads',
        path.basename(image.url),
      );
      fs.unlink(filePath, err => {
        if (err) {
          console.error(`Failed to delete image: ${filePath}`);
        }
      });
    }

    // Delete image records from the database
    await prisma.houseImage.deleteMany({
      where: { houseId: id },
    });

    // Delete the product
    const result = await prisma.house.delete({
      where: { id: id },
    });
    return result;
  });

  return result;
};
const getAllHouses = async (
  filters: any,
  options: IPaginationOptions,
): Promise<IGenericResponse<House[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, minRentFee, maxRentFee, ...filtersData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: houseSearchableFields.map(field => ({
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

  const minRentFeeFloat = parseFloat(minRentFee);
  const maxRentFeeFloat = parseFloat(maxRentFee);

  if (!isNaN(minRentFeeFloat)) {
    andConditions.push({
      rentFee: {
        gte: minRentFeeFloat,
      },
    });
  }
  if (!isNaN(maxRentFeeFloat)) {
    andConditions.push({
      rentFee: {
        lte: maxRentFeeFloat,
      },
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.house.findMany({
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
      images: true,
      houseOwner: true,
      Feedback: true,
    },
  });

  const total = await prisma.house.count({
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
const getMyAllHouse = async (id: string): Promise<House[]> => {
  const res = await prisma.house.findMany({ where: { ownerId: id } });
  return res;
};
const getHouseDetails = async (id: string): Promise<House> => {
  const res = await prisma.house.findUnique({
    where: { id: id },
    include: {
      images: true,
      houseOwner: true,
      Feedback: { include: { tenant: true } },
    },
  });
  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, 'House not found');
  }
  return res;
};

const addImageToHouse = async (req: Request): Promise<House | null> => {
  const { houseId } = req.params;
  const { id: userId } = req.user as any;
  const { fileUrls } = req.body;

  const isHouseExist = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      images: true,
    },
  });

  const isValidOwner = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!isValidOwner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }

  if (!isHouseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'House not found ');
  }
  if (isHouseExist?.ownerId !== isValidOwner.id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Only owner can update house ');
  }

  //* check number of images
  const currentImageCount = isHouseExist.images.length;
  const newImagesCount = fileUrls.length;

  if (currentImageCount + newImagesCount > 5) {
    const availableSlots = 5 - currentImageCount;

    if (availableSlots < newImagesCount) {
      const excessFiles = fileUrls.slice(availableSlots);
      excessFiles.forEach((url: string) => {
        const filePath = path.join(
          process.cwd(),
          'uploads',
          path.basename(url),
        );
        fs.unlink(filePath, err => {
          if (err) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Failed to delete image: ${filePath}`,
            );
          }
        });
      });
    }
    // Trim the fileUrls array to fit the available slots
    fileUrls.splice(availableSlots, newImagesCount - availableSlots);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `You can upload only ${availableSlots} images`,
    );
  }

  const result = await prisma.house.update({
    where: { id: houseId },
    data: {
      images: {
        create: fileUrls.map((url: string) => ({ url })),
      },
    },
    include: {
      houseOwner: true,
      images: true,
    },
  });
  return result;
};

const deleteImageFromHouse = async (
  imageId: string,
  houseId: string,
  userId: string,
): Promise<House | null> => {
  const isValidOwner = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!isValidOwner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }

  const isProductExist = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      houseOwner: true,
      images: true,
    },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }

  if (isProductExist?.ownerId !== isValidOwner.id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid owner  ');
  }

  const isImageExist = await prisma.houseImage.findUnique({
    where: { id: imageId, houseId: houseId },
  });

  if (!isImageExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Image not found ');
  }

  // Delete the image file from the server
  const filePath = path.join(
    process.cwd(),
    'uploads',
    path.basename(isImageExist.url),
  );
  fs.unlink(filePath, err => {
    if (err) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Failed to delete image: ${filePath}`,
      );
    }
  });

  // Delete the image from the database
  await prisma.houseImage.delete({
    where: { id: imageId },
  });

  const result = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      houseOwner: true,
      images: true,
    },
  });

  return result;
};

const updateHouse = async (
  id: string,
  data: Partial<House>,
  userId: string,
  userRole: string,
): Promise<House | null> => {
  const isExist = await prisma.house.findUnique({
    where: { id },
    include: { houseOwner: true },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'House not exist !');
  }

  if (isExist?.houseOwner?.id !== userId && userRole === 'OWNER') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You are not able to make change !',
    );
  }

  const result = await prisma.house.update({ where: { id }, data });
  return result;
};
export const HouseServices = {
  createNew,
  deleteHouse,
  getAllHouses,
  getMyAllHouse,
  getHouseDetails,
  addImageToHouse,
  deleteImageFromHouse,
  updateHouse,
};
