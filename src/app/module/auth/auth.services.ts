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
    // refreshToken,
  };
};

// const changePassword = async (
//   user: JwtPayload | null,
//   payload: IChangePassword,
// ): Promise<void> => {
//   const { oldPassword, newPassword } = payload;
//   const isUserExist = await prisma.user.findUnique({
//     where: { id: user?.id },
//   });

//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
//   }

//   if (
//     isUserExist.password &&
//     !(await isPasswordMatched(oldPassword, isUserExist.password))
//   ) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is not matched');
//   }

//   // password validity check
//   const passwordValidity = checkPasswordStrength(
//     isUserExist.email,
//     newPassword,
//   );
//   if (!passwordValidity.validity) {
//     throw new ApiError(httpStatus.BAD_REQUEST, passwordValidity.msg);
//   }

//   const newEncryptedPassword = await encryptPassword(newPassword);
//   const result = await prisma.user.update({
//     where: { id: isUserExist.id },
//     data: { password: newEncryptedPassword },
//   });

//   if (result?.id) {
//     const payload1: IEmailInfo = {
//       from: `${config.email_host.user}`,
//       to: result?.email,
//       subject: 'Password change of Niketon BD',
//       text: `Hi ${isUserExist?.userName} your password has been successfully updated`,
//       html: '<b><h1>Niketon BD</h1></b>',
//     };
//     // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//     const emailSendResult = await sentEmail(payload1);
//     if (emailSendResult.accepted.length === 0) {
//       throw new ApiError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         'Email send failed !',
//       );
//     }
//   }
// };

// const sendEmailForVerifyAccount = async (
//   user: JwtPayload | null,
//   token: string | undefined,
// ) => {
//   const isUserExist = await prisma.user.findUnique({ where: { id: user?.id } });
//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
//   }
//   // make uniq token with jwt
//   const newToken = token + randomString();

//   const saveTokenDB = await prisma.user.update({
//     where: { id: user?.id },
//     data: { token: newToken },
//   });

//   if (!saveTokenDB?.token) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Verification failed');
//   }

//   const payload1: IEmailInfo = {
//     from: `${config.email_host.user}`,
//     to: isUserExist?.email,
//     subject: 'Email Verification of Niketon BD',
//     text: `Hi ${isUserExist?.userName} ,`,
//     html: `<div><b><h1>Niketon BD</h1></b> </br> <p> We're excited to have you on board. To ensure the security of your account and provide you with the best experience, please click the link below to verify your email address:</p></br> <a href="${config.base_url_frontend}/verifyEmail/${isUserExist?.email}/${newToken}">Click here to verify your email</a> </br><p> Thank you for choosing Niketon Bd ! If you have any questions or need assistance, feel free to reach out to our support team at support@niketonbd.com. </p></div>`,
//   };
//   // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//   const emailSendResult = await sentEmail(payload1);
//   if (emailSendResult.accepted.length === 0) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email send failed !');
//   }
// };

// const verifyEmail = async (
//   email: string | undefined,
//   token: string | undefined,
// ) => {
//   const isUserExist = await prisma.user.findUnique({
//     where: { email: email },
//   });
//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
//   }
//   const isTokenSame = isUserExist?.token === token;

//   if (!isTokenSame) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Verification failed');
//   }

//   const removeToken = await prisma.user.update({
//     where: { id: isUserExist?.id },
//     data: { token: null, verified: true },
//   });

//   if (!removeToken?.token === null && removeToken?.verified === false) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Verification failed');
//   }

//   const payload1: IEmailInfo = {
//     from: `${config.email_host.user}`,
//     to: isUserExist?.email,
//     subject: 'Email Verified  Niketon BD',
//     text: `Hi ${isUserExist?.userName} ,`,
//     html: `Your Email is Verified`,
//   };
//   // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//   const emailSendResult = await sentEmail(payload1);
//   if (emailSendResult.accepted.length === 0) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email send failed !');
//   }
// };

// const forgetPasswordOTPSend = async (email: string) => {
//   const isUserExist = await prisma.user.findUnique({
//     where: { email: email },
//   });
//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
//   }

//   const generatedOTP = otpGenerator();
//   const saveTokenDB = await prisma.user.update({
//     where: { email: email },
//     data: { token: generatedOTP },
//   });

//   if (!saveTokenDB?.token) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp Send failed !');
//   }

//   const payload1: IEmailInfo = {
//     from: `${config.email_host.user}`,
//     to: isUserExist?.email,
//     subject: 'Forget password of Niketon BD',
//     text: `Hi ${isUserExist?.userName} ,`,
//     html: `<div><b><h1>Niketon BD</h1></b> </br> <h4> Your OTP is  </h4></br> <h1> <b>${generatedOTP}</b>  </h1></div>`,
//   };
//   // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//   const emailSendResult = await sentEmail(payload1);
//   if (emailSendResult.accepted.length === 0) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email send failed !');
//   }
// };

// const forgetPasswordOTPVerify = async (email: string, otp: string) => {
//   const isUserExist = await prisma.user.findUnique({
//     where: { email: email },
//   });
//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
//   }

//   const isTokenSame = isUserExist?.token === otp;

//   if (!isTokenSame) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not matched');
//   }
// };

// const forgetPasswordSetNewPassword = async (
//   email: string,
//   otp: string,
//   newPassword: string,
// ) => {
//   // password validity check
//   const passwordValidity = checkPasswordStrength(email, newPassword);
//   if (!passwordValidity.validity) {
//     throw new ApiError(httpStatus.BAD_REQUEST, passwordValidity.msg);
//   }

//   const isUserExist = await prisma.user.findUnique({
//     where: { email: email, token: otp },
//   });
//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
//   }

//   // encrypt password
//   const encryptedPassword = await encryptPassword(newPassword);

//   const setNewPassword = await prisma.user.update({
//     where: { email: email, token: otp },
//     data: { token: null, password: encryptedPassword },
//   });

//   if (
//     !setNewPassword?.token === null &&
//     setNewPassword?.password === newPassword
//   ) {
//     throw new ApiError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Failed to set new password !',
//     );
//   }

//   // send mail that password changed

//   const payload1: IEmailInfo = {
//     from: `${config.email_host.user}`,
//     to: isUserExist?.email,
//     subject: 'Successfully change password of Niketon BD',
//     text: `Hi ${isUserExist?.userName} ,`,
//     html: `<div><b><h1>Niketon BD</h1></b> </br> <h1> <b>Your password is changed</b>  </h1></div>`,
//   };
//   // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//   const emailSendResult = await sentEmail(payload1);
//   if (emailSendResult.accepted.length === 0) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email send failed !');
//   }
// };

export const AuthServices = {
  userRegistration,
  userLogin,
  //   changePassword,
  //   sendEmailForVerifyAccount,
  //   verifyEmail,
  //   forgetPasswordOTPSend,
  //   forgetPasswordOTPVerify,
  //   forgetPasswordSetNewPassword,
};
