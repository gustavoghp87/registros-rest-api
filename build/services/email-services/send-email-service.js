"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mail_composer_1 = __importDefault(require("nodemailer/lib/mail-composer"));
const googleapis_1 = require("googleapis");
const server_1 = require("../../server");
const _1 = require(".");
const log_services_1 = require("../log-services");
const sendEmail = async (to, subject, text, html) => {
    try {
        // get gmail service
        const { client_id, client_secret, redirect_uris } = _1.gmailCredentials;
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        const gmailTokens = await (0, _1.getGmailCredentialsService)();
        if (!gmailTokens)
            return false;
        oAuth2Client.setCredentials(gmailTokens);
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth: oAuth2Client });
        // create mail
        const options = {
            to,
            //cc: '',
            //replyTo: '',
            subject,
            text,
            html,
            //attachments: fileAttachments,
            textEncoding: 'base64',
            headers: [
                {
                    key: 'X-Application-Developer',
                    value: 'Amit Agarwal'
                },
                {
                    key: 'X-Application-Version',
                    value: 'v1.0.0.2'
                }
            ]
        };
        const mailComposer = new mail_composer_1.default(options);
        const message = await mailComposer.compile().build();
        const rawMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        // send mail
        try {
            const response = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: rawMessage
                }
            });
            if (!response || response.status !== 200 || response.statusText !== 'OK') {
                server_1.logger.Add(`Falló sendEmail() ${to} "${subject}":`, log_services_1.errorLogs);
                return false;
            }
        }
        catch (error) {
            throw new Error("Cannot set credentials");
        }
        return true;
    }
    catch (error) {
        console.error(error);
        server_1.logger.Add(`Falló sendEmail() ${to} "${subject}" en excepción: ${error}`, log_services_1.errorLogs);
        return false;
    }
};
exports.sendEmail = sendEmail;
// const fileAttachments = [
//     {
//         filename: 'attachment1.txt',
//         content: 'This is a plain text file sent as an attachment',
//     },
//     {
//         path: path.join(__dirname, './attachment2.txt'),
//     },
//     {
//         filename: 'websites.pdf',
//         path: 'https://www.labnol.org/files/cool-websites.pdf',
//     },
//     {
//         filename: 'image.png',
//         content: fs.createReadStream(path.join(__dirname, './attach.png')),
//     },
// ]
