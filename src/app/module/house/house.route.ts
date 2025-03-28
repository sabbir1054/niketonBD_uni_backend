import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelpers';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from './../../../enums/user';
import { HouseController } from './house.controller';
const router = express.Router();
// Extend Request interface to include files property
type MulterRequest = Request & {
  files?: Express.Multer.File[];
};
router.post(
  '/add',
  auth(ENUM_USER_ROLE.OWNER),
  FileUploadHelper.upload.array('files', 5),
  (req: Request, res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;
    multerReq.body = JSON.parse(multerReq.body.data);
    if (multerReq.files) {
      multerReq.body.fileUrls = multerReq.files.map(
        file => `${config.api_link_Image}/api/v1/house/image/${file.filename}`,
      );
    }

    return HouseController.createNew(multerReq, res, next);
  },
);
router.get('/image/:fileName', async (req: Request, res: Response) => {
  const filePath = await path.join(
    process.cwd(),
    'uploads',
    path.basename(req.params.fileName),
  );
  // Check if the file exists
  await fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
    }

    // Send the image file
    res.sendFile(filePath);
  });
});
router.get('/single/:id', HouseController.getHouseDetails);
router.get('/', HouseController.getAllHouse);
router.get(
  '/myHouses',
  auth(ENUM_USER_ROLE.OWNER),
  HouseController.getMyAllHouse,
);

router.delete(
  '/delete/:id',
  auth(ENUM_USER_ROLE.OWNER),
  HouseController.deleteHouse,
);

export const HouseRoutes = router;
