import { expect, test, beforeAll, beforeEach, afterAll, describe, it } from 'vitest';
import { execSync } from 'node:child_process';
import { app } from '../src/app';
import request from 'supertest';

describe('Transactions routes', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		execSync('npm run knex migrate:rollback --all');
		execSync('npm run knex migrate:latest');
	});

	it('Should be able to create a new transactions', async () => {
		const response = await request(app.server).post('/transactions').send({
			title: 'Test Transaction',
			amount: 5000,
			type: 'credit',
		});

		expect(response.statusCode).toEqual(201);
	});

	// it('Should be able to create a new transactions', async () => {})
	it('Should be able to list all transactions', async () => {
		const createTransactionResponse = await request(app.server).post('/transactions').send({
			title: 'Test Transaction',
			amount: 5000,
			type: 'credit',
		});

		const cookies = createTransactionResponse.headers['set-cookie'];

		const listTransactionsResponse = await request(app.server)
			.get('/transactions')
			.set('Cookie', cookies);

		expect(listTransactionsResponse.body.transactions).toEqual([
			expect.objectContaining({
				title: 'Test Transaction',
				amount: 5000,
			}),
		]);
	});

	it('Should be able to get a speecific transactions', async () => {
		const createTransactionResponse = await request(app.server).post('/transactions').send({
			title: 'Test Transaction',
			amount: 5000,
			type: 'credit',
		});

		const cookies = createTransactionResponse.headers['set-cookie'];

		const listTransactionsResponse = await request(app.server)
			.get('/transactions')
			.set('Cookie', cookies)
			.expect(200);

		const transactionId = listTransactionsResponse.body.transactions[0].id;

		const getTransactionResponse = await request(app.server)
			.get(`/transactions/${transactionId}`)
			.set('Cookie', cookies)
			.expect(200);

		expect(getTransactionResponse.body.transaction).toEqual(
			expect.objectContaining({
				title: 'Test Transaction',
				amount: 5000,
			})
		);
	});

	it('Should be able to get the summary', async () => {
		const createTransactionResponse = await request(app.server).post('/transactions').send({
			title: 'Credit Transaction',
			amount: 5000,
			type: 'credit',
		});

		const cookies = createTransactionResponse.headers['set-cookie'];

		await request(app.server).post('/transactions').set('Cookie', cookies).send({
			title: 'Debit Transaction',
			amount: 4000,
			type: 'debit',
		});

		const summaryResponse = await request(app.server)
			.get('/transactions/summary')
			.set('Cookie', cookies)
			.expect(200);

		expect(summaryResponse.body.summary).toEqual({
			amount: 1000,
		});
	});
});
