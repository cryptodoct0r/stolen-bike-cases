/* eslint-disable no-console */
const path = require('path')
const express = require('express')
const consola = require('consola')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const bodyParser = require('body-parser')
const config = require('../nuxt.config.js')
const caseRoutes = require('./routes/caseRoutes')
const officersRoutes = require('./routes/officersRoutes')
require('dotenv').config()

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  mongoose.set('useCreateIndex', true)
  mongoose
    .connect(process.env.MONGO_DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('connected to mongodb')
    })
    .catch((error) => {
      console.log('unable to connect to mongodb')
      console.error(error)
    })

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    )
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    next()
  })

  app.use(cors())

  // configure body parser
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())

  app.use(morgan('dev')) // configire morgan

  app.use('/static', express.static(path.join(__dirname, 'static')))

  app.use('/api/cases', caseRoutes)
  app.use('/api/officers', officersRoutes)

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  })
}
start()
