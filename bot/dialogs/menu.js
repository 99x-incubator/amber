'use strict';

const builder = require('botbuilder');
const library = new builder.Library('menu');

const menu = [
    'log',
    'reminder'
];

library.dialog('root', [
    (session, args) => {
        const menuPrompt = (args && args.reprompt) ? 'menu_reprompt' : 'menu_prompt',
            menuItems = session.localizer.gettext(session.preferredLocale(), 'menu_items', 'menu');

        builder.Prompts.choice(session, menuPrompt, menuItems,
            { listStyle: builder.ListStyle.button, maxRetries: 1, retryPrompt: 'menu_retry', });
    },
    (session, results) => {
        if (results.resumed === builder.ResumeReason.notCompleted) {
            session.endConversation('cancel_conversation');
        }
        else if (results.response) {
            const { index } = results.response,
                targetDialog = menu[index];

            session.beginDialog(`${targetDialog}:root`);
        }
    },
    (session, results) => {
        builder.Prompts.confirm(session, 'menu_repeat_prompt', { maxRetries: 1 });
    },
    (session, results) => {
        if (results.response) {
            session.replaceDialog('menu:root', { reprompt: true });
        }
        else {
            session.endConversation('complete_conversation');
        }
    }
]).triggerAction({
    matches: /^menu$/i,
    confirmPrompt: 'menu_trigger'
});;

module.exports = library;