import nodemailer from 'nodemailer'
import { domain, isProduction, logger } from '../server'
import { myEmail, yourEmail, emailPSW } from '../env-variables'
import { getUsersNotAuthService } from './user-services'
import { getAllHouseholdsService } from './territory-services'
import { EmailDb } from '../services-db/emailDbConnection'
import { noPredicado, typeHousehold } from '../models/household'
import { typeUser } from '../models/user'

const emailDbConnection: EmailDb = new EmailDb()

export const sendEmailRecoverAccount = async (email: string, id: string): Promise<boolean> => {
    const url: string = `${domain}/recovery/${id}`
    const mailOptions = emailOptions(myEmail, email, "Misericordia Web: Recupero de cuenta",
    `<h1>Misericordia Web</h1>
    <p>Para recuperar la cuenta de Misericordia Web hay que ingresar a
        <br/>
        <br/>
        &nbsp;&nbsp;${url}
        <br/>
        <br/>
        &nbsp;&nbsp; <a href="${url}">${url}</a>
        <br/>
        <br/>
        y elegir una nueva clave.
    </p>`)

    try {
        const sent = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: myEmail,
                pass: emailPSW
            }
        }).sendMail(mailOptions)
        const response = sent.response
        const error = sent.rejected
        if (error.length) {
            console.log("Email recovery account could not be send:", response, error)
            logger.Add(`Falló sendEmailRecoverAccount() 1 ${email}: ${error}`, "error")
            return false
        }
        console.log('Email recovery account was sent: ' + response)
        return true
    } catch (error) {
        logger.Add(`Falló sendEmailRecoverAccount() 2 ${email}: ${error}`, "error")
        return false
    }
}

export const sendEmailNewPsw = async (email: string, newPsw: string): Promise<boolean> => {

    const mailOptions = emailOptions(myEmail, email, "Misericordia Web: Recupero de clave",
    `<h1>Misericordia Web</h1><p>Tu nueva clave para ingresar a misericordiaweb.com es ${newPsw}<br/>
    Se recomienda ingresar a "Mi Usuario" y cambiarla por otra.</p>`)
    
    try {
        const sent = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: myEmail,
                pass: emailPSW
            }
        }).sendMail(mailOptions)
        const response = sent.response
        const error = sent.rejected
        if (error.length) {
            console.log("Email new psw could not send:", response, error)
            logger.Add(`Falló sendEmailRecoverAccount() 1 ${email}: ${error}`, "error")
            return false
        }
        //console.log(response)
        return true
    } catch (error) {
        console.log(error)
        logger.Add(`Falló sendEmailRecoverAccount() 2 ${email}: ${error}`, "error")
        return false
    }
}

// checks in db last 24 hs email was sent
export const checkAlert = async (): Promise<void> => {
    const timestampRightNow = + new Date()
    const lastEmailTime: number|null = await emailDbConnection.GetEmailLastTime()
    if (!lastEmailTime) {
        logger.Add("No se pudo recuperar último email de territorios llenos enviado", "error")
        return
    }
    console.log(`Timestamp last email: ${lastEmailTime}; difference: ${timestampRightNow - lastEmailTime}, ${(timestampRightNow-lastEmailTime)/1000/60/60} hours`);
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
                    if (user.email !== 'ghp.2120@gmail.com' && user.email !== 'ghp.21@hotmail.com')
                        text += `${user.email} `
                })
                if (!text.includes('@')) text = `Territorio ${i.toString()}`
            }
            alert.push(text)
        }
        i++
    }
    if (!alert || !alert.length) { console.log("There are not almost finished territories"); return }
    sendEmail(alert)
}

const emailOptions = (myEmail: string, yourEmail: string, subject: string, html: string) => { return {
    from: myEmail,
    to: yourEmail,
    subject,
    html
}}

const sendEmail = (territories: string[]): void => {
    if (!isProduction) return
    const mailOptions = emailOptions(
        myEmail,
        yourEmail,
        'App: Alerta de territorios casi terminados',
        `<h1>Misericordia Web</h1>
        <p>Este correo automático advierte que los siguientes territorios
         tienen menos de 50 viviendas libres para predicar:</p>
        <br/>
        ${territories.map((territory: string) => `<p>${territory}</p>`)}
        `
    )
  
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: myEmail,
            pass: emailPSW
        }
    }).sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log("Email could not send:", error)
            logger.Add(`Falló sendEmail(): ${error}`, "error")
            return
        }
        console.log('Email sent: ' + info.response)
        await updateLastEmail()
    })
}

const updateLastEmail = async (): Promise<void> => {
    const response: boolean = await emailDbConnection.UpdateLastEmail()
    if (!response) return console.log("Update Last Email failed...")
}
