import { google } from 'googleapis'
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { Credentials } from 'google-auth-library'
import { domain, logger } from '../../server'
import { EmailDb } from '../../services-db/emailDbConnection'
import { errorLogs } from '../log-services'
import { gmailCredentials, sendEmail, sendScope } from '.'
import { typeUser } from '../../models'

const emailDbConnection: EmailDb = new EmailDb()

export const getGmailUrlService = async (requesterUser: typeUser): Promise<string|null> => {
    if (!requesterUser) return null
    //const uriNumber: 0|1 = isProduction ? 0 : 1   redirect_uris[uriNumber]
    try {
        const { client_secret, client_id } = gmailCredentials
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "https://www.misericordiaweb.com")
        const url: string = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [sendScope],
            redirect_uri: "https://www.misericordiaweb.com"
        })
        return url
    } catch (error) {
        logger.Add("No se pudo generar URL para Gmail", errorLogs)
        return null
    }
}

export const getGmailRequestService = async (requesterUser: typeUser, code: string): Promise<Credentials|null> => {
    if (!requesterUser) return null
    //const uriNumber: 0|1 = isProduction ? 0 : 1   redirect_uris[uriNumber]
    try {
        const { client_secret, client_id } = gmailCredentials
        if (!code) throw new Error("No llegó Code")
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "https://www.misericordiaweb.com")
        const keys: GetTokenResponse = await oAuth2Client.getToken(code)
        if (!keys || !keys.tokens) throw new Error("Respuesta inválida")
        return keys.tokens
    } catch (error) {
        logger.Add("No se pudo generar Token para Gmail", errorLogs)
        return null
    }
}

export const GetGmailTokensService = async (): Promise<Credentials|null> => {
    // no user token
    const tokens: Credentials|null = await emailDbConnection.GetGmailTokens()
    return tokens
}

export const saveNewGmailAPITokenToDBService = async (requesterUser: typeUser, accessToken: string, refreshToken: string): Promise<boolean> => {
    if (!requesterUser) return false
    if (!accessToken || !refreshToken) return false
    const success: boolean = await emailDbConnection.SaveNewGmailAPITokensToDB(accessToken, refreshToken)
    return success
}

// export const sendAlertOfTerritoriesEmailService = async (): Promise<void> => {
//     // checks in db last 24 hs email was sent
//     const timestampRightNow = + new Date()
//     const lastEmailTime: number|null = await emailDbConnection.GetEmailLastTime()
//     if (!lastEmailTime) {
//         logger.Add("No se pudo recuperar último email de territorios llenos enviado", errorLogs)
//         return
//     }
//     (`Timestamp last email: ${lastEmailTime}; difference: ${timestampRightNow - lastEmailTime}, ${Math.floor((timestampRightNow-lastEmailTime)/1000/60/60)} hours`);
//     if (timestampRightNow - lastEmailTime < 86400000) return    // 24 hs

//     // get finished and almost finished territories and order email send
//     const territories: typeTelephonicTerritory[]|null = await getAllPhoneTerritoriesService()
//     if (!territories) return
//     const users: typeUser[]|null = await getUsersNotAuthService()
//     if (!users) return
//     let alert: string[] = []
//     let i: number = 1
//     while (i < 57) {
//         const freeNumbers: number = territories.filter((territory: typeTelephonicTerritory) =>
//             territory.territoryNumber === i.toString() && territory.callingState === noPredicado && (territory.notSubscribed === false || territory.notSubscribed === null))
//         .length
//         if (freeNumbers < 50) {
//             let text: string = `Territorio ${i.toString()}`
//             let users0: typeUser[]|null = users.filter((user0) => user0.asign?.includes(i))
//             if (users0 && users0.length) {
//                 text += `, asignado a `
//                 users0.forEach((user: typeUser) => {
//                     if (user.email !== 'ghp.2120@gmail.com' && user.email !== 'ghp.21@hotmail.com' && user.email !== 'pabloech@yahoo.com.ar')
//                         text += `${user.email} `
//                 })
//                 if (!text.includes('@')) text = `Territorio ${i.toString()}`
//             }
//             alert.push(text)
//         }
//         i++
//     }
//     if (!alert || !alert.length) {
//         ("There are not almost finished territories")
//         return
//     }

//     // send email
//     if (!isProduction) return
//     const to: string = yourEmail
//     const subject: string = "Misericordia Web: Territorios"
//     const text: string = "Alerta de territorios casi terminados"
//     const html: string = `
//         <h1>Misericordia Web</h1>
//         <p>
//             Este correo automático advierte que los siguientes territorios tienen menos de 50 viviendas libres para predicar:
//         </p>
//         <br/>
//         ${alert.map((territory: string) => `<p>${territory}</p>`)}
//     `
//     const success: boolean = await sendEmail(to, subject, text, html)
//     if (!success) {
//         logger.Add(`Falló send email`, errorLogs)
//         return
//     }

//     // update db
//     const response: boolean = await emailDbConnection.UpdateLastEmail()
//     if (!response) logger.Add(`Falló update last email in db`, errorLogs)
// }

export const sendNewPswEmailService = async (email: string, newPsw: string): Promise<boolean> => {
    const to: string = email
    const subject: string = "Misericordia Web: Recupero de clave"
    const text: string = "Correo solicitado"
    const html: string = `
        <h1>Misericordia Web</h1>
        <p>
            Tu nueva clave para ingresar a misericordiaweb.com es ${newPsw}
            <br/>
            Se recomienda ingresar a "Mi Usuario" y cambiarla por otra.
        </p>
    `
    const success: boolean = await sendEmail(to, subject, text, html)
    if (!success) logger.Add("No se pudo enviar correo por nueva contraseña", errorLogs)
    return success
}

export const sendRecoverAccountEmailService = async (email: string, id: string): Promise<boolean> => {
    const url: string = `${domain}/recovery/${id}`
    const to: string = email
    const subject: string = "Misericordia Web: Recupero de cuenta"
    const text: string = "Correo solicitado"
    const html: string = `
        <h1>Misericordia Web</h1>
        <p>Para recuperar la cuenta de Misericordia Web hay que ingresar a:
            <br/>
            <br/>
            &nbsp;&nbsp;${url}
            <br/>
            <br/>
            &nbsp;&nbsp; <a href="${url}">${url}</a>
            <br/>
            <br/>
            y elegir una nueva clave.
        </p>
    `
    const success: boolean = await sendEmail(to, subject, text, html)
    if (!success) logger.Add(`No se pudo enviar correo de recuperación de cuenta a ${to}`, errorLogs)
    return success
}
