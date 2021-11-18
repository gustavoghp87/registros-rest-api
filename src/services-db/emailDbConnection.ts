import { dbClient } from '../server';
import { ObjectId } from 'mongodb'
import { typeUser } from "../models/user"

export class EmailDb {

    private _id: ObjectId = new ObjectId('5fcbdce29382c6966fa4d583');

    async GetEmailLastTime(): Promise<number|null> {
        try {
            const lastEmailObj: any|null =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collEmails).findOne({ _id: this._id })
            const lastEmailTime: number|null = lastEmailObj.lastEmail
            return lastEmailTime
        } catch (error) {
            console.log("Get Email Last Time failed", error)
            return null
        }
    }
    async CheckTerritoriesToEmail(): Promise<string[]|null> {
        try {
            let alert: string[] = []
            let i: number = 1
            while (i < 57) {
                const libres: number = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({
                    $and: [
                        { territorio: i.toString() },
                        //{ $or: [{ estado: 'No predicado' }, { estado: 'No contestó' }] },
                        { estado: 'No predicado'},
                        { $or: [{ noAbonado: false }, { noAbonado: null }]}
                    ]
                }).count()
                console.log(`Territorio ${i}, libres: ${libres}`)

                if (libres < 50) {
                    let users: typeUser[]|null = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).find({
                        asign: { $in: [i] }
                    }).toArray() as typeUser[]
                                
                    let text: string = `Territorio ${i.toString()}`
                    
                    if (users && users.length) {
                        text += `, asignado a `
                        users.forEach((user: typeUser) => {
                            if (user.email !== 'ghp.2120@gmail.com' && user.email !== 'ghp.21@hotmail.com')
                                text += `${user.email} `
                        })
                        if (!text.includes('@')) text = `Territorio ${i.toString()}`
                        
                    }

                    alert.push(text)
                }
                i++
            }
            return alert
        } catch (error) {
            console.log("Check Territories To Email failed:", error)
            return null
        }
    }
    async UpdateLastEmail(): Promise<boolean> {
        try {
            const newDate = + new Date()
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collEmails).updateOne(
                { _id: this._id },
                { $set: { lastEmail: newDate } }
            )
            const lastEmailObj: any|null =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collEmails).findOne({ _id: this._id })
            if (!lastEmailObj || (lastEmailObj.lastEmail !== newDate)) return false
            return true
        } catch (error) {
            console.log("Update Last Email failed", error)
            return false
        }
    }
}
