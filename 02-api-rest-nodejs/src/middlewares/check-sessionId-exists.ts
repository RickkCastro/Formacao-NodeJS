import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify/types/request';

export async function checkSessionIdExists(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const sessionId = request.cookies.sessionId;

	if (!sessionId) {
		return reply.status(401).send({ error: 'Session unauthorized' });
	}
}
