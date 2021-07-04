import { sendEmail } from './sendEmail'
import { EmailDb } from '../database-services/emailDbConnection'

// esta función chequea en base de datos si ya se envió una alerta por email en las últimas 24 hs
export const checkAlert = async () => {

    const timestampRightNow = + new Date()
    console.log(`Timestamp: ${timestampRightNow}`)

    //new Promise(resolve => setTimeout(resolve, 10000)).then(async () => {
        const lastEmailTime = await new EmailDb().GetEmailLastTime()
        console.log(`Timestamp last email: ${lastEmailTime}`);
        console.log(`Difference: ${timestampRightNow - lastEmailTime}, o sea ${(timestampRightNow-lastEmailTime)/1000/60/60} horas`);
        if (timestampRightNow - lastEmailTime > 86400000) checkTerritories()   // 24 horas
    //})
}

// esta función chequea si hay territorios acabados o por acabarse y ordena el envío del email
const checkTerritories = async () => {
    console.log("Executing checkTerritories")
    const alert = await new EmailDb().CheckTerritoriesToEmail()
    if (!alert) return
    console.log(`Alert: ${alert}`)
    sendEmail(alert)
    const response = await new EmailDb().UpdateLastEmail()
    if (!response) console.log("Update Last Email failed...")
    console.log("Updated Last Email successfully")
}
