import { Document, UpdateResult } from 'mongodb'
import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { nadie, typeCampaignPack } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaigns)

export class CampaignDb {

    private noAsignado: string = "No asignado"

    async AskForANewCampaignPack(email: string): Promise<number|null> {
        try {
            await getCollection().updateOne(
                { $and: [
                    { $or: [{ isFinished: null}, { isFinished: false }] },
                    { $or: [{ assignedTo: null}, { assignedTo: "" }, { assignedTo: this.noAsignado }] }
                ]},
                { $set: { assignedTo: email }
            })
            const pack: typeCampaignPack = await getCollection().findOne({ assignedTo: email }) as typeCampaignPack
            return pack?.id
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AskForANewCampaignPack() ${email}: ${error}`, errorLogs)
            return null
        }
    }
    async AssignCampaignPackByEmail(id: number, email: string): Promise<boolean> {
        try {
            let result: UpdateResult
            if (email === nadie)
                result = await getCollection().updateOne({ id }, { $set: { assignedTo: this.noAsignado } })
            else
                result = await getCollection().updateOne({ id }, { $set: { assignedTo: email } })
            return !!result.modifiedCount
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AssignCampaignPackByEmail() ${id} ${email}: ${error}`, errorLogs)
            return false
        }
    }
    async ChangeAccesibilityMode(id: number, isAccessible: boolean): Promise<boolean> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                { id },
                { $set: { isAccessible } }
            )
            return !!result.modifiedCount
        } catch (error) {
            console.log(error)
            logger.Add(`Falló ChangeAccesibilityMode() ${id} ${isAccessible}: ${error}`, errorLogs)
            return false
        }
    }
    async CloseCampaignPack(id: number): Promise<boolean> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                { id },
                { $set: { assignedTo: this.noAsignado, isFinished: true } }
            )
            return !!result.modifiedCount
        } catch (error) {
            console.log(error)
            logger.Add(`Falló CloseCampaignPack() id ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async EditCampaignPackById(id: number, phoneNumber: number, checked: boolean): Promise<boolean> {
        try {
            let result: UpdateResult
            if (checked) {
                result = await getCollection().updateOne({ id }, { $addToSet: { calledPhones: phoneNumber } })
            } else {
                result = await getCollection().updateOne({ id }, { $pull: { calledPhones: phoneNumber } })
                await getCollection().updateOne({ id }, { $set: { isFinished: false } })
            }
            return !!result.modifiedCount
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditCampaignPackById() ${id} ${phoneNumber} ${checked}: ${error}`, errorLogs)
            return false
        }
    }
    async GetCampaignPackById(id: number): Promise<typeCampaignPack|null> {
        if (!id) return null
        try {
            const pack: typeCampaignPack = await getCollection().findOne({ id }) as typeCampaignPack
            return pack ?? null
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetCampaignPackById() id ${id}: ${error}`, errorLogs)
            return null
        }
    }
    async GetCampaignPacks(): Promise<typeCampaignPack[]|null> {
        try {
            const packs: typeCampaignPack[]|null = await getCollection().find().toArray() as typeCampaignPack[]
            return packs ?? null
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetCampaignPacks(): ${error}`, errorLogs)
            return null
        }
    }
    async GetCampaignPacksByUser(userEmail: string): Promise<typeCampaignPack[]|null> {
        if (!userEmail) return null
        try {
            const packs: typeCampaignPack[]|null = await getCollection().find({ assignedTo: userEmail }).toArray() as typeCampaignPack[]
            return packs ?? null
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetCampaignPacksByUser() usuario ${userEmail}: ${error}`, errorLogs)
            return null
        }
    }
}
