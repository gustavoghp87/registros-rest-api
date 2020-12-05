import { client, dbMW, collTerr } from './database'
import { sendEmail } from './email'


// esta función chequea en base de datos si ya se envió una alerta por email en las últimas 24 hs

export const checkAlert = async () => {

    const timestampRightNow = + new Date()
    console.log(`Timestamp: ${timestampRightNow}`)

    new Promise(resolve => setTimeout(resolve, 10000)).then(async () => {
    
        const lastEmailTime = (await client.db(dbMW).collection('emailAlert').findOne()).lastEmail
        console.log(`Timestamp ultimo email: ${lastEmailTime}`);
        
        console.log(`Diferencia: ${timestampRightNow - lastEmailTime}, o sea ${(timestampRightNow-lastEmailTime)/1000/60/60} horas`);
        
        //if (timestampRightNow - lastEmailTime > 86400000) checkTerritories()   // 24 horas

        checkTerritories()
    })

}


// esta función chequea si hay territorios acabados o por acabarse y ordena el envío del email

const checkTerritories = async () => {
    console.log("Ejecutando checkTerritories")

    let alert:number[] = []
    
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
        if (libres<50) alert.push(i)
        console.log(`Alert: ${alert}`);
        
        i++
    }
    if (alert.length) sendEmail(alert)
}
