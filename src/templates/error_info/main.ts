/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseComponent } from '../../component.js'
import { publicDirURL } from '../../public_dir.js'
import { wordWrap, colors } from '../../helpers.js'
import type { ErrorInfoProps } from '../../types.js'

const ERROR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="24" height="24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v6m0 4.01.01-.011M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/></svg>`

const HINT_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="24" height="24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 2-1 1M3 2l1 1m17 13-1-1M3 16l1-1m5 3h6m-5 3h4M12 3C8 3 5.952 4.95 6 8c.023 1.487.5 2.5 1.5 3.5S9 13 9 15h6c0-2 .5-2.5 1.5-3.5h0c1-1 1.477-2.013 1.5-3.5.048-3.05-2-5-6-5Z"/></svg>`

const COPY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>`

function htmlAttributeEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Displays the error info including the response status text,
 * error name, error message and the hint.
 */
export class ErrorInfo extends BaseComponent<ErrorInfoProps> {
  cssFile = new URL('./error_info/style.css', publicDirURL)
  scriptFile = new URL('./error_info/script.js', publicDirURL)

  /**
   * The toHTML method is used to output the HTML for the
   * web view
   */
  async toHTML(props: ErrorInfoProps): Promise<string> {
    return `<section>
      <h4 id="error-name">${props.error.name}</h4>
      <h1 id="error-title">${props.title}</h1>
    </section>
    <section>
      <div class="card">
        <div class="card-body">
          <h2 id="error-message">
            <span>${ERROR_ICON_SVG}</span>
            <span>${props.error.message}</span>
            <button
              id="copy-error-btn"
              data-error-text="${htmlAttributeEscape(`${props.error.name}: ${props.error.message}`)}"
              onclick="copyErrorMessage(this)"
              title="Copy error message"
              aria-label="Copy error message to clipboard"
            >
              ${COPY_ICON_SVG}
            </button>
          </h2>
          ${
            props.error.hint
              ? `<div id="error-hint">
                <span>${HINT_ICON_SVG}</span>
                <span>${props.error.hint}</span>
              </div>`
              : ''
          }
        </div>
      </div>
    </section>`
  }

  /**
   * The toANSI method is used to output the text for the console
   */
  async toANSI(props: ErrorInfoProps) {
    const errorMessage = colors.red(
      `ℹ ${wordWrap(`${props.error.name}: ${props.error.message}`, {
        width: process.stdout.columns,
        indent: '  ',
        newLine: '\n',
        escape: (value) => value,
      })}`
    )

    const hint = props.error.hint
      ? `\n\n${colors.blue('◉')} ${colors.dim().italic(
          wordWrap(props.error.hint.replace(/(<([^>]+)>)/gi, ''), {
            width: process.stdout.columns,
            indent: '  ',
            newLine: '\n',
            escape: (value) => value,
          })
        )}`
      : ''

    return `${errorMessage}${hint}`
  }
}
