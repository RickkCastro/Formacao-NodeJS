import path from "node:path";
import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
    {
        method: "GET",
        path: buildRoutePath("/users"),
        handler: (req, res) => {
            const { search } = req.query;
            const users = database.select(
                "users",
                search
                    ? {
                          name: search,
                          email: search,
                      }
                    : null
            );
            return res.end(JSON.stringify(users));
        },
    },
    {
        method: "POST",
        path: buildRoutePath("/users"),
        handler: (req, res) => {
            const { name, email } = req.body;

            const user = {
                id: randomUUID(),
                name: name,
                email: email,
            };

            database.insert("users", user);

            return res.writeHead(201).end();
        },
    },
    {
        method: "DELETE",
        path: buildRoutePath("/users/:id"),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                database.delete("users", id);
            } catch (err) {
                return res.writeHead(500).end(err.message);
            }

            return res.writeHead(204).end();
        },
    },
    {
        method: "PUT",
        path: buildRoutePath("/users/:id"),
        handler: (req, res) => {
            const { id } = req.params;
            const { name, email } = req.body;

            try {
                database.update("users", id, { name, email });
            } catch (err) {
                return res.writeHead(500).end(err.message);
            }

            return res.writeHead(204).end();
        },
    },
];
