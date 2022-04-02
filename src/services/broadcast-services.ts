import { Server, Socket } from 'socket.io'
import { domain, logger, server, testingDomain } from '../server'
import { socketError } from './log-services'
import { typeUser } from '../models/user'
import { typeHousehold } from '../models/household'
import { typeHTHBuilding } from '../models/houseToHouse'

type householdChangeObjectPackage = {
    households: typeHousehold[]
    updatedHousehold: typeHousehold
    indexOfHousehold: number
    userEmail: string
}

type socketConnection = 'user: change' | 'household: change' | 'hth: change' | 'connection'
const userChange: socketConnection = 'user: change'
const householdChange: socketConnection = 'household: change'
const hthChange: socketConnection = 'hth: change'
const connection: socketConnection = 'connection'

export const socketConnection = (production: boolean): void => {
    new Server(server, {
        cors: {
            origin: production ? [domain] : [domain, testingDomain],
            methods: ["GET", "POST"],
            credentials: true
        }
    }).on(connection, (socket: Socket): void => {
        // console.log("NEW SOCKET CONNECTION -", socket.id)
        socket.emit(connection, null);
        socket.on(householdChange, (objPackage: householdChangeObjectPackage): void => {
            if (!objPackage) return
            let households: typeHousehold[] = objPackage.households
            const updatedHousehold: typeHousehold = objPackage.updatedHousehold
            const indexOfHousehold: number = objPackage.indexOfHousehold
            const userEmail: string = objPackage.userEmail
            if (!households || !updatedHousehold || indexOfHousehold === null) {
                logger.Add(`Error en socket household change: ${userEmail} ${households?.length} ${indexOfHousehold} ${JSON.stringify(updatedHousehold)}`, socketError)
                return
            }
            households[indexOfHousehold] = updatedHousehold
            socket.emit(householdChange, households, userEmail)
            socket.broadcast.emit(householdChange, households, userEmail)
        })
        socket.on(userChange, (updatedUser: typeUser): void => {
            socket.emit(userChange, updatedUser)
            socket.broadcast.emit(userChange, updatedUser)
        })
        socket.on(hthChange, (updatedBuildings: typeHTHBuilding[]) => {
            socket.emit(hthChange, updatedBuildings)
            socket.broadcast.emit(hthChange, updatedBuildings)
        })
    })
}
