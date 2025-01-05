import "dotenv/config";
import { z } from "zod";

const envShema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("production"),
	DATABASE_URL: z.string(),
	DATABASE_CLIENT: z.string(),
});

const _env = envShema.safeParse(process.env);
if (_env.success === false) {
	console.error("⚠️ invalid environmet variable!", _env.error.format());

	throw new Error("Invalid environmet variable");
}

export const env = _env.data;
