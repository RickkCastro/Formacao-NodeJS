import fastify from 'fastify';
import crypto from 'node:crypto';
import { knex } from './database';
import { title } from 'node:process';
import { env } from './env';
import { transactionsRoutes } from './routes/transactions';
import fastifyCookie from '@fastify/cookie';

const app = fastify();
app.register(fastifyCookie);

//Validacao global dentro desse plugin / rota
app.addHook('preHandler', async (req) => {
	console.log(`[${req.method}] ${req.url}`);
});

app.register(transactionsRoutes, { prefix: '/transactions' });

app.listen({
	port: env.PORT,
}).then(() => {
	console.log('Server is running on http://localhost:3333');
});
