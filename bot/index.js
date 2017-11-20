'use strict';

const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector, [
    (session) => {
        session.beginDialog('menu:/');
    },
    (session, results)=> {
        session.endConversation();
    }
]);

bot.set('localizerSettings', {
    botLocalePath: './bot/locale',
    defaultLocale: 'en'
});

bot.library(require('./dialogs/menu'));
bot.library(require('./dialogs/log'));
bot.library(require('./dialogs/reminder'));

module.exports = exports = bot;