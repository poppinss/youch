/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export async function run() {
  try {
    throw new Error('No trace')
  } catch (error) {
    delete error.stack
    throw error
  }
}
