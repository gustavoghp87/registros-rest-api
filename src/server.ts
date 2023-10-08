import { DbConnection } from './services-db/_dbConnection'
import { environment, port } from './env-variables'
import { Logger } from './services/log-services'
import { rateLimit } from 'express-rate-limit'
import { setUpUser } from './services/set-up-user-service'
import { socketConnection } from './services/broadcast-services'
import * as controllers from './controllers'
import cors from 'cors'
import express, { RequestHandler } from 'express'
import morgan from 'morgan'
import path from 'path'
// import { getHTHTerritoriesService } from './services/house-to-house-services'
import { typeBlock, typeCoords, typeDoNotCall, typeFace, typeHTHBuilding, typeObservation, typePolygon } from './models'

export const isProduction = environment === 'prod'
export const testingDb = !isProduction
export const accessTokensExpiresIn = '2160h'  // 90 days
export const recoveryTokensExpiresIn = 24*60*60*1000  // 24 hs
export const invitationNewUserExpiresIn = 7*24*60*60*1000  // 7 days
export const domain = "https://www.misericordiaweb.com"
export const testingDomain = "http://localhost:3000"
export const dbClient = new DbConnection(testingDb)
export const logger = new Logger()
export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const app = express()
app.use(cors({ origin: isProduction ? [domain] : [domain, testingDomain] }))
app.use(rateLimit({
	windowMs: 15*60*1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false // Disable the `X-RateLimit-*` headers
    // skip: (req, res) => ['192.168.0.56', '192.168.0.21'].includes(req.ip),
	// store: ... , // Use an external store for more precise rate limiting
}))
app.use(express.json() as RequestHandler)
app.use(express.urlencoded({ extended: false }) as RequestHandler)
app.use(morgan('dev') as RequestHandler)
app.use(express.static(path.join(__dirname, 'build')))
//app.use('/api/campaign', setUpUser, controllers.campaignController)
app.use('/api/board', setUpUser, controllers.boardController)
app.use('/api/config', setUpUser, controllers.configController)
app.use('/api/email', setUpUser, controllers.emailController)
app.use('/api/log', setUpUser, controllers.logController)
app.use('/api/house-to-house', setUpUser, controllers.houseToHouseController)
app.use('/api/geocoding', setUpUser, controllers.geocodingController)
app.use('/api/telephonic', setUpUser, controllers.telephonicController)
app.use('/api/user', setUpUser, controllers.userController)
app.use('/api/weather', setUpUser, controllers.weatherController)

// const limite = 0.0001

const calcularCentro = (coordinates: typeCoords[]) => {
    let sumLat = 0;
    let sumLng = 0;
    for (const coordinate of coordinates) {
        sumLat += coordinate.lat
        sumLng += coordinate.lng
    }
    const numberOfCoordinates = coordinates.length
    const lat = sumLat / numberOfCoordinates
    const lng = sumLng / numberOfCoordinates
    return { lat, lng }
}

// const reemplazarCoordenadas = (blockCoordinates: typeCoords[][]) => {
//     if (blockCoordinates?.length !== 4) return console.log("No son 4");
    

//     const coordTriangulo1 = blockCoordinates[0]
//     const coordTriangulo2 = blockCoordinates[1]
//     const coordTriangulo3 = blockCoordinates[2]
//     const coordTriangulo4 = blockCoordinates[3]

