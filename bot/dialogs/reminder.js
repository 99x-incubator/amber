'use strict';

const builder = require('botbuilder');
const library = new builder.Library('reminder');

library.dialog('root', [
    (session) => {
        session.endDialog('intro');
    }
]);

module.exports = library;