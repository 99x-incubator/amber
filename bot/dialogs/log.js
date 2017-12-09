'use strict';

const builder = require('botbuilder');
const library = new builder.Library('log');

library.dialog('root', [
    (session, args) => {
        session.beginDialog('log:uploadFile');
    },
    (session, results) => {
        if (results.resumed === builder.ResumeReason.notCompleted) {
            session.endConversation('cancel_conversation');
        }
        else {
            builder.Prompts.confirm(session, 'log_repeat_prompt',
                { maxRetries: 1, retryPrompt: 'log_repeat_retry' });
        }
    },
    (session, results) => {
        if (results.response) {
            session.replaceDialog('log:root', { reprompt: true });
        }
        else {
            const message = (results.resumed === builder.ResumeReason.notCompleted) ?
                'cancel_conversation' : 'complete_conversation';

            session.endConversation(message);
        }
    }
]);

library.dialog('uploadFile', [
    (session, args) => {
        const prompt = (args && args.prompt) ? args.prompt : 'upload_prompt';

        builder.Prompts.attachment(session, prompt,
            { maxRetries: 1, retryPrompt: 'upload_retry' });
    },
    (session, results, next) => {
        if (results.resumed === builder.ResumeReason.notCompleted) {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted
            });
        }
        else {
            session.dialogData.attachments = results.response;
            next();
        }
    },
    (session, results, next) => {
        const attachments = session.dialogData.attachments;

        if (!attachments) {
            session.replaceDialog('log:uploadFile', { prompt: 'upload_prompt_retry' });
        }
        else {
            next();
        }
    },
    (session, results, next) => {
        const attachments = session.dialogData.attachments;

        if (attachments.length !== 1) {
            session.replaceDialog('log:uploadFile', { prompt: 'uploaded_multiple' });
        }
        else {
            next();
        }
    },
    (session, results, next) => {
        const attachment = session.dialogData.attachments[0];

        if (attachment.contentType !== 'text/plain') {
            session.replaceDialog('log:uploadFile', { prompt: 'uploaded_unrecognized' });
        }
        else {
            next();
        }
    },
    (session, results, next) => {
        const attachment = session.dialogData.attachments[0];

        session.endDialogWithResult({
            resumed: builder.ResumeReason.completed,
            response: attachment
        });
    }
]);

module.exports = library;