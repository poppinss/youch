'use strict'

const test = require('japa')
const http = require('http')
const path = require('path')
const supertest = require('supertest')
const Youch = require('../src/Youch')
const DEFAULT_PORT = 8000

test.group('Youch', () => {
  test('initiate a new instance by passing error object', (assert) => {
    const error = new Error('foo')
    const youch = new Youch(error, {})
    assert.equal(youch.error.message, 'foo')
    assert.deepEqual(youch.request, {})
  })

  test('parse the error into frames', (assert, done) => {
    const error = new Error('foo')
    const youch = new Youch(error, {})
    youch
      ._parseError()
      .then((stack) => {
        assert.equal(stack[0].file, __filename.replace(/\\/g, '/'))
        assert.equal(stack[0].native, false)
        done()
      }).catch(done)
  })

  test('convert error to JSON', (assert, done) => {
    const error = new Error('foo')
    const youch = new Youch(error, {})
    youch
      .toJSON()
      .then(({ error }) => {
        assert.equal(error.frames[0].filePath, __filename.replace(/\\/g, '/'))
        assert.equal(error.frames[0].isNative, false)
        done()
      }).catch(done)
  })

  test('parse stack frame context to tokens', (assert, done) => {
    const error = new Error('this is bar')
    const youch = new Youch(error, {})

    youch
      ._parseError()
      .then((stack) => {
        const context = youch._getContext(stack[0])
        assert.equal(context.line.trim(), 'const error = new Error(\'this is bar\')')
        done()
      })
      .catch(done)
  })

  // Source map package, webpack bundling, dynamic loading,
  // there are many reasons why the filepath in the stack does not exist.
  test('does not error on non-existing files', (assert, done) => {
    const error = new Error('this is bar')
    error.stack = error.stack.replace(__dirname, 'invalid-path')
    const youch = new Youch(error, {})

    youch
      ._parseError()
      .then((stack) => {
        const frame = stack.find(f => f.file.includes('invalid-path'))
        return youch._getFrameSource(frame)
      })
      .then((source) => {
        assert.deepEqual(source, null)
        done()
      })
      .catch(done)
  })

  test('parse common Webpack scenario', (assert, done) => {
    const error = new Error('this is bar')
    error.stack = error.stack
      .replace(__dirname, path.join(__dirname, ['dist', 'webpack:'].join(path.sep)))

    const youch = new Youch(error, {})

    youch
      ._parseError()
      .then((stack) => {
        console.log(stack)
        const frame = stack.find(file => {
          return file.file && file.file.includes(['dist', 'webpack:'].join('/'))
        })
        return youch._getFrameSource(frame)
      })
      .then((source) => {
        assert.isObject(source)
        assert.isString(source.line)
        assert.isAbove(source.line.length, 10)
        done()
      })
      .catch(done)
  })

  test('return active class when index is 0', (assert) => {
    const error = new Error('this is bar')
    const youch = new Youch(error, {})
    const frame = {
      isApp: true,
      getFileName: () => './hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active')
  })

  test('return native frame class when frame is native', (assert) => {
    const error = new Error('this is bar')
    const youch = new Youch(error, {})
    const frame = {
      isApp: false,
      getFileName: () => './hello.js'
    }

    const classes = youch._getDisplayClasses(frame, 0)
    assert.equal(classes, 'active native-frame')
  })

  test('find if frame is a node_module or not', (assert) => {
    const error = new Error('this is bar')
    const youch = new Youch(error, {})
    const frame = {
      file: process.platform === 'win32' ? '.\\node_modules\\hello.js' : './node_modules/hello.js'
    }
    assert.isTrue(youch._isNodeModule(frame))
  })

  test('serialize http request', (assert, done) => {
    const server = http.createServer((req, res) => {
      const youch = new Youch({}, req)
      res.writeHead(200, { 'content-type': 'application/json' })
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
      res.writeHead(200, { 'content-type': 'application/json' })
      res.write(JSON.stringify(youch._serializeRequest()))
      res.end()
    }).listen(DEFAULT_PORT)

    supertest(server).get('/').set('Cookie', 'name=virk; Path=/').end((error, response) => {
      if (error) {
        done(error)
        return
      }

      assert.isArray(response.body.cookies)
      assert.deepEqual(response.body.cookies, [{ key: 'name', value: 'virk' }, { key: 'Path', value: '/' }])
      assert.equal(response.body.url, '/')
      assert.isArray(response.body.headers)
      done()
    })
  })
})
