/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError } from '@poppinss/exception'

import { run as pg } from './pg.js'
import { Youch } from '../src/youch.js'
import { run as axios } from './axios.js'
import { run as drive } from './flydrive.js'
import { run as noTrace } from './no_trace.ts'

const argv = process.argv.splice(2)
const fn = argv[0] ?? 'axios'

const E_COMMAND_NOT_FOUND = createError('Command not found', 'E_COMMAND_NOT_FOUND', 404)

try {
  switch (fn) {
    case 'axios':
      await axios()
      break
    case 'drive':
      await drive()
      break
    case 'pg':
      await pg()
      break
    case 'no_trace':
      await noTrace()
      break
    default:
      throw new E_COMMAND_NOT_FOUND()
  }
} catch (error) {
  const youch = new Youch()
  const output = await youch.toANSI(error)
  console.error(output)
  process.exit(1)
}