//     for (let i = 0; i < 3; i++) {
//         let lat1 = 0
//         let lng1 = 0
//         if ((coordTriangulo1[i].lat <= blockCoordinates[1][0].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[1][0].lat - limite) 
//          && (coordTriangulo1[i].lat <= blockCoordinates[1][1].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[1][1].lat - limite)) ++lat1
//         if (coordTriangulo1[i].lat <= blockCoordinates[1][2].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[1][2].lat - limite) ++lat1
//         if (coordTriangulo1[i].lng <= blockCoordinates[1][0].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[1][0].lng - limite) ++lng1
//         if (coordTriangulo1[i].lng <= blockCoordinates[1][1].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[1][1].lng - limite) ++lng1
//         if (coordTriangulo1[i].lng <= blockCoordinates[1][2].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[1][2].lng - limite) ++lng1
//         let lat2 = 0
//         let lng2 = 0
//         if (coordTriangulo1[i].lat <= blockCoordinates[2][0].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[2][0].lat - limite) ++lat2
//         if (coordTriangulo1[i].lat <= blockCoordinates[2][1].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[2][1].lat - limite) ++lat2
//         if (coordTriangulo1[i].lat <= blockCoordinates[2][2].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[2][2].lat - limite) ++lat2
//         if (coordTriangulo1[i].lng <= blockCoordinates[2][0].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[2][0].lng - limite) ++lng2
//         if (coordTriangulo1[i].lng <= blockCoordinates[2][1].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[2][1].lng - limite) ++lng2
//         if (coordTriangulo1[i].lng <= blockCoordinates[2][2].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[2][2].lng - limite) ++lng2
//         let lat3 = 0
//         let lng3 = 0
//         if (coordTriangulo1[i].lat <= blockCoordinates[3][0].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[3][0].lat - limite) ++lat3
//         if (coordTriangulo1[i].lat <= blockCoordinates[3][1].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[3][1].lat - limite) ++lat3
//         if (coordTriangulo1[i].lat <= blockCoordinates[3][2].lat + limite || coordTriangulo1[i].lat <= blockCoordinates[3][2].lat - limite) ++lat3
//         if (coordTriangulo1[i].lng <= blockCoordinates[3][0].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[3][0].lng - limite) ++lng3
//         if (coordTriangulo1[i].lng <= blockCoordinates[3][1].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[3][1].lng - limite) ++lng3
//         if (coordTriangulo1[i].lng <= blockCoordinates[3][2].lng + limite || coordTriangulo1[i].lng <= blockCoordinates[3][2].lng - limite) ++lng3
//         console.log(`Latitud se repite ${lat1} y longitud ${lng1} para el triángulo 2`);
//         console.log(`Latitud se repite ${lat2} y longitud ${lng2} para el triángulo 3`);
//         console.log(`Latitud se repite ${lat3} y longitud ${lng3} para el triángulo 4`);
//     }

//     // for (let i = 0; i < 4; i++) {
//     //     const triangulo = blockCoordinates[0][i]
//     //     let lat1 = 0
//     //     let lng1 = 0
//     //     let lat2 = 0
//     //     let lng2 = 0
//     //     let lat3 = 0
//     //     let lng3 = 0
//     //     let lat4 = 0
//     //     let lng4 = 0
//     //     if (blockCoordinates[0][0].lat < triangulo.lat + limite || blockCoordinates[0][0].lat < triangulo.lat - limite) ++lat1
//     //     if (blockCoordinates[0][0].lng < triangulo.lng + limite || blockCoordinates[0][0].lng < triangulo.lng - limite) ++lng1
//     //     if (blockCoordinates[0][1].lat < triangulo.lat + limite || blockCoordinates[0][1].lat < triangulo.lat - limite) ++lat2
//     //     if (blockCoordinates[0][1].lng < triangulo.lng + limite || blockCoordinates[0][1].lng < triangulo.lng - limite) ++lng2
//     //     if (blockCoordinates[0][2].lat < triangulo.lat + limite || blockCoordinates[0][2].lat < triangulo.lat - limite) ++lat3
//     //     if (blockCoordinates[0][2].lng < triangulo.lng + limite || blockCoordinates[0][2].lng < triangulo.lng - limite) ++lng3
//     //     if (blockCoordinates[0][3].lat < triangulo.lat + limite || blockCoordinates[0][3].lat < triangulo.lat - limite) ++lat4
//     //     if (blockCoordinates[0][3].lng < triangulo.lng + limite || blockCoordinates[0][3].lng < triangulo.lng - limite) ++lng4
//     //     console.log(`El triángulo ${i+1} tiene: (${lat1} - ${lng1}) - (${lat2} - ${lng2}) - (${lat3} - ${lng3}) - (${lat4} - ${lng4})`);
        

//     //     const blockCoordinatesCLEAN: typeCoords[] = []
//     //     const centro = calcularCentro(blockCoordinatesCLEAN)
//     // }
// }

export type typeCoords1 = {
    lat: number
    lng: number
    clasif?: 'NE' | 'NO' | 'SE' | 'SO' | 'CENTRO'
}

export type typePolygon1 = {
    block: typeBlock
    buildings: typeHTHBuilding[]
    completionData: {
        completionDates: number[]
        isFinished: boolean
        reopeningDates: number[]
    }
    coordsPoint1: typeCoords1
    coordsPoint2: typeCoords1
    coordsPoint3: typeCoords1
    doNotCalls: typeDoNotCall[]
    face: typeFace
    id: number
    observations: typeObservation[]
    street: string
}

const comp = 0.0001

