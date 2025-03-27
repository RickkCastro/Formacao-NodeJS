import { PrismaUserRepository } from '@/repositories/prisma/prisma-user-repository';
import { expect, test, describe, it } from 'vitest';
import { RegisterService } from './register';
import { compare } from 'bcryptjs';
import { InMemoryUserRepository } from '@/repositories/in-memory/in-memory-users-repository';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

describe('Register Use Case', () => {
	it('should be able to register', async () => {
		const usersRepository = new InMemoryUserRepository();
		const registerService = new RegisterService(usersRepository);

		const { user } = await registerService.execute({
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: '123456',
		});

		expect(user.id).toEqual(expect.any(String));
	});

	it('should hash user password upon register', async () => {
		const usersRepository = new InMemoryUserRepository();
		const registerService = new RegisterService(usersRepository);

		const { user } = await registerService.execute({
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: '123456',
		});

		const isPasswordCorretlyHashed = await compare('123456', user.password_hash);

		expect(isPasswordCorretlyHashed).toBeTruthy();
	});

	it('Should not be able to register with same email twice', async () => {
		const usersRepository = new InMemoryUserRepository();
		const registerService = new RegisterService(usersRepository);

		await registerService.execute({
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: '123456',
		});

		await expect(() =>
			registerService.execute({
				name: 'John Doe',
				email: 'john.doe@example.com',
				password: '123456',
			})
		).rejects.toBeInstanceOf(UserAlreadyExistsError);
	});
});
