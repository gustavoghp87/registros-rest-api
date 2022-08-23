import { NextFunction, Request, Response } from 'express'
import { Credentials } from 'google-auth-library'
import { getActivatedUserByAccessTokenService } from '../services/user-services'
import { authorizationString, recaptchaTokenString, typeAllLogsObj, typeCampaignPack, typeCongregationItem, typeCoords, typeHousehold, typeHTHTerritory, typeLocalTelephonicStatistic, typeTelephonicStatistic, typeTelephonicTerritory, typeUser } from '../models'

declare global {
    namespace Express {
        export interface Request {
        user: typeUser
        }
    }
}

export const validateRecaptchaToken = async (req: Request, res: Response, next: NextFunction) => {
    const recaptchaToken: string = req.header(recaptchaTokenString) || ""
    // const success: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)    TODO
    // if (!success) return res.json({ success })
    next()
}

const testUser: string = 'test@user.com'
const testAdmin: string = 'test@admin.com'
const tokenTestUser: string = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const tokenAdminUser: string = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab'

export const setUpUser = async (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.header(authorizationString) || ""
    if (token === tokenTestUser || req.body?.email === testUser) return res.json(getMockedUserResponse(false))
    if (token === tokenAdminUser || req.body?.email === testAdmin) return res.json(getMockedUserResponse(true))
    // const user: typeUser|null = await getActivatedUserByAccessTokenService(token)    TODO
    // if (user) req.user = user
    next()
}

