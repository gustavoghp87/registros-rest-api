import { typeVivienda } from '../../models/vivienda'
import { collUnit, dbMW } from './_dbConnection'
import { dbClient } from '../../server'

export class HouseholdDb {

    async GetBlocks(territory: string) {
        let blocks = []
        let i = 1
        while (i < 9) {
            let busq = await dbClient.Client.db(dbMW).collection(collUnit).findOne({
                territorio: {$in: [territory]},
                manzana: {$in: [i.toString()]}
            })
            if (busq) blocks.push(i)
            i++
        }
        return blocks
    }
    async SearchTerritoryByNumber(terr: string, manzana: string, todo: boolean, traidos: number, traerTodos: boolean) {
        let households:typeVivienda[] = []

        if (!todo && !traerTodos)
            households = await dbClient.Client.db(dbMW).collection(collUnit).find({
                $and: [
                    {territorio: {$in: [terr]}},
                    {manzana: {$in: [manzana]}},
                    {estado: 'No predicado'},
                    {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]
            }).toArray()   // quito limit

        if (!todo && traerTodos)
            households = await dbClient.Client.db(dbMW).collection(collUnit).find({
                $and: [
                    {territorio: {$in: [terr]}},
                    {manzana: {$in: [manzana]}},
                    {estado: 'No predicado'},
                    {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]
            }).toArray()

        if (todo && traerTodos)
            households = await dbClient.Client.db(dbMW).collection(collUnit).find({
                territorio: {$in: [terr]},
                manzana: {$in: [manzana]}
            }).sort({ fechaUlt: 1 }).toArray()

        if (todo && !traerTodos)
            households = await dbClient.Client.db(dbMW).collection(collUnit).find({
                territorio: {$in: [terr]},
                manzana: {$in: [manzana]}
            }).limit(traidos).toArray()
        ;

        return households
    }
    async SearchHouseholdByNumber(numb: string) {
        const household = await dbClient.Client.db(dbMW).collection(collUnit).findOne({ inner_id: numb })
        return household
    }
    async ResetTerritory(option: number, territorio: string) {
        const time = Date.now()                              // todo en milisegundos
        const sixMonths = 15778458000
        const timeSixMonths = time - sixMonths

        if (option===1) {
            console.log("Entra en opción 1 // limpiar más de 6 meses")
            await dbClient.Client.db(dbMW).collection(collUnit).updateMany({
                $and: [
                    {territorio},
                    {$or: [{noAbonado: false}, {noAbonado: null}]},
                    {fechaUlt: {$lt: timeSixMonths}}
                ]
            }, {
                $set: {estado: "No predicado", asignado: false}
            })
        }
        
        if (option===2) {
            console.log("Entra en opción 2  // limpiar todos")
            await dbClient.Client.db(dbMW).collection(collUnit).updateMany({
                $and: [
                    {territorio},
                    {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]
            }, {
                $set: {estado: "No predicado", asignado: false}
            })
        }
        
        if (option===3) {
            console.log("Entra en opción 3  // limpiar y no abonados de más de 6 meses")
            await dbClient.Client.db(dbMW).collection(collUnit).updateMany({
                $and: [
                    {territorio},
                    {fechaUlt: {$lt: timeSixMonths}}
                ]
            }, {
                $set: {estado: "No predicado", asignado: false, noAbonado:false}
            })
        }
        
        if (option===4) {
            console.log("Entra en opción 4  // limpiar absolutamente todo")
            await dbClient.Client.db(dbMW).collection(collUnit).updateMany({
                $and: [
                    {territorio}
                ]
            }, {
                $set: {estado: "No predicado", asignado: false, noAbonado:false}
            })
        }

        return true
    }
    async UpdateHouseholdState(input: any) {
        try {
            await dbClient.Client.db(dbMW).collection(collUnit).updateOne({inner_id: input.inner_id},
                {$set: {estado:input.estado, noAbonado:input.noAbonado, asignado:input.asignado, fechaUlt:Date.now()}}
            )
            const viviendaNuevoEstado = await dbClient.Client.db(dbMW).collection(collUnit).findOne({ inner_id: input.inner_id })
            return viviendaNuevoEstado
        } catch (error) {
            console.log("Update Household State GraphQL failed:", error)
            return null
        }
    }
    async GetGlobalStatistics() {
        try {
            const count = await dbClient.Client.db(dbMW).collection(collUnit).find().count()
            const countContesto = await dbClient.Client.db(dbMW).collection(collUnit).find({estado:'Contestó'}).count()
            const countNoContesto = await dbClient.Client.db(dbMW).collection(collUnit).find({estado:'No contestó'}).count()
            const countDejarCarta = await dbClient.Client.db(dbMW).collection(collUnit).find({estado:'A dejar carta'}).count()
            const countNoLlamar = await dbClient.Client.db(dbMW).collection(collUnit).find({estado:'No llamar'}).count()
            const countNoAbonado = await dbClient.Client.db(dbMW).collection(collUnit).find({noAbonado:true}).count()
            const libres = await dbClient.Client.db(dbMW).collection(collUnit).find(
                { $and: [
                    {estado: 'No predicado'}, {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]}).count()
            return {count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, countNoAbonado, libres}
        } catch (error) {
            console.log("Get Global Statistics failed", error)
            return null
        }
    }
    async GetLocalStatistics(territorio: string) {
        try {
            const count = await dbClient.Client.db(dbMW).collection(collUnit)
                .find({territorio}).count()
            const countContesto = await dbClient.Client.db(dbMW).collection(collUnit).find({ $and: [{territorio}, {estado:'Contestó'}] }).count()
            const countNoContesto = await dbClient.Client.db(dbMW).collection(collUnit).find({ $and: [{territorio}, {estado:'No contestó'}] }).count()
            const countDejarCarta = await dbClient.Client.db(dbMW).collection(collUnit).find({ $and: [{territorio}, {estado:'A dejar carta'}] }).count()
            const countNoLlamar = await dbClient.Client.db(dbMW).collection(collUnit).find({ $and: [{territorio}, {estado:'No llamar'}] }).count()
            const countNoAbonado = await dbClient.Client.db(dbMW).collection(collUnit).find({ $and: [{territorio}, {noAbonado:true}] }).count()
            const libres = await dbClient.Client.db(dbMW).collection(collUnit).find({ $and: [{territorio}, {$or: [{estado: 'No predicado'}]}, {$or: [{noAbonado: false}, {noAbonado: null}]}]}).count()
            return {count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, countNoAbonado, libres}
        } catch (error) {
            console.log("Get Global Statistics failed", error)
            return null
        }
    }

    // TODO: AddHousehold() {}
}
