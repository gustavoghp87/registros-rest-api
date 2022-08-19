import { dbClient, logger } from '../server'
import { generalError } from '../services/log-services'
import * as types from '../models'
import { localStatistic, statistic } from '../models'

export class HouseholdDb {
    // async GetBlocks(territory: string): Promise<string[]|null> {
    //     try {
    //         let blocks: string[] = []
    //         let i = 1
    //         while (i < 9) {
    //             try {
    //                 let busq: types.typeHousehold|null =
    //                     await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).findOne({
    //                         territorio: { $in: [territory] },
    //                         manzana: { $in: [i.toString()] }
    //                     }) as types.typeHousehold|null
    //                 if (busq) blocks.push(i.toString())
    //             } catch (error) {
    //                 console.log(error)
    //                 logger.Add(`Falló GetBlocks() territorio ${territory} manzana ${i}: ${error}`, generalError)
    //             }
    //             i++
    //         }
    //         return blocks
    //     } catch (error) {
    //         console.log(error)
    //         logger.Add(`Falló GetBlocks() territorio ${territory}: ${error}`, generalError)
    //         return null
    //     }
    // }
    async GetTerritory(territory: string): Promise<types.typeHousehold[]|null> {
        try {
            const territories: types.typeHousehold[]|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ territorio: territory }).toArray() as types.typeHousehold[]
            if (!territories) return null
            return territories
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetTerritory() territorio ${territory}: ${error}`, generalError)
            return null
        }
    }
    async GetTerritoryByNumberAndBlock(territory: string, block: string): Promise<types.typeHousehold[]|null> {
            try {
            const households: types.typeHousehold[] = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({
                territorio: { $in: [territory] },
                manzana: { $in: [block] }
            }).sort({ inner_id: 1 }).toArray() as types.typeHousehold[]
            return households
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetTerritoryByNumberAndBlock() ${territory} ${block}: ${error}`, generalError)
            return null
        }
    }
    async GetFreePhonesOfTerritoryByNumberAndBlock(territory: string, block: string): Promise<types.typeHousehold[]|null> {
        try {
            let households: types.typeHousehold[] = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({
                $and: [
                    { territorio: { $in: [territory] } },
                    { manzana: { $in: [block] } },
                    { estado: types.noPredicado },
                    { $or: [{ noAbonado: false }, { noAbonado: null }]}
                ]
            }).sort({ inner_id: 1 }).toArray() as types.typeHousehold[]
            return households
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetFreePhonesOfTerritoryByNumberAndBlock() ${territory} ${block}: ${error}`, generalError)
            return null
        }
    }
    async GetNumbreOfFreePhonesOfTerritoryByNumber(territory: string): Promise<number|null> {
        try {
            const getNumberOfFreePhones: number = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({
                $and: [
                    { territorio: { $in: [territory] } },
                    { estado: types.noPredicado },
                    { $or: [{ noAbonado: false }, { noAbonado: null }]}
                ]
            })?.count()
            if (getNumberOfFreePhones === undefined) return null
            return getNumberOfFreePhones
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetNumbreOfFreePhonesOfTerritoryByNumber() ${territory}: ${error}`, generalError)
            return null
        }
    }
    async GetHouseholdById(inner_id: string): Promise<types.typeHousehold|null> {
        try {
            const household: types.typeHousehold = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).findOne({ inner_id }) as types.typeHousehold
            return household
        } catch (error) {
            logger.Add(`Falló GetHouseholdById(): ${error}`, generalError)
            return null
        }
    }
    async GetAllHouseholds(): Promise<types.typeHousehold[]|null> {
        try {
            const territories: types.typeHousehold[]|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find().toArray() as types.typeHousehold[]
            if (!territories) return null
            return territories
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetAllHouseholds(): ${error}`, generalError)
            return null
        }
    }
    async ResetTerritory(territorio: string, option: number): Promise<boolean> {
        const timeSixMonths = Date.now() - 15778458000    // milliseconds
        try {
            if (option === 1) {
                console.log("Option 1 // clean more than 6 months")
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).updateMany({
                    $and: [
                        { territorio },
                        { $or: [{ noAbonado: false }, { noAbonado: null }] },
                        { fechaUlt: { $lt: timeSixMonths }}
                    ]
                }, {
                    $set: { estado: types.noPredicado, asignado: false }
                })
            } else if (option === 2) {
                console.log("Option 2  // clean all")
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).updateMany({
                    $and: [
                        { territorio },
                        { $or: [{ noAbonado: false }, { noAbonado: null }]}
                    ]
                }, {
                    $set: { estado: types.noPredicado, asignado: false }
                })
            } else if (option === 3) {
                console.log("Option 3  // clean more than 6 months even 'noAbonado'")
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).updateMany({
                    $and: [
                        { territorio },
                        { fechaUlt: { $lt: timeSixMonths }}
                    ]
                }, {
                    $set: { estado: types.noPredicado, asignado: false, noAbonado: false }
                })
            } else if (option === 4) {
                console.log("Option 4  // clean all even 'noAbonado'")
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).updateMany({
                    $and: [
                        { territorio }
                    ]
                }, {
                    $set: { estado: types.noPredicado, asignado: false, noAbonado: false }
                })
            }
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló ResetTerritory() territorio ${territorio} opción ${option}: ${error}`, generalError)
            return false
        }
    }
    async UpdateHouseholdState(inner_id: string, estado?: string, noAbonado?: boolean, asignado?: boolean): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).updateOne({ inner_id },
                { $set: { estado, noAbonado, asignado, fechaUlt: Date.now() } }
            )
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló UpdateHouseholdState() pasando ${inner_id} ${estado} ${noAbonado} ${asignado}: ${error}`, generalError)
            return false
        }
    }
    async GetGlobalStatistics(): Promise<statistic|null> {
        try {
            const count: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find().count()
            const countContesto: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ estado: types.contesto }).count()
            const countNoContesto: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ estado: types.noContesto }).count()
            const countDejarCarta: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ estado: types.aDejarCarta }).count()
            const countNoLlamar: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ estado: types.noLlamar }).count()
            const countNoAbonado: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ noAbonado: true }).count()
            const libres: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ $and: [
                    { estado: types.noPredicado },
                    { $or: [{ noAbonado: false }, { noAbonado: null }] }
                ]}).count()
            
            return {
                count,
                countContesto,
                countNoContesto,
                countDejarCarta,
                countNoLlamar,
                countNoAbonado,
                libres
            }
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetGlobalStatistics(): ${error}`, generalError)
            return null
        }
    }
    async GetLocalStatistics(territorio: string): Promise<localStatistic|null> {
        try {
            const count: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ territorio }).count()
            const countContesto: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ $and: [{ territorio }, { estado: types.contesto }] }).count()
            const countNoContesto: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ $and: [{ territorio }, { estado: types.noContesto }] }).count()
            const countDejarCarta: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ $and: [{ territorio }, { estado: types.aDejarCarta }] }).count()
            const countNoLlamar: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ $and: [{ territorio }, { estado: types.noLlamar }] }).count()
            const countNoAbonado: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ $and: [{ territorio }, { noAbonado: true }] }).count()
            const libres: number =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUnit).find({ $and: [{ territorio }, { $or: [{ estado: types.noPredicado }]}, { $or: [{ noAbonado: false }, { noAbonado: null }] }] }).count()
            return {
                count,
                countContesto,
                countNoContesto,
                countDejarCarta,
                countNoLlamar,
                countNoAbonado,
                libres,
                territorio
            }
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetLocalStatistics() pasando ${territorio}: ${error}`, generalError)
            return null
        }
    }
}
