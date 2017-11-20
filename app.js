'use strict';

const restify = require('restify');
const bot = require('./bot');

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

server.post('/api/messages', bot.connector().listen());