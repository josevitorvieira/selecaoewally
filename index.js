require('dotenv/config');
const swaggerUi = require('swagger-ui-express')
const express = require('express');

const billetController = require('./controllers/billetController');
const swaggerDocs = require('./swagger.json');

const api = express();
const port = process.env.PORT || 8080;

api.use(express.json());
api.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
api.use('/', billetController);
api.listen( port, ()=> console.log(`APi iniciada na porta ${port}`));

module.exports = api;