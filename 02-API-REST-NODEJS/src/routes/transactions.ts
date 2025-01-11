import { FastifyInstance, FastifyReply } from 'fastify';
import { title } from 'process';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from '../middlewares/check-sessionId-exists';

export async function transactionsRoutes(app: FastifyInstance) {
	app.get('/', { preHandler: [checkSessionIdExists] }, async (req, res) => {
		const { sessionId } = req.cookies;

		const transactions = await knex('transactions').where('session_id', sessionId).select();
		const total = transactions.map((t) => t.amount).reduce((acc, amount) => acc + amount, 0);

		return { total: total, transactions };
	});

	app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
		const getTransactionParamsSchema = z.object({
			id: z.string().uuid(),
		});

		const { id } = getTransactionParamsSchema.parse(req.params);

		const { sessionId } = req.cookies;

		const transaction = await knex('transactions').where({ session_id: sessionId, id }).first();

		if (!transaction) {
			return res.status(404).send();
		}

		return { transaction };
	});

	app.get('/summary', { preHandler: [checkSessionIdExists] }, async (req, res) => {
		const { sessionId } = req.cookies;

		const summary = await knex('transactions')
			.where('session_id', sessionId)
			.sum('amount', { as: 'amount' })
			.first();

		return { summary: summary };
	});

	app.post('/', async (req, res) => {
		const createTransactionBodySchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(['credit', 'debit']),
		});

		const { title, amount, type } = createTransactionBodySchema.parse(req.body);

		let sessionId = req.cookies.sessionId;

		if (!sessionId) {
			sessionId = randomUUID();
			res.cookie('sessionId', sessionId, {
				path: '/transactions',
				maxAge: 60 * 60 * 24, // 24 hours,
			});
		}

		await knex('transactions').insert({
			id: randomUUID(),
			title,
			amount: type === 'credit' ? amount : amount * -1,
			session_id: sessionId,
		});

		return res.status(201).send();
	});
}
