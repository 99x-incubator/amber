'use strict';

const request = require('request-promise');

// Adds a new worklog under a particular issue key
exports.addWorklog = function (jiraOptions, issueKey, worklog) {
    const urlStub = `issue/${issueKey}/worklog`;
    const options = getRequestOptions(jiraOptions, urlStub, worklog);

    return request.post(options).
        then((response) => {
            const newWorklogId = response.id;
            return newWorklogId;
        }).
        catch(handleFailure);
}

// Gets the issues assigned to a particular user, sorted by date of creation
exports.getAssignedIssues = function (jiraOptions) {
    const urlStub = `search?jql=assignee=${jiraOptions.username} ORDER BY createdDate DESC &fields=summary`;
    const options = getRequestOptions(jiraOptions, urlStub);

    return request.get(options).
        then((response) => {
            const issues = summarizeIssues(JSON.parse(response));
            return issues;
        }).
        catch(handleFailure);
}

// Gets the issues that a particular user has recently logged time under, sorted by date of issue update
exports.getRecentIssues = function (jiraOptions, days = 7) {
    const urlStub = `search?jql=worklogAuthor=${jiraOptions.username}
     AND worklogDate >= -${days}d ORDER BY updatedDate DESC&fields=summary`;
    const options = getRequestOptions(jiraOptions, urlStub);

    return request.get(options).
        then((response) => {
            const issues = summarizeIssues(JSON.parse(response));
            return issues;
        }).
        catch(handleFailure);
}

function getRequestOptions(jiraOptions, urlStub, payload) {
    const url = `${jiraOptions.url}/rest/api/latest/${urlStub}`;
    const {
        username,
        password
    } = jiraOptions;

    return {
        url,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username,
            password
        },
        json: payload
    };
}

function summarizeIssues(data) {
    return data.issues.map((issue) => {
        const {
            key,
            fields: {
                summary
            }
        } = issue;

        return {
            key,
            summary
        };
    });
}

function handleFailure(error) {
    return Promise.reject(error);
}

module.exports = exports;