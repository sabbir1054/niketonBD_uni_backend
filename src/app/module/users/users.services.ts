import { NextFunction, Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const getMyProfile = async (id: string) => {
  const res = await prisma.user.findUnique({ where: { id: id } });
  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return res;
};

export const UsersServices = {
  getMyProfile,
};
