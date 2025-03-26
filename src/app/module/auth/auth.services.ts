import { User } from '@prisma/client';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import {
  encryptPassword,
  isPasswordMatched,
} from '../../../helpers/encription';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import { ILoginUser, ILoginUserResponse } from './auth.interface';

const userRegistration = async (payload: User): Promise<User> => {
  const { password, ...othersData } = payload;

  const isUserAlreadyExist = await prisma.user.findUnique({
    where: { email: othersData?.email },
  });
  if (isUserAlreadyExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already registered !');
  }
  // Encrypt password
  const encryptedPassword = await encryptPassword(password);

  // Start a Prisma transaction
  const result = await prisma.user.create({
    data: { ...othersData, password: encryptedPassword },
  });

  return result;
};

export const AuthServices = {
  userRegistration,
};
