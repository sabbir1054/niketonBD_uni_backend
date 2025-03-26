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

const userLogin = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const isUserExist = await prisma.user.findUnique({ where: { email: email } });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist !');
  }

  if (
    isUserExist.password &&
    !(await isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is not matched');
  }

  // create user access token and refresh token
  const { id, role } = isUserExist;

  const accessToken = jwtHelpers.createToken(
    { id, role, email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtHelpers.createToken(
    { id, role, email },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};
export const AuthServices = {
  userRegistration,
  userLogin
};
