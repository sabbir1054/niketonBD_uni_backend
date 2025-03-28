import { z } from 'zod';

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required ' }),
  }),
});

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: 'Refresh Token is required' }),
  }),
});

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z.string({ required_error: 'New password is required' }),
  }),
});

const makeSuperAdminZodSchema = z.object({
  body: z.object({
    userName: z.string({ required_error: 'User name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    role: z.enum(['SUPERADMIN'], { required_error: 'Role is required' }),
    passKey: z.string({
      required_error: 'Provide valid secret passKey',
    }),
  }),
});
const makeAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'User name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    role: z.enum(['ADMIN'], { required_error: 'Role is required' }),
  }),
});
const makeUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'User name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    role: z.enum(['OWNER', 'TENANT'], { required_error: 'Role is required' }),
  }),
});

export const AuthValidation = {
  loginZodSchema,
  refreshTokenZodSchema,
  changePasswordZodSchema,
  makeUserZodSchema,
  makeAdminZodSchema,
  makeSuperAdminZodSchema,
};
