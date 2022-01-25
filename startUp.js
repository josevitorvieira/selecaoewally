require('dotenv/config');

const express = require('express');
const billetController = require('./controllers/billetController');

const api = express();
const port =process.env.PORT || 8080

const start = ()=>{
    api.use(express.json());
    api.use('/', billetController);
    api.listen( port, ()=> console.log(`APi iniciada na porta ${port}`));
}

start();

