'use strict'

const t = require('tap')
const test = t.test
const request = require('request')
const fs = require('fs')
const path = require('path')
const Fastify = require('../..')

// Because we are using a self signed certificate for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

try {
  var fastify = Fastify({
    https: {
      key: fs.readFileSync(path.join(__dirname, 'fastify.key')),
      cert: fs.readFileSync(path.join(__dirname, 'fastify.cert'))
    }
  })
  t.pass('Key/cert successfully loaded')
} catch (e) {
  t.fail('Key/cert loading failed', e)
}

test('https get', t => {
  t.plan(1)
  try {
    fastify.get('/', function (req, reply) {
      reply.code(200).send({ hello: 'world' })
    })
    t.pass()
  } catch (e) {
    t.fail()
  }
})

fastify.listen(0, err => {
  t.error(err)
  fastify.server.unref()

  test('https get request', t => {
    t.plan(4)
    request({
      method: 'GET',
      uri: 'https://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.deepEqual(JSON.parse(body), { hello: 'world' })
    })
  })
})