const getMockedUserResponse = (isAdmin: boolean): typeResponseData => {
    const userEmail: string = isAdmin ? testAdmin : testUser
    return {
        success: true,
        address: "Concordia 21 1 2",
        allLogsObj: {
            campaignLogs: {
                logs: [{
                    logText: `20/8/2022, 19:47:38 | Usuario ${userEmail} recibió el paquete 97 por solicitud automática`,
                    timestamp: 1661168080000
                }],
                type: 'CampaignLogs'
            },
            errorLogs: {
                logs: [{
                    logText: `14/7/2022 21:55:33 | No se pudo enviar correo de recuperación de cuenta a ${userEmail}`,
                    timestamp: 1661168080000
                }],
                type: 'ErrorLogs'
            },
            houseToHouseAdminLogs: {
                logs: [{
                    logText: `19/8/2022, 10:59:33 | Admin ${userEmail} modificó el mapa del territorio 4`,
                    timestamp: 1661168080000
                }],
                type: 'HouseToHouseAdminLogs'
            },
            houseToHouseLogs: {
                logs: [{
                    logText: `19/8/2022, 10:59:33 | El usuario ${userEmail} hizo una observación en el territorio 4`,
                    timestamp: 1661168080000
                }],
                type: 'HouseToHouseLogs'
            },
            loginLogs: {
                logs: [{
                    logText: `19/8/2022, 10:59:33 | Se logueó el ${userEmail}`,
                    timestamp: 1661168080000
                }],
                type: 'LoginLogs'
            },
            telephonicLogs: {
                logs: [{
                    logText: `19/8/2022, 10:59:33 | Usuario ${userEmail} modificó una vivienda: territorio 52, vivienda 22031, estado No contestó, no abonado false, asignado false`,
                    timestamp: 1661168080000
                }],
                type: 'TelephonicLogs'
            },
            telephonicStateLogs: {
                logs: [{
                    logText: `19/8/2022, 10:59:33 | Usuario ${userEmail} cambia territorio 14 a terminado`,
                    timestamp: 1661168080000
                }],
                type: 'TelephonicStateLogs'
            },
            userLogs: {
                logs: [{
                    logText: `19/8/2022, 10:59:33 | Se desasignó el territorio de telefónica 14 a ${userEmail} porque lo cerró`,
                    timestamp: 1661168080000
                }],
                type: 'UserLogs'
            },
        },
        campaignAssignments: [44],
        campaignPack: {
            assignedTo: userEmail,
            calledPhones: [],
            from: 1122223300,
            id: 44,
            isAccessible: false,
            isFinished: false,
            to: 1122223349
        },
        campaignPacks: [{
            assignedTo: userEmail,
            calledPhones: [],
            from: 1122223300,
            id: 44,
            isAccessible: false,
            isFinished: false,
            to: 1122223349
        }],
        congregationItems: [
            {
           ids: [
                ],
           title: "Anuncios y Cartas"
            },
            {
           ids: [
                ],
           title: "Programa de reuniones"
            },
            {
           ids: [
                ],
           title: "Predicación"
            },
            {
           ids: [
                ],
           title: "Sonido y Acomodadores"
            },
            {
           ids: [
                ],
           title: "Limpieza"
            },
            {
           ids: [
                ],
           title: "Grupos"
            }
        ],
        coordinates: {
            lat: -34.6319777,
            lng: -58.4757213
        },
        email: userEmail,
        emailSuccess: true,
        expired: false,
        globalStatistics: {
            numberOf_ADejarCarta: 1,
            numberOf_Contesto: 1000,
            numberOf_FreePhones: 3000,
            numberOf_NoAbonado: 500,
            numberOf_NoContesto: 800,
            numberOf_NoLlamar: 100,
            numberOfHouseholds: 5401
        },
        gmailKeys: {
            access_token: "abc",
            expiry_date: 11111111111,
            id_token: 'abc123',
            refresh_token: 'aabbcc'
        },
        household: {
       address: "Concordia 21 1 2",
       block: "1",
       callingState: "No predicado",
       dateOfLastCall: 1661190010295,
       notSubscribed: false,
       householdId: 1,
       isAssigned: false,
       phoneNumber: "54-11-4613-0867",
       doorBell: "1 2",
       street: "Concordia",
       streetNumber: 21
        },
        hthTerritory: {
            map: {
                centerCoords: {
               lat: -34.63088475094777,
               lng: -58.47324188830458
                },
                lastEditor: userEmail,
                markers: [],
                polygons: [
                    {
                   block: "1",
                   coordsPoint1: {
                       lat: -34.6304776580043,
                       lng: -58.474124535421154
                        },
                   coordsPoint2: {
                       lat: -34.631218766130246,
                       lng: -58.47434904391251
                        },
                   coordsPoint3: {
                       lat: -34.63074553684708,
                       lng: -58.475149819321636
                        },
                   doNotCalls: [
                            {
                           creator: "ghp.2120@gmail.com",
                           date: "2022-07-11",
                                doorBell: "2A",
                                id: 1657570428011,
                                streetNumber: 2349,
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-11",
                                doorBell: "3B",
                                id: 1657570751929,
                                streetNumber: 2350,
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-11",
                                doorBell: "",
                                id: 1657572430332,
                                streetNumber: 2351,
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-11",
                                doorBell: "C",
                                id: 1657572670460,
                                streetNumber: 2348,
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-12",
                                doorBell: "1D",
                                id: 1657644187635,
                                streetNumber: 2350,
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-12",
                                doorBell: "",
                                id: 1657675116946,
                                streetNumber: 2301,
                                deleted: false
                            }
                        ],
                        face: "A",
                        id: 1657563696007,
                        isFinished: false,
                        observations: [
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-12",
                                id: 1657675250321,
                                text: "Observación editada",
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-08-06",
                                id: 1659835150715,
                                text: "Observación 2: queda observado de prueba, queda observado de prueba, queda observado de prueba",
                                deleted: false
                            }
                        ],
                        street: "Yerbal"
                    },
                    {
                        block: "1",
                        coordsPoint1: {
                            lat: -34.6304921387505,
                            lng: -58.474119670542095
                        },
                        coordsPoint2: {
                            lat: -34.63174442188175,
                            lng: -58.473549378761355
                        },
                        coordsPoint3: {
                            lat: -34.63122262836885,
                            lng: -58.474343099956926
                        },
                        doNotCalls: [],
                        face: "B",
                        id: 1657659482046,
                        isFinished: true,
                        observations: [
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-08-17",
                                id: 1660752010256,
                                text: "Obs manz 1 cara 2",
                                deleted: false
                            }
                        ],
                        street: "Cuenca"
                    },
                    {
                        block: "1",
                        coordsPoint1: {
                            lat: -34.63122845386888,
                            lng: -58.4743457366586
                        },
                        coordsPoint2: {
                            lat: -34.63173752507019,
                            lng: -58.473545928983995
                        },
                        coordsPoint3: {
                            lat: -34.63201960654559,
                            lng: -58.47456916607343
                        },
                        doNotCalls: [
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-14",
                                doorBell: "1° C",
                                id: 1657805998721,
                                streetNumber: 2310,
                                deleted: false
                            }
                        ],
                        face: "C",
                        id: 1657659646637,
                        isFinished: false,
                        observations: [
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-14",
                                id: 1657805967853,
                                text: "Observación Manzana 1 cara C: una observación",
                                deleted: false
                            }
                        ],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "1",
                        coordsPoint1: {
                            lat: -34.632014299458405,
                            lng: -58.474567394274125
                        },
                        coordsPoint2: {
                            lat: -34.631223658607745,
                            lng: -58.47435159745405
                        },
                        coordsPoint3: {
                            lat: -34.63075742993098,
                            lng: -58.47514797152022
                        },
                        doNotCalls: [],
                        face: "D",
                        id: 1657735692516,
                        isFinished: false,
                        observations: [
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-16",
                                id: 1657995658398,
                                text: "Observación corta",
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-16",
                                id: 1657997472488,
                                text: "Observación corta ccc",
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-16",
                                id: 1657997741120,
                                text: "Observación corta ddd",
                                deleted: false
                            }
                        ],
                        street: "Campana 2"
                    },
                    {
                        block: "2",
                        coordsPoint1: {
                            lat: -34.630204915700354,
                            lng: -58.473028680697446
                        },
                        coordsPoint2: {
                            lat: -34.63097213296905,
                            lng: -58.473238476259276
                        },
                        coordsPoint3: {
                            lat: -34.63045762798701,
                            lng: -58.474046081362346
                        },
                        doNotCalls: [],
                        face: "A",
                        id: 1657766647124,
                        isFinished: false,
                        observations: [],
                        street: "Yerbal"
                    },
                    {
                        block: "2",
                        coordsPoint1: {
                            lat: -34.630205790055356,
                            lng: -58.473025148083366
                        },
                        coordsPoint2: {
                            lat: -34.630968198873006,
                            lng: -58.47322909985364
                        },
                        coordsPoint3: {
                            lat: -34.631424999709175,
                            lng: -58.472447193653515
                        },
                        doNotCalls: [],
                        face: "B",
                        id: 1657766688331,
                        isFinished: true,
                        observations: [],
                        street: "Helguera"
                    },
                    {
                        block: "2",
                        coordsPoint1: {
                            lat: -34.63096789381602,
                            lng: -58.47324566225329
                        },
                        coordsPoint2: {
                            lat: -34.63140970205187,
                            lng: -58.47247310452848
                        },
                        coordsPoint3: {
                            lat: -34.631700267343504,
                            lng: -58.47349132464968
                        },
                        doNotCalls: [],
                        face: "C",
                        id: 1657808465215,
                        isFinished: false,
                        observations: [],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "2",
                        coordsPoint1: {
                            lat: -34.63046105805857,
                            lng: -58.474055929853705
                        },
                        coordsPoint2: {
                            lat: -34.6309720517209,
                            lng: -58.47324974051218
                        },
                        coordsPoint3: {
                            lat: -34.63170999722204,
                            lng: -58.473500038718505
                        },
                        doNotCalls: [],
                        face: "D",
                        id: 1657812818508,
                        isFinished: false,
                        observations: [],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "3",
                        coordsPoint1: {
                            lat: -34.630183519872006,
                            lng: -58.472938005691645
                        },
                        coordsPoint2: {
                            lat: -34.62990669955477,
                            lng: -58.47182089656976
                        },
                        coordsPoint3: {
                            lat: -34.63063194128851,
                            lng: -58.47203827580757
                        },
                        doNotCalls: [],
                        face: "A",
                        id: 1657813113307,
                        isFinished: true,
                        observations: [],
                        street: "Yerbal"
                    },
                    {
                        id: 1657824975187,
                        block: "3",
                        doNotCalls: [],
                        coordsPoint1: {
                            lat: -34.629890981054835,
                            lng: -58.47182041565869
                        },
                        coordsPoint2: {
                            lat: -34.63108362924742,
                            lng: -58.47127456095124
                        },
                        coordsPoint3: {
                            lat: -34.630628431895325,
                            lng: -58.472041775457676
                        },
                        face: "B",
                        isFinished: false,
                        observations: [],
                        street: "Argerich"
                    },
                    {
                        block: "3",
                        coordsPoint1: {
                            lat: -34.6306289361724,
                            lng: -58.47204842526862
                        },
                        coordsPoint2: {
                            lat: -34.63108458215116,
                            lng: -58.47127586754381
                        },
                        coordsPoint3: {
                            lat: -34.631388985052894,
                            lng: -58.47236695616786
                        },
                        doNotCalls: [],
                        face: "C",
                        id: 1657828465443,
                        isFinished: false,
                        observations: [],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "3",
                        coordsPoint1: {
                            lat: -34.6301890979069,
                            lng: -58.472934729029824
                        },
                        coordsPoint2: {
                            lat: -34.630629249302814,
                            lng: -58.47204987995917
                        },
                        coordsPoint3: {
                            lat: -34.631391833771744,
                            lng: -58.47236879216847
                        },
                        doNotCalls: [
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-16",
                                doorBell: "P",
                                id: 1657998485660,
                                streetNumber: 1120,
                                deleted: false
                            }
                        ],
                        face: "D",
                        id: 1657828650330,
                        isFinished: false,
                        observations: [
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-16",
                                id: 1657998465413,
                                text: "Observación corta",
                                deleted: false
                            },
                            {
                                creator: "ghp.2120@gmail.com",
                                date: "2022-07-16",
                                id: 1657998506332,
                                text: "Observación larga: observación de prueba, observación de prueba, observación de prueba, observación de prueba, observación de prueba",
                                deleted: false
                            }
                        ],
                        street: "Helguera"
                    }
                ],
                zoom: 17.764626416998578
            },
            territoryNumber: '1'
        },
        isDisabled: false,
        localStatistics: [{
            numberOf_ADejarCarta: 1,
            numberOf_Contesto: 1000,
            numberOf_FreePhones: 3000,
            numberOf_NoAbonado: 500,
            numberOf_NoContesto: 800,
            numberOf_NoLlamar: 100,
            numberOfHouseholds: 5401,
            isFinished: false,
            territoryNumber: '1'
        }],
        modifiedCount: 1,
        newPassword: "Abc123456",
        newToken: isAdmin ? tokenAdminUser : tokenTestUser,
        recaptchaFails: false,
        streets: ["Concordia"],
        telephonicTerritory: {
            households: [{
                address: "Concordia 21 1 2",
                block: "1",
                callingState: "No predicado",
                dateOfLastCall: 1661190010295,
                notSubscribed: false,
                householdId: 1,
                isAssigned: false,
                phoneNumber: "54-11-4613-0867",
                doorBell: "1 2",
                street: "Concordia",
                streetNumber: 21
            },
            {
                address: "Concordia 25 1 2",
                block: "1",
                callingState: 'No predicado',
                dateOfLastCall: 1661190010295,
                notSubscribed: true,
                householdId: 2,
                isAssigned: false,
                phoneNumber: "54-11-4613-0868",
                doorBell: "1 2",
                street: "Concordia",
                streetNumber: 25
            },
            {
                address: "Concordia 29 4 2",
                block: "1",
                callingState: "No predicado",
                dateOfLastCall: 1661190010295,
                notSubscribed: false,
                householdId: 3,
                isAssigned: true,
                phoneNumber: "54-11-4613-0869",
                doorBell: "4 2",
                street: "Concordia",
                streetNumber: 29
            },
            {
                address: "Concordia 29 4 3",
                block: "1",
                callingState: "Contestó",
                dateOfLastCall: 1661190010295,
                notSubscribed: false,
                householdId: 4,
                isAssigned: false,
                phoneNumber: "54-11-4613-0870",
                doorBell: "4 3",
                street: "Concordia",
                streetNumber: 29
            }],
            stateOfTerritory: {
                isFinished: false,
                resetDates: [
                    {
                        date: 1660695848008,
                        option: 1
                    },
                    {
                        date: 1660695853807,
                        option: 2
                    },
                    {
                        date: 1660695858327,
                        option: 4
                    }
                ]
            },
            territoryNumber: '1'
        },
        url: 'gmail@gmail.com',
        used: false,
        user: {
            email: userEmail,
            group: 1,
            hthAssignments: [1],
            id: 1,
            isActive: true,
            phoneAssignments: [1],
            recoveryOptions: [],
            role: isAdmin ? 1 : 0,
            tokenId: 1
        },
        userExists: true,
        users: [{
            email: userEmail,
            group: 1,
            hthAssignments: [1],
            id: 1,
            isActive: true,
            phoneAssignments: [1],
            recoveryOptions: [],
            role: isAdmin ? 1 : 0,
            tokenId: 1
        }],
        wrongPassword: false
    }
}

type typeResponseData = {
    success: boolean
    //
    address: string
    allLogsObj: typeAllLogsObj
    campaignAssignments: number[]
    congregationItems: typeCongregationItem[]
    coordinates: typeCoords
    email: string
    emailSuccess: boolean
    expired: boolean
    gmailKeys: Credentials
    household: typeHousehold
    hthTerritory: typeHTHTerritory
    isDisabled: boolean
    localStatistics: typeLocalTelephonicStatistic[]
    modifiedCount: number
    newPassword: string
    newToken: string,
    campaignPack: typeCampaignPack
    campaignPacks: typeCampaignPack[]
    recaptchaFails: boolean
    globalStatistics: typeTelephonicStatistic,
    telephonicTerritory: typeTelephonicTerritory
    url: string
    used: boolean
    user: typeUser
    userExists: boolean
    users: typeUser[]
    streets: string[]
    wrongPassword: boolean
}
