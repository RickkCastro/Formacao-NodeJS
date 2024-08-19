import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
    #database = {};

    constructor() {
        fs.readFile(databasePath, "utf8")
            .then((data) => (this.#database = JSON.parse(data)))
            .catch(() => this.#persist());
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    await;

    insert(table, data) {
        //Verrificar se a tabela existe em database
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }

        this.#persist();

        return data;
    }

    select(table, search) {
        let data = this.#database[table] ?? [];

        if (data.length == []) {
            return [];
        }

        if (search) {
            data = data.filter((row) => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase());
                });
            });
        }

        return data;
    }

    selectById(table, id) {
        //Verrificar se a tabela existe em database
        if (Array.isArray(this.#database[table])) {
            const index = this.#database[table].findIndex(
                (row) => row.id === id
            );

            if (index > -1) {
                return this.#database[table][index];
            } else {
                throw new Error(
                    `Row with id ${id} not found in table ${table}`
                );
            }
        }
    }

    delete(table, id) {
        //Verrificar se a tabela existe em database
        if (Array.isArray(this.#database[table])) {
            const index = this.#database[table].findIndex(
                (row) => row.id === id
            );

            if (index !== -1) {
                this.#database[table].splice(index, 1);
                this.#persist();
            } else {
                throw new Error(
                    `Row with id ${id} not found in table ${table}`
                );
            }
        }
    }

    update(table, id, data) {
        //Verrificar se a tabela existe em database
        const index = this.#database[table].findIndex((row) => row.id === id);

        //Registro existe
        if (index > -1) {
            const record = this.#database[table][index];
            const updateRecord = { ...record, ...data, id: record.id };
            this.#database[table][index] = updateRecord;

            this.#persist();
            return this.#database[table][index];
        } else {
            throw new error(`Row with ${id} not found in table ${table}`);
        }
    }
}
