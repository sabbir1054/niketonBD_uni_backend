import express from 'express';
import { AuthRoutes } from '../module/auth/auth.route';
import { HouseRoutes } from '../module/house/house.route';
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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
