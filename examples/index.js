'use strict'

const http = require('http')
const Youch = require('../src/Youch')

class HttpException extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
  }
}

function foo () {
  const error = new HttpException('Some weird error')
  error.status = 503
  throw error
}

http.createServer((req, res) => {
  let youch = null
  try {
    foo()
  } catch (e) {
    youch = new Youch(e, req)
  }

  youch
  .toHTML()
  .then((response) => {
    res.writeHead(200, {'content-type': 'text/html'})
    res.write(response)
    res.end()
  }).catch((error) => {
    res.writeHead(500)
    res.write(error.message)
    res.end()
  })
}).listen(8000, () => {
  console.log('listening to port 8000')
})
