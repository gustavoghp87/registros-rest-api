"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGmailCredentialsService = exports.gmailCredentials = exports.sendScope = exports.composeScope = void 0;
const env_variables_1 = require("../../env-variables");
const server_1 = require("../../server");
const _1 = require(".");
exports.composeScope = 'https://www.googleapis.com/auth/gmail.compose';
exports.sendScope = 'https://www.googleapis.com/auth/gmail.send';
// https://mail.google.com/ (includes any usage of IMAP, SMTP, and POP3 protocols)
// https://www.googleapis.com/auth/gmail.readonly
// https://www.googleapis.com/auth/gmail.metadata
// https://www.googleapis.com/auth/gmail.modify
// https://www.googleapis.com/auth/gmail.insert
// https://www.googleapis.com/auth/gmail.compose
// https://www.googleapis.com/auth/gmail.settings.basic
// https://www.googleapis.com/auth/gmail.settings.sharing
exports.gmailCredentials = {
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    client_id: env_variables_1.client_id,
    client_secret: env_variables_1.client_secret,
    project_id: env_variables_1.project_id,
    redirect_uris: [server_1.domain, server_1.testingDomain],
    token_uri: "https://oauth2.googleapis.com/token"
};
const getGmailCredentialsService = async () => {
    const tokens = await (0, _1.GetGmailTokensService)();
    if (!tokens || !tokens.access_token || !tokens.refresh_token)
        return null;
    return {
        access_token: tokens.access_token,
        expiry_date: 1657835423010,
        refresh_token: tokens.refresh_token,
        scope: exports.sendScope,
        token_type: 'Bearer'
    };
};
exports.getGmailCredentialsService = getGmailCredentialsService;
