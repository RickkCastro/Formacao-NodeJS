import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('meals', (table) => {
		table.uuid('id').primary();
		table.uuid('userId').references('users.id').notNullable();
		table.string('name').notNullable();
		table.string('description');
		table.timestamp('datetime').notNullable();
		table.boolean('isOnDiet').notNullable();
		table.timestamp('createdAt').notNullable();
		table.timestamp('updatedAt');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('meals');
}

