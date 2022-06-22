import { domain, isProduction, logger } from '../../server'
import { yourEmail } from '../../env-variables'
import { getUsersNotAuthService } from '../user-services'
import { getAllHouseholdsService } from '../territory-services'
import { EmailDb } from '../../services-db/emailDbConnection'
import { generalError } from '../log-services'
import { noPredicado, typeHousehold } from '../../models/household'
import { typeUser } from '../../models/user'
import { sendEmail } from './send-email-service'

const emailDbConnection: EmailDb = new EmailDb()

export const sendEmailRecoverAccount = async (email: string, id: string): Promise<boolean> => {
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
    return success
}

export const sendEmailNewPsw = async (email: string, newPsw: string): Promise<boolean> => {
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
    return success
}

// checks in db last 24 hs email was sent
export const checkAlert = async (): Promise<void> => {
    const timestampRightNow = + new Date()
    const lastEmailTime: number|null = await emailDbConnection.GetEmailLastTime()
    if (!lastEmailTime) {
        logger.Add("No se pudo recuperar último email de territorios llenos enviado", generalError)
        return
    }
    console.log(`Timestamp last email: ${lastEmailTime}; difference: ${timestampRightNow - lastEmailTime}, ${Math.floor((timestampRightNow-lastEmailTime)/1000/60/60)} hours`);
    if (timestampRightNow - lastEmailTime > 86400000) checkTerritories()    // 24 hs
}

// get finished and almost finished territories and order email send
const checkTerritories = async () => {
    const territories: typeHousehold[]|null = await getAllHouseholdsService()
    if (!territories) return
    const users: typeUser[]|null = await getUsersNotAuthService()
    if (!users) return
    let alert: string[] = []
    let i: number = 1
    while (i < 57) {
        const freeNumbers: number = territories.filter((territory: typeHousehold) =>
            territory.territorio === i.toString() && territory.estado === noPredicado && (territory.noAbonado === false || territory.noAbonado === null))
        .length
        // console.log(`Territorio ${i}, libres: ${freeNumbers}`)
        if (freeNumbers < 50) {
            let text: string = `Territorio ${i.toString()}`
            let users0: typeUser[]|null = users.filter((user0) => user0.asign?.includes(i))
            if (users0 && users0.length) {
                text += `, asignado a `
                users0.forEach((user: typeUser) => {
                    if (user.email !== 'ghp.2120@gmail.com' && user.email !== 'ghp.21@hotmail.com' && user.email !== 'pabloech@yahoo.com.ar')
                        text += `${user.email} `
                })
                if (!text.includes('@')) text = `Territorio ${i.toString()}`
            }
            alert.push(text)
        }
        i++
    }
    if (!alert || !alert.length) {
        console.log("There are not almost finished territories")
        return
    }
    await sendAlertEmail(alert)
}

const sendAlertEmail = async (territories: string[]): Promise<void> => {
    if (!isProduction) return
    const to: string = yourEmail
    const subject: string = "Misericordia Web: Territorios"
    const text: string = "Alerta de territorios casi terminados"
    const html: string = `
        <h1>Misericordia Web</h1>
        <p>
            Este correo automático advierte que los siguientes territorios tienen menos de 50 viviendas libres para predicar:
        </p>
        <br/>
        ${territories.map((territory: string) => `<p>${territory}</p>`)}
    `
    const success: boolean = await sendEmail(to, subject, text, html)
    if (success) await updateLastEmail()
}

const updateLastEmail = async (): Promise<void> => {
    const response: boolean = await emailDbConnection.UpdateLastEmail()
    if (!response) logger.Add(`Falló updateLastEmail()`, generalError)
}
