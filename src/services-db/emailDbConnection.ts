import { dbClient, logger } from '../server'
import { ObjectId } from 'mongodb'

export class EmailDb {
    private _id: ObjectId = new ObjectId('5fcbdce29382c6966fa4d583');

    async GetEmailLastTime(): Promise<number|null> {
        try {
            const lastEmailObj: any|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).findOne({ _id: this._id })
            const lastEmailTime: number|null = lastEmailObj.lastEmail
            return lastEmailTime
        } catch (error) {
            console.log("Get Email Last Time failed", error)
            logger.Add(`Falló GetEmailLastTime(): ${error}`, "error")
            return null
        }
    }
    
    async UpdateLastEmail(): Promise<boolean> {
        try {
            const newDate = + new Date()
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).updateOne(
                { _id: this._id },
                { $set: { lastEmail: newDate } }
            )
            const lastEmailObj: any|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).findOne({ _id: this._id })
            if (!lastEmailObj || (lastEmailObj.lastEmail !== newDate)) return false
            return true
        } catch (error) {
            console.log("Update Last Email failed", error)
            logger.Add(`Falló UpdateLastEmail(): ${error}`, "error")
            return false
        }
    }
}