const clasificarCoordenadas = (cara: typePolygon, caras: typePolygon[]): typePolygon1 => {
    const nuevaCara: typePolygon1 = { ...cara }
    const coordenadas = caras.map(c => [c.coordsPoint1, c.coordsPoint2, c.coordsPoint3]).flat()
    let cercanosCoord1 = 0
    let cercanosCoord2 = 0
    let cercanosCoord3 = 0
    let centro: typeCoords|null = null
    coordenadas.forEach(coordenada => {
        if (Math.abs(coordenada.lat - cara.coordsPoint1.lat) < comp && Math.abs(coordenada.lng - cara.coordsPoint1.lng) < comp)
            cercanosCoord1++
        if (Math.abs(coordenada.lat - cara.coordsPoint2.lat) < comp && Math.abs(coordenada.lng - cara.coordsPoint2.lng) < comp)
            cercanosCoord2++
        if (Math.abs(coordenada.lat - cara.coordsPoint3.lat) < comp && Math.abs(coordenada.lng - cara.coordsPoint3.lng) < comp)
            cercanosCoord3++
    })
    console.log(`Manzana ${cara.block} cara ${cara.face}`);
    if (cercanosCoord1 === 2) {
        console.log("La coordenada 1 es LADO");
    } else if (cercanosCoord1 === 4) {
        console.log("La coordenada 1 es CENTRO");
        nuevaCara.coordsPoint1.clasif = 'CENTRO'
        centro = nuevaCara.coordsPoint1
    } else {
        console.log("La coordenada 1 FALLÓ");
    }

    if (cercanosCoord2 === 2) {
        console.log("La coordenada 2 es LADO");
    } else if (cercanosCoord2 === 4) {
        console.log("La coordenada 2 es CENTRO");
        nuevaCara.coordsPoint2.clasif = 'CENTRO'
        centro = nuevaCara.coordsPoint2
    } else {
        console.log("La coordenada 2 FALLÓ");
    }

    if (cercanosCoord3 === 2) {
        console.log("La coordenada 3 es LADO");
    } else if (cercanosCoord3 === 4) {
        console.log("La coordenada 3 es CENTRO");
        nuevaCara.coordsPoint3.clasif = 'CENTRO'
        centro = nuevaCara.coordsPoint3
    } else {
        console.log("La coordenada 3 FALLÓ");
    }

    if (!centro || (nuevaCara.coordsPoint1.clasif === 'CENTRO' ? 1 : 0) + (nuevaCara.coordsPoint2.clasif === 'CENTRO' ? 1 : 0) + (nuevaCara.coordsPoint3.clasif === 'CENTRO' ? 1 : 0) !== 1)
        throw new Error("Hay más de un centro o no hay ninguno");
    
    if (nuevaCara.coordsPoint1.clasif !== 'CENTRO') {
        if (nuevaCara.coordsPoint1.lat > centro.lat && nuevaCara.coordsPoint1.lng > centro.lng) nuevaCara.coordsPoint1.clasif = 'NE'
        else if (nuevaCara.coordsPoint1.lat < centro.lat && nuevaCara.coordsPoint1.lng < centro.lng) nuevaCara.coordsPoint1.clasif = 'SO'
        else if (nuevaCara.coordsPoint1.lat > centro.lat && nuevaCara.coordsPoint1.lng < centro.lng) nuevaCara.coordsPoint1.clasif = 'NO'
        else nuevaCara.coordsPoint1.clasif = 'SE'
    }
    if (nuevaCara.coordsPoint2.clasif !== 'CENTRO') {
        if (nuevaCara.coordsPoint2.lat > centro.lat && nuevaCara.coordsPoint2.lng > centro.lng) nuevaCara.coordsPoint2.clasif = 'NE'
        else if (nuevaCara.coordsPoint2.lat < centro.lat && nuevaCara.coordsPoint2.lng < centro.lng) nuevaCara.coordsPoint2.clasif = 'SO'
        else if (nuevaCara.coordsPoint2.lat > centro.lat && nuevaCara.coordsPoint2.lng < centro.lng) nuevaCara.coordsPoint2.clasif = 'NO'
        else nuevaCara.coordsPoint2.clasif = 'SE'
    }
    if (nuevaCara.coordsPoint3.clasif !== 'CENTRO') {
        if (nuevaCara.coordsPoint3.lat > centro.lat && nuevaCara.coordsPoint3.lng > centro.lng) nuevaCara.coordsPoint3.clasif = 'NE'
        else if (nuevaCara.coordsPoint3.lat < centro.lat && nuevaCara.coordsPoint3.lng < centro.lng) nuevaCara.coordsPoint3.clasif = 'SO'
        else if (nuevaCara.coordsPoint3.lat > centro.lat && nuevaCara.coordsPoint3.lng < centro.lng) nuevaCara.coordsPoint3.clasif = 'NO'
        else nuevaCara.coordsPoint3.clasif = 'SE'
    }
    return nuevaCara
}

