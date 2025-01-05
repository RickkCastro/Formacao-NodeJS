import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from '../middlewares/check-sessionId-exists';

// Cookies <---> formas de manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance) {
	// Validação global para todas as routas desse plugin
	app.addHook('preHandler', async (req, res) => {
		console.log(`[${req.method}] - ${req.url} `);
	});

	app.get('/', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
		const { sessionId } = req.cookies;

		const transactions = await knex('transactions')
			.where('session_id', sessionId)
			.select();

		return { transactions };
	});

	app.get(
		'/:id',
		{ preHandler: [checkSessionIdExists] },
		async (req, res) => {
			const requestParamsSchema = z.object({
				id: z.string().uuid(),
			});

			const { sessionId } = req.cookies;

			const { id } = requestParamsSchema.parse(req.params);

			const transaction = await knex('transactions')
				.where('id', id)
				.andWhere('session_id', sessionId)
				.first();

			return { transaction };
		}
	);

	app.post('/', async (req, reply) => {
		reply;
		const createTransactionsBodySchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(['credit', 'debit']),
		});

		const { title, amount, type } = createTransactionsBodySchema.parse(
			req.body
		);

		let sessionId = req.cookies.sessionId;

		if (!sessionId) {
			sessionId = randomUUID();
			reply.cookie('sessionId', sessionId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});
		}

		await knex('transactions').insert({
			id: randomUUID(),
			title,
			amount: type === 'credit' ? amount : amount * -1,
			session_id: sessionId,
		});

		return reply.code(201).send();
	});

	app.get('/summary', { preHandler: [checkSessionIdExists] }, async (req) => {
		const { sessionId } = req.cookies;

		const summary = await knex('transactions')
			.where('session_id', sessionId)
			.sum('amount', { as: 'amount' })
			.first();

		return { summary };
	});
}
