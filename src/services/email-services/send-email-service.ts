import { GaxiosResponse } from 'gaxios'
import { gmail_v1, google } from 'googleapis'
import MailComposer from 'nodemailer/lib/mail-composer'
import { gmailCredentials, gmailTokens } from '../../env-variables'
import { logger } from '../../server'
import { generalError } from '../log-services'

export const sendEmail = async (to: string, subject: string, text: string, html: string): Promise<boolean> => {
    try {
        // get gmail service
        const { client_secret, client_id, redirect_uri } = gmailCredentials
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri)
        oAuth2Client.setCredentials(gmailTokens)
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })
    
        // create mail
        const options: any = {
            to,
            //cc: '',
            //replyTo: 'amit@labnol.org',
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
        const mailComposer = new MailComposer(options)
        const message = await mailComposer.compile().build()
        const rawMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    
        // send mail
        const response: GaxiosResponse<gmail_v1.Schema$Message> = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage
            }
        })
        console.log(response)
        return true
    } catch (error) {
        console.error(error)
        logger.Add(`Falló sendEmailRecoverAccount() ${to} "${subject}": ${error}`, generalError)
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