const getCoords = (coords: typeCoords1): typeCoords => ({ lat: coords.lat, lng: coords.lng })

export const server = app.listen(port, () => {
    console.log(`\n\n\nListening on port ${port}`)
    socketConnection(isProduction)

    // setTimeout(async () => {
        
    //     const territories = await getHTHTerritoriesService()
    //     if (!territories) return
    //     territories.forEach(t => {
    //         console.log(`Territory ${t.territoryNumber}:`);
    //         const blocks = Array.from(new Set(t.map.polygons.map(o => o['block'])))  // manzanas existentes [1, 2, 3]
    //         blocks.forEach(b => {
    //             const polygons = t.map.polygons.filter(p => p.block === b)  // caras de cada manzana
    //             if (polygons.length !== 4) return
    //             polygons.forEach(async p => {
    //                 const caraClasificada = clasificarCoordenadas(p, polygons)
    //                 console.log(caraClasificada.coordsPoint1);
    //                 console.log(caraClasificada.coordsPoint2);
    //                 console.log(caraClasificada.coordsPoint3);
    //                 const NE = caraClasificada.coordsPoint1.clasif === 'NE' ? caraClasificada.coordsPoint1 : caraClasificada.coordsPoint2.clasif === 'NE' ? caraClasificada.coordsPoint2 : caraClasificada.coordsPoint3
    //                 const NO = caraClasificada.coordsPoint1.clasif === 'NO' ? caraClasificada.coordsPoint1 : caraClasificada.coordsPoint2.clasif === 'NO' ? caraClasificada.coordsPoint2 : caraClasificada.coordsPoint3
    //                 const SE = caraClasificada.coordsPoint1.clasif === 'SE' ? caraClasificada.coordsPoint1 : caraClasificada.coordsPoint2.clasif === 'SE' ? caraClasificada.coordsPoint2 : caraClasificada.coordsPoint3
    //                 const SO = caraClasificada.coordsPoint1.clasif === 'SO' ? caraClasificada.coordsPoint1 : caraClasificada.coordsPoint2.clasif === 'SO' ? caraClasificada.coordsPoint2 : caraClasificada.coordsPoint3
    //                 const nuevoCentro: typeCoords = calcularCentro([NE, NO, SE, SO])
    //                 await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTHTerritories).updateOne(
    //                     { congregation: 1, territoryNumber: t.territoryNumber },
    //                     { $set: {
    //                         'map.polygons.$[x].coordsPoint1': caraClasificada.coordsPoint1.clasif === 'CENTRO' ? nuevoCentro : caraClasificada.coordsPoint1.clasif === 'NE' ? getCoords(NE) : caraClasificada.coordsPoint1.clasif === 'NO' ? getCoords(NO) : caraClasificada.coordsPoint1.clasif === 'SE' ? getCoords(SE) : getCoords(SO),
    //                         'map.polygons.$[x].coordsPoint2': caraClasificada.coordsPoint2.clasif === 'CENTRO' ? nuevoCentro : caraClasificada.coordsPoint2.clasif === 'NE' ? getCoords(NE) : caraClasificada.coordsPoint2.clasif === 'NO' ? getCoords(NO) : caraClasificada.coordsPoint2.clasif === 'SE' ? getCoords(SE) : getCoords(SO),
    //                         'map.polygons.$[x].coordsPoint3': caraClasificada.coordsPoint3.clasif === 'CENTRO' ? nuevoCentro : caraClasificada.coordsPoint3.clasif === 'NE' ? getCoords(NE) : caraClasificada.coordsPoint3.clasif === 'NO' ? getCoords(NO) : caraClasificada.coordsPoint3.clasif === 'SE' ? getCoords(SE) : getCoords(SO)
    //                     }},
    //                     { arrayFilters: [{ 'x.block': b, 'x.face': p.face, 'x.id': p.id }] }
    //                 )
    //                 console.log("Guardada", p.street);
    //             })
    //             console.log("\n\n");
    //         })
    //     })
    // }, 6000)
})
