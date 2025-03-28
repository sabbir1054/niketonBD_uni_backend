import { House } from '@prisma/client';
import { Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
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
      },
      include: {
        houseOwner: true,
        images: true,
      },
    });
    return result;
  } else {
    const result = await prisma.house.create({
      data: others,
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
const getAllHouses = async (): Promise<House[]> => {
  const res = await prisma.house.findMany();
  return res;
};
const getMyAllHouse = async (id: string): Promise<House[]> => {
  const res = await prisma.house.findMany({ where: { ownerId: id } });
  return res;
};
const getHouseDetails = async (id: string): Promise<House> => {
  const res = await prisma.house.findUnique({ where: { id: id } });
  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, 'House not found');
  }
  return res;
};
export const HouseServices = {
  createNew,
  deleteHouse,
  getAllHouses,
  getMyAllHouse,
  getHouseDetails,
};
