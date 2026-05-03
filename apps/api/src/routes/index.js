import { Router } from 'express';
import healthCheck from './health-check.js';
import printfulRouter from './printful.js';
import stripeRouter from './stripe.js';
import checkoutRouter from './checkout.js';
import uploadRouter from './upload.js';
import mockupsRouter from './mockups.js';
import adminRouter from './admin.js';

const router = Router();

export default () => {
  router.get('/health', healthCheck);
  router.use('/admin', adminRouter);
  router.use('/printful', printfulRouter);
  router.use('/stripe', stripeRouter);
  router.use('/checkout', checkoutRouter);
  router.use('/', uploadRouter);
  router.use('/', mockupsRouter);
  return router;
};
