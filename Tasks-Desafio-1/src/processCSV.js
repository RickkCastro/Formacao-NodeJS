import fs from "node:fs";
import { parse } from "csv-parse";
import path from "node:path";

async function processCSV(filepath) {
    const parser = fs.createReadStream(filepath).pipe(parse({ columns: true }));

    for await (const record of parser) {
        try {
            const response = await fetch("http://localhost:3333/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: record.title,
                    description: record.description,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to create task: ${response.statusText}`
                );
            }

            const data = await response.json();
            console.log(`Task created: ${data.id}`);
        } catch (err) {
            console.error(`Failed to create task: ${err.message}`);
        }
    }
}

const pathCSV = new URL("./tasks.csv", import.meta.url);
processCSV(pathCSV);
