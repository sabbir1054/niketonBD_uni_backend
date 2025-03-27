import express from 'express';
import { AuthRoutes } from '../module/auth/auth.route';
import { HouseRoutes } from '../module/house/house.route';

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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
