import { dbClient, logger } from '../server'
import { Document, UpdateResult } from 'mongodb'
import { errorLogs } from '../services/log-services'
import { nadie, typeCampaignPack } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaigns)

export class CampaignDb {

    private noAsignado: string = "No asignado"

    async AskForANewCampaignPack(congregation: number, email: string): Promise<number|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            await getCollection().updateOne(
                { $and: [
                    { congregation },
                    { $or: [{ isFinished: null}, { isFinished: false }] },
                    { $or: [{ assignedTo: null}, { assignedTo: "" }, { assignedTo: this.noAsignado }] }
                ]},
                { $set: { assignedTo: email }
            })
            const pack: typeCampaignPack = await getCollection().findOne({ congregation, assignedTo: email }) as Document as typeCampaignPack
            return pack?.id
        } catch (error) {
            logger.Add(congregation, `Falló AskForANewCampaignPack() ${email}: ${error}`, errorLogs)
            return null
        }
    }
    async AssignCampaignPackByEmail(congregation: number, id: number, email: string): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            let result: UpdateResult
            if (email === nadie)
                result = await getCollection().updateOne({ congregation, id }, { $set: { assignedTo: this.noAsignado } })
            else
                result = await getCollection().updateOne({ congregation, id }, { $set: { assignedTo: email } })
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló AssignCampaignPackByEmail() ${id} ${email}: ${error}`, errorLogs)
            return false
        }
    }
    async ChangeAccesibilityMode(congregation: number, id: number, isAccessible: boolean): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, id },
                { $set: { isAccessible } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló ChangeAccesibilityMode() ${id} ${isAccessible}: ${error}`, errorLogs)
            return false
        }
    }
    async CloseCampaignPack(congregation: number, id: number): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, id },
                { $set: { assignedTo: this.noAsignado, isFinished: true } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló CloseCampaignPack() id ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async EditCampaignPackById(congregation: number, id: number, phoneNumber: number, checked: boolean): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            let result: UpdateResult
            if (checked) {
                result = await getCollection().updateOne({ congregation, id }, { $addToSet: { calledPhones: phoneNumber } })
            } else {
                result = await getCollection().updateOne({ congregation, id }, { $pull: { calledPhones: phoneNumber } })
                await getCollection().updateOne({ congregation, id }, { $set: { isFinished: false } })
            }
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló EditCampaignPackById() ${id} ${phoneNumber} ${checked}: ${error}`, errorLogs)
            return false
        }
    }
    async GetCampaignPackById(congregation: number, id: number): Promise<typeCampaignPack|null> {
        try {
            if (!id) throw new Error("No llegó ID")
            if (!congregation) throw new Error("No llegó congregación")
            const pack: typeCampaignPack = await getCollection().findOne({ congregation, id }) as Document as typeCampaignPack
            return pack ?? null
        } catch (error) {
            logger.Add(congregation, `Falló GetCampaignPackById() id ${id}: ${error}`, errorLogs)
            return null
        }
    }
    async GetCampaignPacks(congregation: number): Promise<typeCampaignPack[]|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const packs: typeCampaignPack[]|null = await getCollection().find({ congregation }).toArray() as Document as typeCampaignPack[]
            return packs ?? null
        } catch (error) {
            logger.Add(congregation, `Falló GetCampaignPacks(): ${error}`, errorLogs)
            return null
        }
    }
    async GetCampaignPacksByUser(congregation: number, userEmail: string): Promise<typeCampaignPack[]|null> {
        try {
            if (!userEmail) throw new Error("No llegó usuario")
            if (!congregation) throw new Error("No llegó congregación")
            const packs: typeCampaignPack[]|null = await getCollection().find({ congregation, assignedTo: userEmail }).toArray() as Document as typeCampaignPack[]
            return packs ?? null
        } catch (error) {
            logger.Add(congregation, `Falló GetCampaignPacksByUser() usuario ${userEmail}: ${error}`, errorLogs)
            return null
        }
    }
}
