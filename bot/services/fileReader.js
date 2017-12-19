const fs = require('fs');
const Promise = require('bluebird');
const request = require('request-promise');

exports.read = function (session, attachment) {
    const tokenRequired = checkTokenRequired(session.message);

    const downloadFile = tokenRequired
        ? requestWithToken(session.connector, attachment.contentUrl)
        : request(attachment.contentUrl);

    return downloadFile.then((response) => {
        const buffer = Buffer.from(JSON.parse(response).data);
        
        return buffer.toString('utf-8');
    }).catch((error) => {
        throw error;
    });
}

// Skype and MS Teams attachment URLs are secured with a JWT
function checkTokenRequired(message) {
    return message.source === 'skype' || message.source === 'msteams';
};

// Request with bot's JWT
function requestWithToken(connector, url) {
    const obtainToken = Promise.promisify(connector.getAccessToken.bind(connector));

    return obtainToken().then((token) => {
        return request({
            url,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/octet-stream'
            }
        });
    }).catch((error) => {
        throw error;
    });
};

module.exports = exports;
