import { prisma } from '@/lib/prisma';
import { PrismaUserRepository } from '@/repositories/prisma/prisma-user-repository';
import { UserAlreadyExistsError } from '@/services/errors/user-already-exists-error';
import { RegisterService } from '@/services/register';
import { hash } from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function register(req: FastifyRequest, res: FastifyReply) {
	const registerBodyScheme = z.object({
		name: z.string(),
		email: z.string().email(),
		password: z.string().min(6),
	});

	const { name, email, password } = registerBodyScheme.parse(req.body);

	try {
		const usersRepository = new PrismaUserRepository();
		const registerService = new RegisterService(usersRepository);

		await registerService.execute({ name, email, password });
	} catch (err) {
		if (err instanceof UserAlreadyExistsError) {
			return res.status(409).send({ message: err.message });
		}

		throw err;
	}

	return res.status(201).send();
}
