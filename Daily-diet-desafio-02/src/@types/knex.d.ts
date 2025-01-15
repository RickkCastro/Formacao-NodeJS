import { Knex } from 'knex';

declare module 'knex/types/tables' {
	export interface Tables {
		users: {
			id: string;
			name: string;
			email: string;
			sessionId: string;
		};

		meals: {
			id: string;
			name: string;
			userId: string;
			description: string;
			isOnDiet: boolean;
			datetime: string;
			createdAt: string;
			updatedAt: string;
		};
	}
}
