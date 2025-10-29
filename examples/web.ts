/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createServer } from 'node:http'
import { createError } from '@poppinss/exception'

import { run as pg } from './pg.js'
import { Youch } from '../src/youch.js'
import { run as axios } from './axios.js'
import { run as drive } from './flydrive.js'
import { run as noTrace } from './no_trace.ts'
import { HTTP_STATUSES } from './http_statuses.js'

const E_ROUTE_NOT_FOUND = createError('Route not found', 'E_ROUTE_NOT_FOUND', 404)
const AVAILABLE_ROUTES = ['/axios', '/drive', '/pg', '/no-trace']

createServer(async (req, res) => {
  try {
    switch (req.url) {
      case '/axios':
        await axios()
        break
      case '/drive':
        await drive()
        break
      case '/no-trace':
        await noTrace()
        break
      case '/pg':
        await pg()
        break
      default:
        throw new E_ROUTE_NOT_FOUND()
    }
  } catch (error) {
    const statusCode = error.status ?? 500
    const status = HTTP_STATUSES.find((httpStatus) => httpStatus.code === statusCode)
    const youch = new Youch()

    if (error instanceof E_ROUTE_NOT_FOUND) {
      youch.metadata.group('Application', {
        routes: AVAILABLE_ROUTES.map((route) => {
          return {
            key: 'GET',
            value: `<a href="${route}">${route}</a>`,
          }
        }),
      })
    }

    const html = await youch.toHTML(error, {
      title: status?.pharse,
      cspNonce: 'fooooo',
      request: {
        url: req.url,
        method: req.method,
        headers: req.headers,
      },
    })
    res.writeHead(statusCode, { 'content-type': 'text/html' })
    res.write(html)
    res.end()
  }
}).listen(3000, () => {
  console.log('Listening on http://localhost:3000')
})
