import { MongoClient, ObjectId } from 'mongodb'
import { databaseUrl } from '../env-variables'
import { typeUser } from "../../models/user"
import { typeVivienda } from '../../models/vivienda'


const dbMW = "Misericordia-Web"
const collUsers = "usuarios"
const collTerr = "viviendas"
const collCampaign = "campanya"

export class DbConnection {

    private Client: MongoClient = new MongoClient(databaseUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )

    constructor () {
        ;(async () => {
            await this.Client.connect()
            console.log("DB connected")
        })()
    }
    
    async SearchUserByEmail(email: string) {
        try {
        const user = await this.Client.db(dbMW).collection(collUsers).findOne({ email })
        if (!user) {console.log("User not found by email in db"); return null}
        console.log("Search by email in db,", user?.email)
        return user
        } catch (error) {
            console.log("Db user by email", error)
            return null
        }
    }
    async SearchUserByToken(token: string) {
        try {
            const user = await this.Client.db(dbMW).collection(collUsers).findOne({ newtoken: token })
            if (!user) {console.log("User not found by token in db"); return null}
            console.log("Search by token db,", user.email)
            return user
        } catch (error) {
            console.log("Db user by token", error)
            return null
        }
    }
    async SearchUserById(_id: string) {
        const user = await this.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(_id) })
        console.log("Search by Id 2,", user.email)
        return user
    }
    async SearchAllUsers() {
        const users = await this.Client.db(dbMW).collection(collUsers).find().toArray()
        console.log("Search all users:", users.length)
        return users
    }
    async AddTokenToUser(email: string, token: string) {
        await this.Client.db(dbMW).collection(collUsers).updateOne({ email }, { $set: { newtoken: token } })
        const user = await this.SearchUserByToken(token)
        if (!user || user.email !== email) return false
        return true
    }
    async RegisterUser(newUser: typeUser) {
        await this.Client.db(dbMW).collection(collUsers).insertOne(newUser)
        const user = await this.SearchUserByEmail(newUser.email)
        if (!user) return false
        return true
    }
    async ChangeMode(email: string, darkMode: boolean) {
        await this.Client.db(dbMW).collection(collUsers).updateOne({ email }, {$set: { darkMode } })
        const user = await this.SearchUserByEmail(email)
        if (!user || user.darkMode !== darkMode) return false
        return true
    }
    async ChangePsw(email: string, passwordEncrypted: string) {
        await this.Client.db(dbMW).collection(collUsers).updateOne({email}, {$set: {password:passwordEncrypted}})
        const user = await this.SearchUserByEmail(email)
        if (!user || user.password !== passwordEncrypted) return false
        return true
    }

    // users
    ///////////////////
    // households

    async GetBlocks(territory: string) {
        let blocks = []
        let i = 1
        while (i < 9) {
            let busq = await this.Client.db(dbMW).collection(collTerr).findOne({
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
            households = await this.Client.db(dbMW).collection(collTerr).find({
                $and: [
                    {territorio: {$in: [terr]}},
                    {manzana: {$in: [manzana]}},
                    {estado: 'No predicado'},
                    {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]
            }).toArray()   // quito limit

        if (!todo && traerTodos)
            households = await this.Client.db(dbMW).collection(collTerr).find({
                $and: [
                    {territorio: {$in: [terr]}},
                    {manzana: {$in: [manzana]}},
                    {estado: 'No predicado'},
                    {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]
            }).toArray()

        if (todo && traerTodos)
            households = await this.Client.db(dbMW).collection(collTerr).find({
                territorio: {$in: [terr]},
                manzana: {$in: [manzana]}
            }).sort({ fechaUlt: 1 }).toArray()

        if (todo && !traerTodos)
            households = await this.Client.db(dbMW).collection(collTerr).find({
                territorio: {$in: [terr]},
                manzana: {$in: [manzana]}
            }).limit(traidos).toArray()
        ;

        return households
    }
    async SearchHouseholdByNumber(numb: string) {
        const household = await this.Client.db(dbMW).collection(collTerr).findOne({ inner_id: numb })
        return household
    }
    async ResetTerritory(option: number, territorio: string) {
        const time = Date.now()                              // todo en milisegundos
        const sixMonths = 15778458000
        const timeSixMonths = time - sixMonths

        if (option===1) {
            console.log("Entra en opción 1 // limpiar más de 6 meses")
            await this.Client.db(dbMW).collection(collTerr).updateMany({
                $and: [
                    {territorio},
                    {$or: [{noAbonado: false}, {noAbonado: null}]},
                    {fechaUlt: {$lt: timeSixMonths}}
                ]
            }, {
                $set: {estado: "No predicado"}
            })
        }
        
        if (option===2) {
            console.log("Entra en opción 2  // limpiar todos")
            await this.Client.db(dbMW).collection(collTerr).updateMany({
                $and: [
                    {territorio},
                    {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]
            }, {
                $set: {estado: "No predicado"}
            })
        }
        
        if (option===3) {
            console.log("Entra en opción 3  // limpiar y no abonados de más de 6 meses")
            await this.Client.db(dbMW).collection(collTerr).updateMany({
                $and: [
                    {territorio},
                    {fechaUlt: {$lt: timeSixMonths}}
                ]
            }, {
                $set: {estado: "No predicado", noAbonado:false}
            })
        }
        
        if (option===4) {
            console.log("Entra en opción 4  // limpiar absolutamente todo")
            await this.Client.db(dbMW).collection(collTerr).updateMany({
                $and: [
                    {territorio}
                ]
            }, {
                $set: {estado: "No predicado", noAbonado:false}
            })
        }

        return true
    }
    
    // territories
    ///////////////////
    // campaign

    async GetCampaign() {
        try {
            const pack = await this.Client.db(dbMW).collection(collCampaign).find().toArray()
            return pack
        } catch (error) {
            console.log("Get Campaign failed", error)
            return null
        } finally {
        }
    }
    async AsignCampaign(id:number, email:string) {
        try {
            if (email==='Nadie')
                await this.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $set: { asignado: 'No asignado' } })
            else
                await this.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $set: { asignado: email } })
            return true
        } catch (error) {
            console.log("Asign Campaign failed", "Cannot asign", id, "to", email, error)
            return false
        } finally {
        }
    }
    async GetPack(id: number) {
        try {
            const pack = await this.Client.db(dbMW).collection(collCampaign).findOne({ id })
            return pack
        } catch (error) {
            console.log("Get Pack failed", error)
            return null
        } finally {
        }

    }
    async ClickBox(email: string, tel: number, id: number, checked: boolean) {
        try {
            const pack = await this.Client.db(dbMW).collection(collCampaign).findOne({id})
            if (!pack || pack.asignado !== email) return false

            if (checked) {
                await this.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $pull: { llamados: tel } })
                await this.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $set: { terminado: false } })
            } else {
                await this.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $addToSet: { llamados: tel } })
                const packN = await this.Client.db(dbMW).collection(collCampaign).findOne({ id })
                if (packN && packN.llamados && packN.llamados.length === 50) {
                    console.log("YA SON 50")
                    await this.Client.db(dbMW).collection(collCampaign).updateOne({id}, { $set: { terminado: true }})
                }
            }
            return true
        } catch (error) {
            console.error("Click Box failed", error)
            return false
        } finally {
        }
    }

    // campaign
    ///////////////////
    // emails

    async GetEmailLastTime() {
        try {
            const lastEmailObj = await this.Client.db(dbMW).collection('emailAlert')
                .findOne({ _id: new ObjectId('5fcbdce29382c6966fa4d583') })
            const lastEmailTime = lastEmailObj.lastEmail
            return lastEmailTime
        } catch (error) {
            console.log("Get Email Last Time failed", error)
            return null
        } finally {
        }
    }
    async CheckTerritoriesToEmail() {
        try {
            let alert: string[] = []
            let i: number = 1
            while (i < 57) {
                const libres = await this.Client.db(dbMW).collection(collTerr).find({
                    $and: [
                        {territorio: i.toString()},
                        //{$or: [{estado: 'No predicado'}, {estado: 'No contestó'}]},
                        {estado: 'No predicado'},
                        {$or: [{noAbonado: false}, {noAbonado: null}]}
                    ]
                }).count()
                console.log(`Territorio ${i}, libres: ${libres}`)

                if (libres<50) {
                    let users = await this.Client.db(dbMW).collection(collUsers).find({
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
        } finally {
        }
    }
    async UpdateLastEmail() {
        try {
            const newDate = + new Date()
            await this.Client.db(dbMW).collection('emailAlert').updateOne(
                {_id: new ObjectId('5fcbdce29382c6966fa4d583')},
                {$set: {lastEmail: newDate}}
            )
            const lastEmailObj = await this.Client.db(dbMW).collection('emailAlert')
                .findOne({_id: new ObjectId('5fcbdce29382c6966fa4d583')})
            if (!lastEmailObj || lastEmailObj.lastEmail !== newDate) return false
            return true
        } catch (error) {
            console.log("Update Last Email failed", error)
            return false
        } finally {
        }
    }

    // emails
    ///////////////////
    // statistics

    async GetGlobalStatistics() {
        try {
            const count = await this.Client.db(dbMW).collection(collTerr).find().count()
            const countContesto = await this.Client.db(dbMW).collection(collTerr).find({estado:'Contestó'}).count()
            const countNoContesto = await this.Client.db(dbMW).collection(collTerr).find({estado:'No contestó'}).count()
            const countDejarCarta = await this.Client.db(dbMW).collection(collTerr).find({estado:'A dejar carta'}).count()
            const countNoLlamar = await this.Client.db(dbMW).collection(collTerr).find({estado:'No llamar'}).count()
            const countNoAbonado = await this.Client.db(dbMW).collection(collTerr).find({noAbonado:true}).count()
            const libres = await this.Client.db(dbMW).collection(collTerr).find(
                { $and: [
                    {estado: 'No predicado'}, {$or: [{noAbonado: false}, {noAbonado: null}]}
                ]}).count()
            return {count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, countNoAbonado, libres}
        } catch (error) {
            console.log("Get Global Statistics failed", error)
            return null
        } finally {
        }
    }
    async GetLocalStatistics(territorio: string) {
        try {
            const count = await this.Client.db(dbMW).collection(collTerr)
                .find({territorio}).count()
            const countContesto = await this.Client.db(dbMW).collection(collTerr).find({ $and: [{territorio}, {estado:'Contestó'}] }).count()
            const countNoContesto = await this.Client.db(dbMW).collection(collTerr).find({ $and: [{territorio}, {estado:'No contestó'}] }).count()
            const countDejarCarta = await this.Client.db(dbMW).collection(collTerr).find({ $and: [{territorio}, {estado:'A dejar carta'}] }).count()
            const countNoLlamar = await this.Client.db(dbMW).collection(collTerr).find({ $and: [{territorio}, {estado:'No llamar'}] }).count()
            const countNoAbonado = await this.Client.db(dbMW).collection(collTerr).find({ $and: [{territorio}, {noAbonado:true}] }).count()
            const libres = await this.Client.db(dbMW).collection(collTerr).find({ $and: [{territorio}, {$or: [{estado: 'No predicado'}]}, {$or: [{noAbonado: false}, {noAbonado: null}]}]}).count()
            return {count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, countNoAbonado, libres}
        } catch (error) {
            console.log("Get Global Statistics failed", error)
            return null
        } finally {
        }
    }

    // statistics
    ///////////////////
    // graphQL

    async UpdateUserState(input: any) {
        try {
            await this.Client.db(dbMW).collection(collUsers).updateOne(
                {_id: new ObjectId(input.user_id)},
                {$set: {estado:input.estado, role:input.role, group:input.group}}
            )
            const user = await this.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(input.user_id) })
            if (!user || user.estado !== input.estado || user.role !== input.role || user.group !== input.group) return null
            return user
        } catch (error) {
            console.log("Update User State GraphQL failed:", error)
            return null
        } finally {
        }
    }
    async AsignTerritory(input: any) {
        try {

            if (input.all) await this.Client.db(dbMW).collection(collUsers).updateOne(           // desasign all
                {_id: new ObjectId(input.user_id)},
                {$set: {asign: []}}
            )
    
            if (input.asignar) {
                const userToMod = await this.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(input.user_id) })
                if (!userToMod) return null
                let arrayV = userToMod.asign || []
                arrayV.indexOf(input.asignar)===-1 ? arrayV.push(input.asignar) : console.log("Ya estaba")
                arrayV.sort((a:number, b:number) => a - b)
                await this.Client.db(dbMW).collection(collUsers).updateOne(
                    {_id: new ObjectId(input.user_id)},
                    {$set: {asign: arrayV}}
                )
            }
    
            if (input.desasignar) await this.Client.db(dbMW).collection(collUsers).updateOne(
                {_id: new ObjectId(input.user_id)},
                {$pullAll: {asign: [input.desasignar]}
            })

            const user = await this.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(input.user_id) })
            if (!user) return null
            return user
        } catch (error) {
            console.log("Asign Territory GraphQL failed:", error)
            return null
        } finally {
        }
    }
    async UpdateHouseholdState(input: any) {
        try {
            await this.Client.db(dbMW).collection(collTerr).updateOne({inner_id: input.inner_id},
                {$set: {estado:input.estado, noAbonado:input.noAbonado, asignado:input.asignado, fechaUlt:Date.now()}}
            )
            const viviendaNuevoEstado = await this.Client.db(dbMW).collection(collTerr).findOne({ inner_id: input.inner_id })
            return viviendaNuevoEstado
        } catch (error) {
            console.log("Update Household State GraphQL failed:", error)
            return null
        } finally {
        }
    }
    async MarkEverythingLikeCalled(packId: number) {
        try {
            await this.Client.db(dbMW).collection(collCampaign).updateMany({ id: packId }, {
                $set: {asignado: 'No asignado', terminado: true}
            })
            return true
        } catch (error) {
            console.log("Update Household State GraphQL failed:", error)
            return false
        } finally {
        }
    }

    // TODO: AddHousehold() {}
}
