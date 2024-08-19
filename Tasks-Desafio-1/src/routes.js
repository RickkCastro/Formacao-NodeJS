import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import path from "node:path";

const database = new Database();

export const routes = [
    {
        method: "POST",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { title, description } = req.body;

            if (title == null || description == null) {
                return res.writeHead(400).end("Missing fields");
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const data = database.insert("tasks", task);
            return res.writeHead(201).end(JSON.stringify(data));
        },
    },
    {
        method: "GET",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { search } = req.query;

            const tasks = database.select(
                "tasks",
                search
                    ? {
                          title: search,
                          description: search,
                      }
                    : null
            );

            return res.writeHead(200).end(JSON.stringify(tasks));
        },
    },
    {
        method: "DELETE",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                database.delete("tasks", id);
                return res.writeHead(204).end();
            } catch (err) {
                return res.writeHead(500).end(err.message);
            }
        },
    },
    {
        method: "PUT",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params;
            const data = { ...req.body };

            // Lista dos campos permitidos para atualização
            const allowedFields = ["title", "description"];

            // Filtrar os campos que são permitidos
            const filteredData = Object.keys(data)
                .filter((key) => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = data[key];
                    return obj;
                }, {});

            if (Object.keys(filteredData).length === 0) {
                return res
                    .writeHead(400)
                    .end("No valid fields provided for update");
            }

            filteredData.updated_at = new Date();

            try {
                const reponse = database.update("tasks", id, filteredData);
                return res.writeHead(200).end(JSON.stringify(reponse));
            } catch (err) {
                return res.writeHead(500).end(err.message);
            }
        },
    },
    {
        method: "PATCH",
        path: buildRoutePath("/tasks/:id/complete"),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                const data = database.selectById("tasks", id);

                if (data.completed_at == null) {
                    data.completed_at = new Date();
                } else {
                    data.completed_at = null;
                }

                database.update("tasks", id, data);
                return res.writeHead(200).end(JSON.stringify(data));
            } catch (err) {
                return res.writeHead(404).end(err.message);
            }
        },
    },
];
