import { FastifyReply, FastifyRequest } from 'fastify';
import { knex } from '../database';

export default async function (req: FastifyRequest, res: FastifyReply) {
	let sessionId = req.cookies.sessionId;

	if (!sessionId) {
		return res.status(401).send({ message: 'Unauthorized' });
	}

	const user = await knex('users').where({ sessionId }).first();

	if (!user) {
		return res.status(401).send({ message: 'Unauthorized user not found' });
	}

	req.user = user;
}
