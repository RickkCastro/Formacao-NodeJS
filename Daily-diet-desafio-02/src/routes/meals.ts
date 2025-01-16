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

	app.put('/:mealId', async (req, res) => {
		const paramsSchema = z.object({ mealId: z.string().uuid() });

		const { mealId } = paramsSchema.parse(req.params);

		const updateMealSchema = z.object({
			name: z.string().optional(),
			description: z.string().optional(),
			isOnDiet: z.boolean().optional(),
			datetime: z.coerce.date().optional(),
		});

		const { name, description, isOnDiet, datetime } = updateMealSchema.parse(req.body);

		const meal = await knex('meals').where({ id: mealId }).first();

		if (!meal) {
			return res.status(404).send({ error: 'Meal not found' });
		}

		await knex('meals').where({ id: mealId }).update({
			name,
			description,
			isOnDiet,
			datetime: datetime?.toISOString(),
			updatedAt: new Date().toISOString(),
		});

		return res.status(204).send({ message: 'Meal updated' });
	});

	// - Quantidade total de refeições registradas
	// - Quantidade total de refeições dentro da dieta
	// - Quantidade total de refeições fora da dieta
	// - Melhor sequência de refeições dentro da dieta
	app.get('/metrics', async (req, res) => {
		const totalMeals = await knex('meals')
			.where({ userId: req.user?.id })
			.orderBy('datetime', 'desc');

		const onDietMeals = await knex('meals')
			.where({ userId: req.user?.id, isOnDiet: true })
			.count('id', { as: 'total' })
			.first();

		const offDietMeals = await knex('meals')
			.where({ userId: req.user?.id, isOnDiet: false })
			.count('id', { as: 'total' })
			.first();

		const { bestOnDietSequence } = totalMeals.reduce(
			(acc, meal) => {
				// Verifica se a refeição está na dieta
				if (meal.isOnDiet) {
					acc.currentSequence += 1; // Incrementa a sequência atual
				} else {
					acc.currentSequence = 0; // Reseta a sequência se a refeição não estiver na dieta
				}

				// Atualiza a maior sequência se a atual for maior
				if (acc.currentSequence > acc.bestOnDietSequence) {
					acc.bestOnDietSequence = acc.currentSequence;
				}

				return acc; // Retorna o acumulador para a próxima iteração
			},
			{ bestOnDietSequence: 0, currentSequence: 0 } // Valor inicial do acumulador
		);

		res.send({
			totalMeals: totalMeals.length,
			onDietMeals,
			offDietMeals,
			bestOnDietSequence,
		});
	});
}
