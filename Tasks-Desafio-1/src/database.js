export class Database {
    #database = {};

    insert(table, data) {
        //Verrificar se a tabela existe em database
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }
    }
}
