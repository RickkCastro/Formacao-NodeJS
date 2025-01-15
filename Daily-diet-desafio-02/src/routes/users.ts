import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';

export async function usersRoutes(app: FastifyInstance) {
	app.post('/', async (req, res) => {
		const createUsersSchema = z.object({
			name: z.string(),
			email: z.string().email(),
		});

		const { name, email } = createUsersSchema.parse(req.body);

		let sessionId = req.cookies.sessionId;

		if (!sessionId) {
			sessionId = randomUUID();
			res.cookie('sessionId', sessionId, {
				path: '/',
				maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days});
			});
		}

		const userByEmail = await knex('users').where({ email }).first();

		if (userByEmail) {
			return res.status(400).send({ message: 'User already exists' });
		}

		await knex(`users`).insert({
			id: randomUUID(),
			name,
			email,
			sessionId,
		});

		return res.status(201).send({ message: 'User created' });
	});
}
