import { ObjectId } from 'mongodb'
import { typeUser } from "../../models/user"
import { collEmails, collUnit, collUsers, dbMW } from './_dbConnection';
import { dbClient } from '../../server';

export class EmailDb {

    private _id: ObjectId = new ObjectId('5fcbdce29382c6966fa4d583');

    async GetEmailLastTime() {
        try {
            const lastEmailObj = await dbClient.Client.db(dbMW).collection(collEmails)
                .findOne({ _id: this._id })
            const lastEmailTime = lastEmailObj.lastEmail
            return lastEmailTime
        } catch (error) {
            console.log("Get Email Last Time failed", error)
            return null
        }
    }
    async CheckTerritoriesToEmail() {
        try {
            let alert: string[] = []
            let i: number = 1
            while (i < 57) {
                const libres = await dbClient.Client.db(dbMW).collection(collUnit).find({
                    $and: [
                        {territorio: i.toString()},
                        //{$or: [{estado: 'No predicado'}, {estado: 'No contestó'}]},
                        {estado: 'No predicado'},
                        {$or: [{noAbonado: false}, {noAbonado: null}]}
                    ]
                }).count()
                console.log(`Territorio ${i}, libres: ${libres}`)

                if (libres<50) {
                    let users = await dbClient.Client.db(dbMW).collection(collUsers).find({
                        asign: {$in: [i]}
                    }).toArray()
                                
                    let text:string = `Territorio ${i.toString()}`
                    
                    if (users.length) {
                        text += `, asignado a `
                        users.forEach((user:typeUser) => {
                            if (user.email!=='ghp.2120@gmail.com' && user.email!=='ghp.21@hotmail.com')
                                text += `${user.email} `
                        })
                        if (!text.includes('@')) text = `Territorio ${i.toString()}`
                        
                    }

                    alert.push(text)
                    console.log(text)
                }
                i++
            }
            return alert
        } catch (error) {
            console.log("Check Territories To Email failed:", error)
            return null
        }
    }
    async UpdateLastEmail() {
        try {
            const newDate = + new Date()
            await dbClient.Client.db(dbMW).collection(collEmails).updateOne(
                {_id: this._id},
                {$set: {lastEmail: newDate}}
            )
            const lastEmailObj = await dbClient.Client.db(dbMW).collection(collEmails)
                .findOne({_id: this._id})
            if (!lastEmailObj || lastEmailObj.lastEmail !== newDate) return false
            return true
        } catch (error) {
            console.log("Update Last Email failed", error)
            return false
        }
    }
}
