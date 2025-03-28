import express from 'express';
import { AuthRoutes } from '../module/auth/auth.route';
import { HouseRoutes } from '../module/house/house.route';
import { RequestRoutes } from '../module/request/request.route';
import { UsersRoutes } from '../module/users/users.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/house',
    route: HouseRoutes,
  },
  {
    path: '/user',
    route: UsersRoutes,
  },
  {
    path: '/request',
    route: RequestRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
