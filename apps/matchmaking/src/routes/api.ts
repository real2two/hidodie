import HyperExpress from 'hyper-express';

import { router as authorizeRouter } from './api/authorize';

export const router = new HyperExpress.Router();

router.get('/', (req, res) => {
  res.json({
    hello: 'world',
  });
});

router.use('/authorize', authorizeRouter);

router.all('/*', (req, res) => {
  res.status(404).json({
    error: 'not_found',
  });
});
