import { gzip } from 'node-gzip'

import { Map } from '../db/index.js'
import config from 'config'

const cacheTimeout = config.get('cache-timeout') || 60
let ceche = {}

const sendGziped = (res, data) => {
  res
    .header("Content-Type", "application/json")
    .header("Content-Encoding", "gzip")
    .send(data)
}

/**
@param { import('fastify').FastifyInstance } fastify
*/
export default async function routes(fastify) {
  fastify.get('/map/:id', async (req, res) => {
    const mapID = req.params.id

    const cachedMap = ceche[mapID]
    const cachedMapTime = cachedMap?.time || 0
    const delta = (Date.now() - cachedMapTime) / 1000

    if (cachedMap && (delta < cacheTimeout || (await Map.findOne({ mapID: mapID }, { __v: true })).__v == cachedMap.__v)) {

      if (delta > cacheTimeout) {
        cachedMap.time = Date.now()
      }

      sendGziped(res, cachedMap.map)
    }

    const map = await Map.findOne({ mapID: mapID })

    if (map) {
      const result = {
        imdf: map.imdf,
        meta: { title: "TODO" }
      }

      const gziped = await gzip(Buffer.from(JSON.stringify(result)))

      sendGziped(res, gziped)

      return ceche[mapID] = {
        map: gziped,
        __v: map.__v,
        time: Date.now()
      }
    }

    res.code(404).send()

  })
}
