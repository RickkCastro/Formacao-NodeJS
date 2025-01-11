import fastify from 'fastify';
import { transactionsRoutes } from './routes/transactions';
import fastifyCookie from '@fastify/cookie';

export const app = fastify();
app.register(fastifyCookie);

//Validacao global dentro desse plugin / rota
app.addHook('preHandler', async (req) => {
	console.log(`[${req.method}] ${req.url}`);
});

app.register(transactionsRoutes, { prefix: '/transactions' });
