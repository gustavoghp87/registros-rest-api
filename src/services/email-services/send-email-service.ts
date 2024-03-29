import { Credentials } from 'google-auth-library'
import { errorLogs } from '../log-services'
import { GaxiosResponse } from 'gaxios'
import { getGmailCredentialsService, gmailCredentials } from '.'
import { gmail_v1, google } from 'googleapis'
import { logger } from '../../server'
import Mail from 'nodemailer/lib/mailer'
import MailComposer from 'nodemailer/lib/mail-composer'

export const sendEmail = async (congregation: number, to: string, subject: string, text: string, html: string): Promise<boolean> => {
    try {
        // get gmail service
        const { client_id, client_secret, redirect_uris } = gmailCredentials
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
        const gmailTokens: Credentials|null = await getGmailCredentialsService()
        if (!gmailTokens) return false
        oAuth2Client.setCredentials(gmailTokens)
        const gmail: gmail_v1.Gmail = google.gmail({ version: 'v1', auth: oAuth2Client })
        // create mail
        const options: Mail.Options = {
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
        }
        const mailComposer: MailComposer = new MailComposer(options)
        const message: Buffer = await mailComposer.compile().build()
        const rawMessage: string = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        // send mail
        try {
            const response: GaxiosResponse<gmail_v1.Schema$Message> = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: rawMessage
                }
            })
            if (!response || response.status !== 200 || response.statusText !== 'OK') {
                logger.Add(congregation, `Falló sendEmail() ${to} "${subject}":`, errorLogs)
                return false
            }
        } catch (error) {
            throw new Error("No se pudieron establecer las credenciales");
        }
        return true
    } catch (error) {
        console.error(error)
        logger.Add(congregation, `Falló sendEmail() ${to} "${subject}" en excepción: ${error}`, errorLogs)
        return false
    }
}

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
