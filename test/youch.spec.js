'use strict'

const http = require('http')
const supertest = require('supertest')
const Youch = require('../src/Youch')
const assert = require('chai').assert

const DEFAULT_PORT=8000

describe('Youch', () => {

  it('initiate a new instance by passing error object', () => {
    const error = new Error('foo')
    const youch = new Youch(error, {})
    assert.equal(youch.error.message, 'foo')
    assert.deepEqual(youch.request, {})
  })

  it('parse the error into frames', (done) => {
    const error = new Error('foo')
    const youch = new Youch(error, {})
    youch
      ._parseError()
      .then((stack) => {
        assert.equal(stack[0].fileName, __filename)
        assert.equal(stack[0].native, false)
        done()
      }).catch(done)
  })

  it('parse stack frame context to tokens', (done) => {
    const error = new Error('this is bar')
    const youch  = new Youch(error, {})

    youch
      ._parseError()
      .then((stack) => {
        const context = youch._getContext(stack[0])
        assert.equal(context.line.trim(), 'const error = new Error(\'this is bar\')')
        done()
      })
      .catch(done)
  })

  it('return active class when index is 0', () => {
    const error = new Error('this is bar')
    const youch  = new Youch(error, {})
    const frame = {
      isNative: () => false,
      getFileName: () => './hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active')
  })

  it('return native frame class when frame is native', () => {
    const error = new Error('this is bar')
    const youch  = new Youch(error, {})
    const frame = {
      isNative: () => true,
      getFileName: () => './hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active native-frame')
  })

  it('return native frame class when frame is from node_modules', () => {
    const error = new Error('this is bar')
    const youch  = new Youch(error, {})
    const frame = {
      isNative: () => false,
      getFileName: () => './node_modules/hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active native-frame')
  })

  it('serialize http request', (done) => {
    const server = http.createServer((req, res) => {
      const youch = new Youch({}, req)
      res.writeHead(200, {'content-type': 'application/json'})
      res.write(JSON.stringify(youch._serializeRequest()))
      res.end()
    }).listen(DEFAULT_PORT)

    supertest(server).get('/').end((error, response) => {
      if (error) {
        done(error)
        return
      }

      assert.isArray(response.body.cookies)
      assert.deepEqual(response.body.cookies, [])
      assert.equal(response.body.url, '/')
      assert.isArray(response.body.headers)
      server.close()
      done()
    })
  })

  it('serialize http request and return cookies from it', (done) => {
    const server = http.createServer((req, res) => {
      const youch = new Youch({}, req)
      res.writeHead(200, {'content-type': 'application/json'})
      res.write(JSON.stringify(youch._serializeRequest()))
      res.end()
    }).listen(DEFAULT_PORT)

    supertest(server).get('/').set('Cookie', 'name=virk; Path=/').end((error, response) => {
      if (error) {
        done(error)
        return
      }

      assert.isArray(response.body.cookies)
      assert.deepEqual(response.body.cookies, [{key: 'name', value: 'virk'}, {key: 'Path', value: '/'}])
      assert.equal(response.body.url, '/')
      assert.isArray(response.body.headers)
      done()
    })
  })
})
