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
const deleteProfilePicture = async (id: string) => {
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
  const isUserExist = await prisma.user.findUnique({ where: { id: id } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }
  if (!isUserExist.photo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No image found');
  }
  const result = await prisma.user.update({
    where: { id: id },
    data: { photo: '' },
  });
  return result;
};

const getOwnerDashboard = async (ownerId: string) => {
  const result = await prisma.$transaction(async prisma => {
    // Count total houses owned by this owner
    const totalHouses = await prisma.house.count({
      where: { ownerId },
    });

    // Count booked houses for this owner
    const bookedHouses = await prisma.house.count({
      where: {
        ownerId,
        status: 'BOOKED',
      },
    });

    // Count available houses for this owner
    const availableHouses = await prisma.house.count({
      where: {
        ownerId,
        status: 'AVAILABLE',
      },
    });

    // Count requests related to this owner's houses
    const requestCounts = await prisma.request.groupBy({
      by: ['requestStatus'],
      where: { ownerId },
      _count: { _all: true },
    });

    const requestStatusSummary = {
      PENDING: 0,
      ACCEPTED: 0,
      CANCEL: 0,
    };

    requestCounts.forEach(item => {
      requestStatusSummary[item.requestStatus] = item._count._all;
    });

    // Count feedbacks for this owner's houses
    const totalFeedbacks = await prisma.feedback.count({
      where: {
        house: {
          ownerId,
        },
      },
    });
    return {
      totalHouses,
      bookedHouses,
      availableHouses,
      requestStatusSummary,
      totalFeedbacks,
    };
  });

  return result;
};
export const UsersServices = {
  updateUserProfile,
  getMyProfile,
  deleteProfilePicture,
  getOwnerDashboard,
};