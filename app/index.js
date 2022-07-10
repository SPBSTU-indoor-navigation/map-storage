import Fastify from 'fastify'
import config from 'config'
import mongoose from 'mongoose'
import cors from '@fastify/cors'

import routes from './routes/index.js'


const app = Fastify({
  bodyLimit: 1024 * 1024 * 20
})

app.register(cors, { origin: '*' })
app.register(routes)


async function Start() {
  const port = config.get('appPort') || 5000
  try {
    await mongoose.connect(config.get('mongo-URL-serve'))

    app.listen({ port }, () => {
      console.log(`App listening at http://localhost:${port}`)
    })
  }
  catch (e) {
    console.error(`Server error: ${e.message}`)
    process.exit(1)
  }
}

Start()
