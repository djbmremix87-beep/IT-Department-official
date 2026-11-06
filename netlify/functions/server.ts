import serverless from 'serverless-http';
import app from '../../server.ts';

export const handler = serverless(app);
