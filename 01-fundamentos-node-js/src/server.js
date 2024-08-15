/*

CommonJS => require - quase n utilizado
const http = require("http");

EsModules => import/export - novo padrão

Criar um user (name, email, senha) = req (request)


- Criar user
- Listar user
- Edicao user
- Deletar user

- HTTP
    - Metodo http
        GET, POST, PUT, PATCH, DELETE
    - URL

- GET => Buscar
- POST => Criar
- PUT => Atulizar recurso
- PATCH => Atulizar unica informação
- DELETE => Deletar


Stateful (Salve em memoria) - Stateless (Salva em dispositivos externos)

JSON - JavaScript Object Notation

Cabeçalhos (Req/Res) => metadados

3 formas do front enviar infos para api
- Query parameters: localhost:3333/users?userId=1&name=rick - URL Stateful => filtros, paginacao, nao obrigatorios
- Route parameters: http://localhost:3333/users/1 - Identificao
- Request body: {name: rick, age: 19} - Envio de um formulario (HTTPs)

*/

import http from "node:http";
import { json } from "./middlewares/json.js";
import { routes } from "./routes.js";
import { extractQueryParams } from "./utils/extract-query-params.js";

const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    await json(req, res);

    const route = routes.find((route) => {
        return route.method === method && route.path.test(url);
    });

    if (route) {
        const routeParam = req.url.match(route.path);

        const { query, ...params } = routeParam.groups;

        req.params = params;
        req.query = query ? extractQueryParams(query) : {};

        return route.handler(req, res);
    }

    return res.writeHead(404).end();
});

server.listen(3333);
