'use strict';

const builder = require('botbuilder');
const library = new builder.Library('reminder');

library.dialog('/', [
    (session) => {
        session.endDialog('intro');
    }
]);

module.exports = library;