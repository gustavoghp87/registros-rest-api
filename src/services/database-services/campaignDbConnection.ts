import { dbClient } from '../../server'
import { dbMW, collCampaign } from './_dbConnection'

export class CampaignDb {

    async GetCampaign() {
        try {
            const pack = await dbClient.Client.db(dbMW).collection(collCampaign).find().toArray()
            return pack
        } catch (error) {
            console.log("Get Campaign failed ", error)
            return null
        }
    }
    async AsignCampaign(id:number, email:string) {
        try {
            if (email==='Nadie')
                await dbClient.Client.db(dbMW).collection(collCampaign).updateOne({ id }, { $set: { asignado: 'No asignado' } })
            else
                await dbClient.Client.db(dbMW).collection(collCampaign).updateOne({ id }, { $set: { asignado: email } })
            return true
        } catch (error) {
            console.log("Asign Campaign failed", "Cannot asign", id, "to", email, error)
            return false
        }
    }
    async GetPack(id: number) {
        try {
            const pack = await dbClient.Client.db(dbMW).collection(collCampaign).findOne({ id })
            return pack
        } catch (error) {
            console.log("Get Pack failed", error)
            return null
        }
    }
    async ClickBox(email: string, tel: number, id: number, checked: boolean) {
        try {
            const pack = await dbClient.Client.db(dbMW).collection(collCampaign).findOne({id})
            if (!pack || pack.asignado !== email) return false

            if (checked) {
                await dbClient.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $pull: { llamados: tel } })
                await dbClient.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $set: { terminado: false } })
            } else {
                await dbClient.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $addToSet: { llamados: tel } })
                const packN = await dbClient.Client.db(dbMW).collection(collCampaign).findOne({ id })
                if (packN && packN.llamados && packN.llamados.length === 50) {
                    console.log("YA SON 50")
                    await dbClient.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $set: { terminado: true }})
                }
            }
            return true
        } catch (error) {
            console.error("Click Box failed", error)
            return false
        }
    }
    async MarkEverythingLikeCalled(packId: number) {
        try {
            await dbClient.Client.db(dbMW).collection(collCampaign).updateMany({ id: packId }, {
                $set: {asignado: 'No asignado', terminado: true}
            })
            return true
        } catch (error) {
            console.log("Update Household State GraphQL failed:", error)
            return false
        }
    }
}
