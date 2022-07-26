import { Server, Socket } from 'socket.io'
import { domain, logger, server, testingDomain } from '../server'
import { socketError } from './log-services'
import { typeHousehold, typeUser } from '../models'

type householdChangeObjectPackage = {
    updatedHousehold: typeHousehold
    userEmail: string
}

type socketConnection = 'user: change' | 'household: change' | 'hth: change' | 'connection'

const connection: socketConnection = 'connection'
const householdChange: socketConnection = 'household: change'
const userChange: socketConnection = 'user: change'
//const hthChange: socketConnection = 'hth: change'

export const socketConnection = (production: boolean): void => {
    new Server(server, {
        cors: {
            origin: production ? [domain] : [domain, testingDomain],
            methods: ["GET", "POST"],
            credentials: true
        }
    }).on(connection, (socket: Socket): void => {
        socket.emit(connection, null)
        socket.on(householdChange, (objPackage: householdChangeObjectPackage): void => {
            if (!objPackage) return
            const updatedHousehold: typeHousehold = objPackage.updatedHousehold
            const userEmail: string = objPackage.userEmail
            if (!updatedHousehold || !userEmail) {
                logger.Add(`Error en socket household change: ${userEmail} ${JSON.stringify(updatedHousehold)}`, socketError)
                return
            }
            socket.emit(householdChange, updatedHousehold, userEmail)
            socket.broadcast.emit(householdChange, updatedHousehold, userEmail)
        })
        socket.on(userChange, (updatedUser: typeUser): void => {
            socket.emit(userChange, updatedUser)
            socket.broadcast.emit(userChange, updatedUser)
        })
        // socket.on(hthChange, (updatedBuildings: typeHTHBuilding[]) => {
        //     socket.emit(hthChange, updatedBuildings)
        //     socket.broadcast.emit(hthChange, updatedBuildings)
        // })
    })
}
