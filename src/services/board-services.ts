import { getConfigService } from './config-services'
import { logger } from '../server'
import { typeBoardItem, typeConfig, typeUser } from '../models'
import Axios from 'axios'

export const getBoardItems = async (requesterUser: typeUser): Promise<typeBoardItem[]|null> => {
    if (!requesterUser) return null
    const siteUrl: string = 'https://sites.google.com'
    try {
        const config: typeConfig|null = await getConfigService(requesterUser)
        if (!config?.googleBoardUrl) return null
        const { data } = await Axios.get(siteUrl + config.googleBoardUrl)
        const items: string[] = []
        const urlElements: string[] = data.split('data-url="')
        urlElements.forEach(x => items.push(x.split('"')[0]))
        items.shift()
        items.shift()
        const promisesArray: any[] = []
        for (let i = 0; i < items.length; i++) {
            promisesArray.push(new Promise(async (resolve, reject) => {
                try {
                    const { data } = await Axios.get(siteUrl + items[i])
                    // const titleElements: string[] = data.split('</h2>')[0].split('>')
                    // const title: string = titleElements[titleElements.length - 1]
                    let title: string = items[i].split('/')[3].replace('-', ' ').replace('-', ' ').replace('-', ' ')
                    title = title.charAt(0).toUpperCase() + title.slice(1);
                    let ids: string[] = data.split('data-embed-doc-id="')
                    ids.shift()
                    ids = ids.map(x => x.split('"')[0])
                    resolve({
                        ids,
                        title
                    })
                } catch (error) {
                    logger.Add(requesterUser.congregation, `No se pudo traer el identificador del PDF: ${error}`, 'ErrorLogs')
                    reject()
                }
            }))
        }
        const boardItems: typeBoardItem[] = await Promise.all(promisesArray)
        return boardItems
    } catch (error) {
        logger.Add(requesterUser.congregation, `Falló la conexión con el sitio Google de los PDF: ${error}`, 'ErrorLogs')
        return null
    }
}
