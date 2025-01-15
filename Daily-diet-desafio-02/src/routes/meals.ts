import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'crypto';
import getUserBySessionId from '../middlewares/getUserBySessionId';

export async function mealsRoutes(app: FastifyInstance) {
	//get and verify logged user
	app.addHook('preHandler', async (req, res) => {
		await getUserBySessionId(req, res);
	});

	//create a meal
	app.post('/', async (req, res) => {
		const createMealsSchma = z.object({
			name: z.string(),
			description: z.string().optional(),
			isOnDiet: z.boolean(),
			datetime: z.coerce.date(),
		});

		const { name, description, isOnDiet, datetime } = createMealsSchma.parse(req.body);

		await knex('meals').insert({
			id: randomUUID(),
			name,
			description,
			isOnDiet,
			datetime: datetime.toISOString(),
			userId: req.user?.id,
			createdAt: new Date().toISOString(),
		});

		return res.status(201).send({ message: 'Meal created' });
	});

	//delete a meal
	app.delete('/:mealId', async (req, res) => {
		const deleteMealsSchema = z.object({
			mealId: z.string().uuid(),
		});

		const { mealId } = deleteMealsSchema.parse(req.params);

		const meal = await knex('meals').where({ id: mealId }).first();

		if (!meal) {
			return res.status(404).send({ error: 'Meal not found' });
		}

		await knex('meals').where({ id: mealId }).delete();

		return res.status(204).send();
	});

	//get all meals
	app.get('/', async (req, res) => {
		const meals = await knex('meals')
			.where({ userId: req.user?.id })
			.orderBy('datetime', 'desc')
			.select('*');
		return res.send({ meals });
	});

	//get meal by id
	app.get('/:mealId', async (req, res) => {
		const getMealSchema = z.object({
			mealId: z.string().uuid(),
		});

		const { mealId } = getMealSchema.parse(req.params);

		const meal = await knex('meals').where({ id: mealId }).first();

		if (!meal) {
			return res.status(404).send({ error: 'Meal not found' });
		}

		return res.send({ meal });
	});
}
