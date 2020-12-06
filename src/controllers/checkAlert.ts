import { client, dbMW, collTerr, collUsers } from './database'
import { sendEmail } from './email'
import { ObjectId } from 'mongodb'
import { typeUser } from './types'


// esta función chequea en base de datos si ya se envió una alerta por email en las últimas 24 hs

export const checkAlert = async () => {

    const timestampRightNow = + new Date()
    console.log(`Timestamp: ${timestampRightNow}`)

    //new Promise(resolve => setTimeout(resolve, 10000)).then(async () => {
    
        const lastEmailTime = (await client.db(dbMW).collection('emailAlert').findOne()).lastEmail
        console.log(`Timestamp ultimo email: ${lastEmailTime}`);
        
        console.log(`Diferencia: ${timestampRightNow - lastEmailTime}, o sea ${(timestampRightNow-lastEmailTime)/1000/60/60} horas`);
        
        if (timestampRightNow - lastEmailTime > 86400000) checkTerritories()   // 24 horas
                
        checkTerritories()
    //})

}


// esta función chequea si hay territorios acabados o por acabarse y ordena el envío del email

const checkTerritories = async () => {
    console.log("Ejecutando checkTerritories")

    let alert:string[] = []
    
    let i:number = 1
    while (i < 57) {
        const libres = await client.db(dbMW).collection(collTerr).find({
            $and: [
                {territorio: i.toString()},
                {estado: 'No predicado'},
                {$or: [{noAbonado: false}, {noAbonado: null}]}
            ]
        }).count()
        console.log(`Territorio ${i}, libres: ${libres}`)

        if (libres<50) {
            let text:string = `Territorio ${i.toString()}`
            const users = await client.db(dbMW).collection(collUsers).find({
                asign: {$in: [i]}
            }).toArray()

            if (users.length) {
                text += `, asignado a `
                users.forEach((user:typeUser) => {
                    text += `${user.email} `
                })
            }
            alert.push(text)
            console.log(text)
        }
        i++
    }

    console.log(`Alert: ${alert}`)

    if (alert.length) {
        sendEmail(alert)
        client.db(dbMW).collection('emailAlert').updateOne(
            {_id:new ObjectId('5fcbdce29382c6966fa4d583')},
            {$set: {lastEmail: + new Date()}}
        )
    }
}
