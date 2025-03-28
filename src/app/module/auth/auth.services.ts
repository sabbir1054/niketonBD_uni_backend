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
import { IEmailInfo, sentEmail } from '../../../helpers/nodeMailer';
import { otpGenerator } from '../../../helpers/stringGenrator';
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
    // refreshToken,
  };
};

const changePassword = async (user: any, payload: any): Promise<void> => {
  const { oldPassword, newPassword } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { id: user?.id },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (
    isUserExist.password &&
    !(await isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is not matched');
  }

  const newEncryptedPassword = await encryptPassword(newPassword);
  const result = await prisma.user.update({
    where: { id: isUserExist.id },
    data: { password: newEncryptedPassword },
  });
};

const forgetPasswordOTPSend = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
  }

  const generatedOTP = otpGenerator();
  const saveTokenDB = await prisma.user.update({
    where: { email: email },
    data: { otp: generatedOTP },
  });

  if (!saveTokenDB?.otp) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp Send failed !');
  }

  const payload1: IEmailInfo = {
    from: `${config.email_host.user}`,
    to: isUserExist?.email,
    subject: 'Forget password of Niketon BD',
    text: `Hi ${isUserExist?.name} ,`,
    html: `<div><b><h1>Niketon BD</h1></b> </br> <h4> Your OTP is  </h4></br> <h1> <b>${generatedOTP}</b>  </h1></div>`,
  };
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const emailSendResult = await sentEmail(payload1);
  if (emailSendResult.accepted.length === 0) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email send failed !');
  }
};

const forgetPasswordOTPVerify = async (email: string, otp: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
  }

  const isTokenSame = isUserExist?.otp === otp;

  if (!isTokenSame) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not matched');
  }
};

const forgetPasswordSetNewPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  // password validity check

  const isUserExist = await prisma.user.findUnique({
    where: { email: email, otp: otp },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
  }

  // encrypt password
  const encryptedPassword = await encryptPassword(newPassword);

  const setNewPassword = await prisma.user.update({
    where: { email: email, otp: otp },
    data: { otp: null, password: encryptedPassword },
  });

  if (
    !setNewPassword?.otp === null &&
    setNewPassword?.password === newPassword
  ) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to set new password !',
    );
  }

  // send mail that password changed
};
export const AuthServices = {
  userRegistration,
  userLogin,
  changePassword,
  forgetPasswordOTPSend,
  forgetPasswordOTPVerify,
  forgetPasswordSetNewPassword,
};
