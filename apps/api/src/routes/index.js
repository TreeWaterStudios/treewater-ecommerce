import { Router } from 'express';
import healthCheck from './health-check.js';
import printfulRouter from './printful.js';
import stripeRouter from './stripe.js';
import checkoutRouter from './checkout.js';
import uploadRouter from './upload.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/printful', printfulRouter);
    router.use('/stripe', stripeRouter);
    router.use('/checkout', checkoutRouter);
    router.use('/', uploadRouter);

    return router;
};
