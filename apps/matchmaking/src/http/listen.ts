import env from '@/env';
import HyperExpress from 'hyper-express';

import { router as apiRouter } from '../routes/api';

export const app = new HyperExpress.Server();
app.use('/api', apiRouter);

app.listen(env.MatchmakingServerPort);
