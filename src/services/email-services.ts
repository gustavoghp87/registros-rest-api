import nodemailer from 'nodemailer'
import { EmailDb } from '../services-db/emailDbConnection'
import { myEmail, yourEmail, emailPSW } from '../env-variables'

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
        if (error.length) { console.log("Email new psw could not send:", response, error); return false }
        console.log('Email new psw sent: ' + response)
        return true
    } catch (error) {
        console.log("Email new psw could not send (2):", error)
        return false
    }
}

// checks in db last 24 hs email was sent
export const checkAlert = async (): Promise<void> => {
    const timestampRightNow = + new Date()
    console.log(`Timestamp: ${timestampRightNow}`)
    const lastEmailTime: number|null = await new EmailDb().GetEmailLastTime()
    if (!lastEmailTime) { console.log("Cannot retrieve lastEmailTime from db"); return }
    console.log(`Timestamp last email: ${lastEmailTime}`);
    console.log(`Difference: ${timestampRightNow - lastEmailTime}, ${(timestampRightNow-lastEmailTime)/1000/60/60} hours`);
    if (timestampRightNow - lastEmailTime > 86400000) checkTerritories()   // 24 hs
}

// get finished and almost finished territories and order email send
const checkTerritories = async () => {
    console.log("Executing checkTerritories")
    const alert: string[]|null = await new EmailDb().CheckTerritoriesToEmail()
    if (alert === null) { console.log("Cannot generate alert text"); return }
    if (!alert) { console.log("There are not almost finished territories"); return }
    console.log(`Alert: ${alert}`)
    sendEmail(alert)
}

const emailOptions = (myEmail: string, yourEmail: string, subject: string, html: string) => { return {
    from: myEmail,
    to: yourEmail,
    subject,
    html
}}

const sendEmail = (territorios: string[]): void => {

    const mailOptions = emailOptions(
        myEmail,
        yourEmail,
        'App: Alerta de territorios casi terminados',
        `<h1>Misericordia Web</h1>
        <p>Este correo automático advierte que los siguientes territorios
         tienen menos de 50 viviendas libres para predicar:</p>
        <br/>
        ${territorios.map((territorio: string) => `<p>${territorio}</p>`)}
        `
    )
  
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: myEmail,
            pass: emailPSW
        }
    }).sendMail(mailOptions, async (error, info) => {
        if (error) { console.log("Email could not send:", error); return }
        console.log('Email sent: ' + info.response)
        await updateLastEmail()
    })
}

const updateLastEmail = async (): Promise<void> => {
    const response: boolean = await new EmailDb().UpdateLastEmail()
    if (!response) console.log("Update Last Email failed...")
    else console.log("Updated Last Email successfully")
}
