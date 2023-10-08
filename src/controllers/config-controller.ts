import * as configServices from '../services/config-services'
import express, { Request, Response, Router } from 'express'

export const configController: Router = express.Router()

    // get config, not used
    // .get('/', async (req: Request, res: Response) => {
        // const config: typeConfig|null = await getConfigService(req.user)
        // res.json({ success: !!config, config })
    // })

    // get db backup for congregation
    .get('/db-backup', async (req: Request, res: Response) => {
        const dbBackup = await configServices.downloadDbBackupService(req.user)
        res.json({ success: !!dbBackup, dbBackup })
    })

    // edit name of congregation or google site url
    .patch('/', async (req: Request, res: Response) => {
        const disableCloseHthFaces = req.body.disableCloseHthFaces as boolean
        const disableEditHthMaps = req.body.disableEditHthMaps as boolean
        const disableHthBuildingsForUnassignedUsers = req.body.disableHthBuildingsForUnassignedUsers as boolean
        const disableHthFaceObservations = req.body.disableHthFaceObservations as boolean
        const googleBoardUrl = req.body.googleBoardUrl as string
        const useLettersForBlocks = req.body.useLettersForBlocks as boolean
        const name = req.body.name as string
        if ([true, false].includes(disableCloseHthFaces)) {
            const success: boolean = await configServices.setDisableCloseHthFacesService(req.user, disableCloseHthFaces)
            res.json({ success })
        } else if ([true, false].includes(disableEditHthMaps)) {
            const success: boolean = await configServices.setDisableEditHthMapsService(req.user, disableEditHthMaps)
            res.json({ success })
        } else if ([true, false].includes(disableHthBuildingsForUnassignedUsers)) {
            const success: boolean = await configServices.setDisableHthBuildingsForUnassignedUsersService(req.user, disableHthBuildingsForUnassignedUsers)
            res.json({ success })
        } else if ([true, false].includes(disableHthFaceObservations)) {
            const success: boolean = await configServices.setDisableHthFaceObservatiosService(req.user, disableHthFaceObservations)
            res.json({ success })
        } else if (name) {
            const success: boolean = await configServices.setNameOfCongregationService(req.user, name)
            res.json({ success })
        } else if (googleBoardUrl) {
            const success: boolean = await configServices.setGoogleBoardUrlService(req.user, googleBoardUrl)
            res.json({ success })
        } else if ([true, false].includes(useLettersForBlocks)) {
            const success: boolean = await configServices.setUseLettersForBlocksService(req.user, useLettersForBlocks)
            res.json({ success })
        } else {
            res.json({ success: false })
        }
    })

    // invite new user by email
    .put('/invite', async (req: Request, res: Response) => {
        const email = req.body.email as string
        const newCongregation = req.body.newCongregation as boolean
        const success: boolean|string = await configServices.sendInvitationForNewUserService(req.user, email, newCongregation === true)
        if (success === 'exists') {
            res.json({ success: false, userExists: true})
            return
        }
        if (success === 'not sent') {
            res.json({ success: false, notSent: true })
            return
        }
        res.json({ success })
    })
;
