import { dbClient, maintenanceMode } from '../server'
import { typeVivienda } from '../models/vivienda'
import { localStatistic, statistic } from '../models/statistic'

export class HouseholdDb {
    private NoPredicado: string = "No predicado"
    private Contesto: string = "Contestó"
    private NoContesto: string = "No contestó"
    private ADejarCarta: string = "A dejar carta"
    private NoLlamar: string = "No llamar"

    async GetBlocks(territory: string): Promise<string[]> {
        let blocks: string[] = []
        let i = 1
        while (i < 9) {
            try {
                let busq: typeVivienda|null =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).findOne({
                        territorio: { $in: [territory] },
                        manzana: { $in: [i.toString()] }
                    }) as typeVivienda|null
                if (busq) blocks.push(i.toString())
            } catch (error) {
                console.log(error)
            }
            i++
        }
        return blocks
    }
    async SearchTerritoryByNumber(terr: string,
         manzana: string, todo: boolean, traidos: number, traerTodos: boolean): Promise<typeVivienda[]|null> {
        let households: typeVivienda[] = []
        
        try {
            if (!todo && !traerTodos)
                households = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({
                    $and: [
                        { territorio: { $in: [terr] } },
                        { manzana: { $in: [manzana] } },
                        { estado: this.NoPredicado },
                        { $or: [{ noAbonado: false }, { noAbonado: null }] }
                    ]
                }).limit(traidos).toArray() as typeVivienda[]

            else if (!todo && traerTodos)
                households = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({
                    $and: [
                        { territorio: { $in: [terr] } },
                        { manzana: { $in: [manzana] } },
                        { estado: this.NoPredicado },
                        { $or: [{ noAbonado: false }, { noAbonado: null }]}
                    ]
                }).toArray() as typeVivienda[]

            else if (todo && traerTodos)
                households = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({
                    territorio: { $in: [terr] },
                    manzana: { $in: [manzana] }
                }).sort({ fechaUlt: 1 }).toArray() as typeVivienda[]

            else if (todo && !traerTodos)
                households = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({
                    territorio: { $in: [terr] },
                    manzana: { $in: [manzana] }
                }).limit(traidos).toArray() as typeVivienda[]

            ;

            return households
        } catch (error) {
            console.log(error)
            return null
        }
    }
    async ResetTerritory(option: number, territorio: string): Promise<boolean> {
        if (maintenanceMode) return true
        const time = Date.now()        // milliseconds
        const sixMonths = 15778458000
        const timeSixMonths = time - sixMonths

        try {
            if (option === 1) {
                console.log("Entra en opción 1 // limpiar más de 6 meses")
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).updateMany({
                    $and: [
                        { territorio },
                        { $or: [{ noAbonado: false }, { noAbonado: null }] },
                        { fechaUlt: { $lt: timeSixMonths }}
                    ]
                }, {
                    $set: { estado: this.NoPredicado, asignado: false }
                })
            }
            
            if (option === 2) {
                console.log("Entra en opción 2  // limpiar todos")
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).updateMany({
                    $and: [
                        { territorio },
                        { $or: [{ noAbonado: false }, { noAbonado: null }]}
                    ]
                }, {
                    $set: { estado: this.NoPredicado, asignado: false }
                })
            }
            
            if (option === 3) {
                console.log("Entra en opción 3  // limpiar y no abonados de más de 6 meses")
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).updateMany({
                    $and: [
                        { territorio },
                        { fechaUlt: { $lt: timeSixMonths }}
                    ]
                }, {
                    $set: { estado: this.NoPredicado, asignado: false, noAbonado: false }
                })
            }
            
            if (option === 4) {
                console.log("Entra en opción 4  // limpiar absolutamente todo")
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).updateMany({
                    $and: [
                        { territorio }
                    ]
                }, {
                    $set: { estado: this.NoPredicado, asignado: false, noAbonado: false }
                })
            }

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async UpdateHouseholdState(inner_id: string, estado?: string, noAbonado?: boolean, asignado?: boolean): Promise<typeVivienda|null> {
        try {
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).updateOne({ inner_id },
                { $set: { estado, noAbonado, asignado, fechaUlt: Date.now() } }
            )
            const householdUpdated: typeVivienda|null =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).findOne({ inner_id }) as typeVivienda
            if (!householdUpdated) return null
            return householdUpdated
        } catch (error) {
            console.log("Update Household State failed:", error)
            return null
        }
    }
    async GetGlobalStatistics(): Promise<statistic|null> {
        try {
            const count =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find().count()
            const countContesto =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ estado: this.Contesto }).count()
            const countNoContesto =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ estado: this.NoContesto }).count()
            const countDejarCarta =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ estado: this.ADejarCarta }).count()
            const countNoLlamar =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ estado: this.NoLlamar }).count()
            const countNoAbonado =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ noAbonado: true }).count()
            const libres =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find(
                    { $and: [
                        { estado: this.NoPredicado }, { $or: [{ noAbonado: false }, { noAbonado: null }] }
                    ]}).count()
            return { count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, countNoAbonado, libres }
        } catch (error) {
            console.log("Get Global Statistics failed", error)
            return null
        }
    }
    async GetLocalStatistics(territorio: string): Promise<localStatistic|null> {
        try {
            const count =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({territorio}).count()
            const countContesto =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.Contesto }] }).count()
            const countNoContesto =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.NoContesto }] }).count()
            const countDejarCarta =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.ADejarCarta }] }).count()
            const countNoLlamar =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.NoLlamar }] }).count()
            const countNoAbonado =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { noAbonado: true }] }).count()
            const libres =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio }, { $or: [{ estado: this.NoPredicado }]}, { $or: [{ noAbonado: false }, { noAbonado: null }] }] }).count()
            return { count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, countNoAbonado, libres, territorio }
        } catch (error) {
            console.log("Get Global Statistics failed", error)
            return null
        }
    }

    async GetAllLocalStatistics(): Promise<localStatistic[]|null> {
        let localStatisticsArray: localStatistic[] = []
        let i = 1
        try {
            while (i < 57) {
                const territorio = i.toString()
                const count =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({territorio}).count()
                const countContesto =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.Contesto }] }).count()
                const countNoContesto =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.NoContesto }] }).count()
                const countDejarCarta =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.ADejarCarta }] }).count()
                const countNoLlamar =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { estado: this.NoLlamar }] }).count()
                const countNoAbonado =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio}, { noAbonado: true }] }).count()
                const libres =
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUnit).find({ $and: [{ territorio }, { $or: [{ estado: this.NoPredicado }]}, { $or: [{ noAbonado: false }, { noAbonado: null }] }] }).count()

                localStatisticsArray.push({ count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, countNoAbonado, libres, territorio })
                i++
            }
            return localStatisticsArray
        } catch (error) {
            console.log("Get Global Statistics failed", error)
            return null
        }
    }
}
