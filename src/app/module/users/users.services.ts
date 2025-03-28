import { NextFunction, Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const updateUserProfile = async (req: Request, next: NextFunction) => {
  const { id: userId } = req.user as any;

  const deletePhoto = async (photoLink: string) => {
    // Delete the image file from the server
    const filePath = path.join(
      process.cwd(),
      'uploads/userPhoto',
      path.basename(photoLink),
    );
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath); // Using fs.promises.unlink for a promise-based approach
      } catch (err) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Failed to delete image or database record`,
        );
      }
    } else {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Image not found in the directory',
      );
    }
  };

  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    //* delete uploaded photo
    deletePhoto(req.body.photo);
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }
  //* make updated data
  const data: any = req.body as any;

  const result = await prisma.$transaction(async prisma => {
    if (isUserExist.photo && req.body.photo !== isUserExist.photo) {
      //* delete photo
      if (req.body.photo && isUserExist.photo) {
        deletePhoto(isUserExist.photo);
      }
      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
        },
      });

      return result;
    } else {
      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
        },
      });

      return result;
    }
  });
  return result;
};

const getMyProfile = async (id: string) => {
  const res = await prisma.user.findUnique({ where: { id: id } });
  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return res;
};

export const UsersServices = {
  updateUserProfile,
  getMyProfile,
};
