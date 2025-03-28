import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelpers';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from './../../../enums/user';
import { UsersController } from './users.controller';
const router = express.Router();
// Extend Request interface to include files property
type MulterRequest = Request & {
  files?: Express.Multer.File[];
};
router.post(
  '/updateProfile',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.TENANT),
  FileUploadHelper.uploadProfile.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body = JSON?.parse(req.body?.data);
    }

    if (req.file) {
      req.body.photo = `${config.api_link_Image}/api/v1/user/profile/image/${req.file.filename}`;
    }
    return UsersController.updateUserProfile(req, res, next);
  },
);

router.get(
  '/profile/image/:fileName',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filePath = path.join(
        process.cwd(),
        'uploads/userPhoto',
        path.basename(req.params.fileName),
      );

      // Check if the file exists
      await fs.promises.access(filePath, fs.constants.F_OK);

      // Send the image file if it exists
      res.sendFile(filePath);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // File not found, return 404 error
        next(new ApiError(httpStatus.NOT_FOUND, 'Image not found'));
      } else {
        // Handle all other errors as 500 Internal Server Error
        next(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while processing your request',
          ),
        );
      }
    }
  },
);

router.get(
  '/myProfile',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.TENANT),
  UsersController.getMyProfile,
);
export const UsersRoutes = router;
