import { Map } from '../db/index.js'
import config from 'config'

/**
@param { import('fastify').FastifyInstance } fastify
*/
export default async function routes(fastify) {
  fastify.post('/saveMap/:id', async (req, res) => {

    if (req.headers.authorization?.split(' ')[1] != config.get('authorization')) {
      console.log("403");
      return res.code(403).send()
    }

    const map = await Map.findOne({ mapID: req.params.id }) || new Map({
      mapID: req.params.id,
    })

    map.imdf = req.body

    map.__v = (map.__v || 0) + 1

    await map.save();

    res.send("done")
  })
}



