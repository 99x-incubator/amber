'use strict';

const builder = require('botbuilder');
const library = new builder.Library('log');

library.dialog('root', [
    (session, args) => {
        session.beginDialog('uploadFile');
    },
    (session, results) => {
        const { ResumeReason } = builder;

        if (ResumeReason[results.resumed] === 'notCompleted') {
            session.endConversation('cancel_conversation');
        }
        else {
            builder.Prompts.confirm(session, 'log_repeat_prompt',
                { maxRetries: 1, retryPrompt: 'log_repeat_prompt_retry' });
        }
    },
    (session, results) => {
        const { ResumeReason } = builder;

        if (results.response) {
            session.replaceDialog('root', { reprompt: true });
        }
        else {
            const exitPrompt = (ResumeReason[results.resumed] === 'notCompleted') ?
                'cancel_conversation' : 'complete_conversation';
            session.endConversation(exitPrompt);
        }
    }
]);

library.dialog('uploadFile', [
    (session, args) => {
        const uploadPrompt = (args && args.message) ? args.message : 'upload_prompt',
            attempt = (args && args.attempt) ? args.attempt : 1;

        session.dialogData.attempt = attempt;

        builder.Prompts.attachment(session, uploadPrompt,
            { maxRetries: 1, retryPrompt: 'upload_prompt_retry' });
    },
    (session, results) => {
        const { ResumeReason } = builder,
            attachments = results.response;
        let attempt = session.dialogData.attempt;

        if (attachments && attempt < 2) {
            if (attachments.length === 1) {
                const attachment = attachments[0];

                session.endDialogWithResult({
                    resumed: ResumeReason.completed,
                    response: attachment
                });
            }
            else if (attachments.length > 1) {
                session.dialogData.attempt = ++attempt;
                session.replaceDialog('uploadFile', { message: 'upload_multiple', attempt: attempt });
            }
        }
        else {
            session.endDialogWithResult({
                resumed: ResumeReason.notCompleted
            });
        }
    }
]);

module.exports = library;