import { dbClient, logger } from '../server'
import { nadie, noAsignado, typeCampaignPack } from '../models/campaign'

export class CampaignDb {
    async GetCampaignPacks(): Promise<typeCampaignPack[]|null> {
        try {
            const packs: typeCampaignPack[]|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).find().toArray() as typeCampaignPack[]
            return packs
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetCampaignPacks(): ${error}`, "error")
            return null
        }
    }

    async GetCampaignPacksByUser(userEmail: string): Promise<typeCampaignPack[]|null> {
        if (!userEmail) return null
        try {
            const packs: typeCampaignPack[]|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).find({ asignado: userEmail }).toArray() as typeCampaignPack[]
            return packs
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetCampaignPacksByUser() usuario ${userEmail}: ${error}`, "error")
            return null
        }
    }

    async GetCampaignPackById(id: number): Promise<typeCampaignPack|null> {
        if (!id) return null
        try {
            const pack: typeCampaignPack = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).findOne({ id }) as typeCampaignPack
            return pack
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetCampaignPackById() id ${id}: ${error}`, "error")
            return null
        }
    }

    async EditCampaignPackById(id: number, phoneNumber: number, checked: boolean): Promise<boolean> {
        try {
            if (checked) {
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).updateOne({ id }, { $pull: { llamados: phoneNumber } })
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).updateOne({ id }, { $set: { terminado: false } })
            } else {
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).updateOne({ id }, { $addToSet: { llamados: phoneNumber } })
            }
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditCampaignPackById() ${id} ${phoneNumber} ${checked}: ${error}`, "error")
            return false
        }
    }

    async CloseCampaignPack(id: number): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).updateMany({ id }, { $set: { asignado: noAsignado, terminado: true }})
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló CloseCampaignPack() id ${id}: ${error}`, "error")
            return false
        }
    }

    async AssignCampaignPackByEmail(id: number, email: string): Promise<boolean> {
        try {
            if (email === nadie)
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).updateOne({ id }, { $set: { asignado: noAsignado } })
            else
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).updateOne({ id }, { $set: { asignado: email } })
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AssignCampaignPackByEmail() ${id} ${email}: ${error}`, "error")
            return false
        }
    }

    async AskForANewCampaignPack(email: string): Promise<number|null> {
        try {
            console.log(email);
            
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).updateOne(
                { $and: [
                    { $or: [{ terminado: null}, { terminado: false }] },
                    { $or: [{ asignado: null}, { asignado: "" }, { asignado: noAsignado }] }
                ]},
                { $set: { asignado: email }
            })
            const pack: typeCampaignPack = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCampaign).findOne({ asignado: email }) as typeCampaignPack
            return pack?.id
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AskForANewCampaignPack() ${email}: ${error}`, "error")
            return null
        }
    }
}
