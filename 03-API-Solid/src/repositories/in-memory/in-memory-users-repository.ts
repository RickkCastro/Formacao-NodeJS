import { User, Prisma } from '@prisma/client';
import { UserRepository } from '../useres-repository';

export class InMemoryUserRepository implements UserRepository {
	public items: User[] = [];

	async create(data: Prisma.UserCreateInput) {
		const user = {
			id: 'user',
			name: data.name,
			email: data.email,
			password_hash: data.password_hash,
			created_at: new Date(),
		};

		this.items.push(user);

		return user;
	}

	async findByEmail(email: string) {
		const user = this.items.find((user) => user.email === email);

		if (!user) {
			return null;
		}

		return user;
	}
}
