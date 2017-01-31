'use strict'

const http = require('http')
const supertest = require('supertest')
const test = require('japa')
const Youch = require('../src/Youch')

const DEFAULT_PORT=8000

test.group('Youch', () => {

  test('initiate a new instance by passing error object', (assert) => {
    const error = new Error('foo')
    const youch = new Youch(error, {})
    assert.equal(youch.error.message, 'foo')
    assert.deepEqual(youch.request, {})
  })

  test('parse the error into frames', (assert, done) => {
    assert.plan(2)
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

  test('parse stack frame context to tokens', (assert, done) => {
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

  test('return active class when index is 0', (assert) => {
    const error = new Error('this is bar')
    const youch  = new Youch(error, {})
    const frame = {
      isNative: () => false,
      getFileName: () => './hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active')
  })

  test('return native frame class when frame is native', (assert) => {
    const error = new Error('this is bar')
    const youch  = new Youch(error, {})
    const frame = {
      isNative: () => true,
      getFileName: () => './hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active native-frame')
  })

  test('return native frame class when frame is from node_modules', (assert) => {
    const error = new Error('this is bar')
    const youch  = new Youch(error, {})
    const frame = {
      isNative: () => false,
      getFileName: () => './node_modules/hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active native-frame')
  })

  test('serialize http request', (assert, done) => {
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

  test('serialize http request and return cookies from it', (assert, done) => {
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
