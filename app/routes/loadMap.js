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

    if (ceche[mapID]?.loading) { await ceche[mapID].loading }

    const cachedMap = ceche[mapID]
    const cachedMapTime = cachedMap?.time || 0
    const delta = (Date.now() - cachedMapTime) / 1000
    var cacheLoadingPromise = {}

    if (cachedMap) {
      if (delta < cacheTimeout) {
        return sendGziped(res, cachedMap.map)
      }

      cachedMap.loading = new Promise((resolve, reject) => cacheLoadingPromise = { resolve, reject })
      const mapVersion = await Map.findOne({ mapID: mapID }, { __v: true })

      if (mapVersion.__v == cachedMap.__v) {
        cachedMap.time = Date.now()
        cachedMap.loading = null
        cacheLoadingPromise.resolve()
        return sendGziped(res, cachedMap.map)
      }
    }



    var loadingPromise = {}

    ceche[mapID] = {
      loading: new Promise((resolve, reject) => loadingPromise = { resolve, reject })
    }

    console.log("> Loading map " + mapID);
    const map = await Map.findOne({ mapID: mapID })
    console.log("< Loading map " + mapID);

    if (!map) {
      loadingPromise.reject()
      cacheLoadingPromise.reject?.()
      return res.code(404).send()
    }

    const result = {
      imdf: map.imdf,
      meta: { title: "TODO" }
    }

    const gziped = await gzip(Buffer.from(JSON.stringify(result)))

    sendGziped(res, gziped)

    ceche[mapID] = {
      map: gziped,
      __v: map.__v,
      time: Date.now()
    }

    loadingPromise.resolve()
    cacheLoadingPromise.resolve?.()
  })
}
