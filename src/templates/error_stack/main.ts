/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { StackFrame } from 'youch-core/types'
import { dump, themes } from '@poppinss/dumper/html'
import { dump as dumpCli } from '@poppinss/dumper/console'

import { publicDirURL } from '../../public_dir.js'
import { BaseComponent } from '../../component.js'
import { htmlEscape, colors } from '../../helpers.js'
import type { ErrorStackProps } from '../../types.js'

const CHEVIRON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
  <path d="M6 9l6 6l6 -6"></path>
</svg>`

/**
 * Known editors and their URLs to open the file within
 * the code editor
 */
const EDITORS: Record<string, string> = {
  textmate: 'txmt://open?url=file://%f&line=%l',
  macvim: 'mvim://open?url=file://%f&line=%l',
  emacs: 'emacs://open?url=file://%f&line=%l',
  sublime: 'subl://open?url=file://%f&line=%l',
  phpstorm: 'phpstorm://open?file=%f&line=%l',
  atom: 'atom://core/open/file?filename=%f&line=%l',
  vscode: 'vscode://file/%f:%l',
}

/**
 * Displays the formatted and raw error stack along with the
 * source code for individual stack frames
 */
export class ErrorStack extends BaseComponent<ErrorStackProps> {
  cssFile = new URL('./error_stack/style.css', publicDirURL)
  scriptFile = new URL('./error_stack/script.js', publicDirURL)

  /**
   * Returns the file's relative name from the CWD
   */
  #getRelativeFileName(filePath: string) {
    return filePath.replace(`${process.cwd()}/`, '')
  }

  /**
   * Returns the index of the frame that should be expanded by
   * default
   */
  #getFirstExpandedFrameIndex(frames: StackFrame[]) {
    /**
     * Finding the first app frame that should be expanded by default
     */
    let expandAtIndex = frames.findIndex((frame) => frame.type === 'app')

    /**
     * In-case there is no app frame, we will expand one of the module's
     * frame.
     */
    if (expandAtIndex === -1) {
      expandAtIndex = frames.findIndex((frame) => frame.type === 'module')
    }

    return expandAtIndex
  }

  /**
   * Returns the link to open the file within known code
   * editors
   */
  #getEditorLink(ide: string, frame: StackFrame): { href?: string; text: string } {
    const editorURL = EDITORS[ide] || ide
    if (!editorURL || frame.type === 'native') {
      return {
        text: this.#getRelativeFileName(frame.fileName!),
      }
    }

    return {
      href: editorURL.replace('%f', frame.fileName!).replace('%l', String(frame.lineNumber)),
      text: this.#getRelativeFileName(frame.fileName!),
    }
  }

  /**
   * Returns the HTML fragment for the frame location
   */
  #renderFrameLocation(frame: StackFrame, ide: string, index: number) {
    const { text, href } = this.#getEditorLink(ide, frame)

    const fileName = `<a ${href ? `href="${href}"` : ''} class="stack-frame-filepath" title="${text}">
      ${htmlEscape(text)}
    </a>`

    const functionName = frame.functionName
      ? `<span>in <code title="${frame.functionName}">
        ${htmlEscape(frame.functionName)}
      </code></span>`
      : ''

    const loc = `<span>at line <code>${frame.lineNumber}:${frame.columnNumber}</code></span>`

    if (frame.type !== 'native' && frame.source) {
      return `<button class="stack-frame-location" id="stack-frame-location-${index}">
        ${fileName} ${functionName} ${loc}
      </button>`
    }

    return `<div class="stack-frame-location">
      ${fileName} ${functionName} ${loc}
    </div>`
  }

  /**
   * Returns HTML fragment for the stack frame
   */
  async #renderStackFrame(
    frame: StackFrame,
    index: number,
    expandAtIndex: number,
    props: ErrorStackProps
  ) {
    const frameIndex = index + 1
    const id = `frame-${frameIndex}`
    const label = frame.type === 'app' ? '<span class="frame-label">In App</span>' : ''
    const expandedClass = expandAtIndex === index ? 'expanded' : ''
    let toggleButton = ''

    if (frame.type !== 'native' && frame.source) {
      toggleButton = `<button class="stack-frame-toggle-indicator" id="stack-frame-toggle-indicator-${frameIndex}">
          ${CHEVIRON}
        </button>`
    }

    return `<li class="stack-frame ${expandedClass} stack-frame-${frame.type}" id="${id}">
      <div class="stack-frame-contents">
        ${this.#renderFrameLocation(frame, props.ide, frameIndex)}
        <div class="stack-frame-extras">
          ${label}
          ${toggleButton}
        </div>
      </div>
      <div class="stack-frame-source">
        ${await props.sourceCodeRenderer(props.error, frame)}
      </div>
    </li>`
  }

  /**
   * Returns the ANSI output to print the stack frame on the
   * terminal
   */
  async #printStackFrame(
    frame: StackFrame,
    index: number,
    expandAtIndex: number,
    props: ErrorStackProps
  ) {
    const fileName = this.#getRelativeFileName(frame.fileName!)
    const loc = `${fileName}:${frame.lineNumber}:${frame.columnNumber}`

    if (index === expandAtIndex) {
      const functionName = frame.functionName ? `at ${frame.functionName} ` : ''
      const codeSnippet = await props.sourceCodeRenderer(props.error, frame)
      return ` ⁃ ${functionName}${colors.yellow(`(${loc})`)}${codeSnippet}`
    }

    if (frame.type === 'native') {
      const functionName = frame.functionName ? `at ${colors.italic(frame.functionName)} ` : ''
      return colors.dim(` ⁃ ${functionName}(${colors.italic(loc)})`)
    }

    const functionName = frame.functionName ? `at ${frame.functionName} ` : ''
    return ` ⁃ ${functionName}${colors.yellow(`(${loc})`)}`
  }

  /**
   * The toHTML method is used to output the HTML for the
   * web view
   */
  async toHTML(props: ErrorStackProps): Promise<string> {
    const frames = await Promise.all(
      props.error.frames.map((frame, index) => {
        return this.#renderStackFrame(
          frame,
          index,
          this.#getFirstExpandedFrameIndex(props.error.frames),
          props
        )
      })
    )

    return `<section>
      <div class="card">
        <div class="card-heading">
          <div>
            <h3 class="card-title">
              Stack Trace
            </h3>
          </div>
          <div>
            <div class="toggle-switch">
              <button id="formatted-frames" class="active"> Pretty </button>
              <button id="raw-frames"> Raw </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div id="stack-frames-formatted" class="visible">
            <ul id="stack-frames">
              ${frames.join('\n')}
            </ul>
          </div>
          <div id="stack-frames-raw">
            ${dump(props.error.raw, {
              styles: themes.cssVariables,
              expand: true,
              cspNonce: props.cspNonce,
              inspectObjectPrototype: false,
              inspectStaticMembers: false,
              inspectArrayPrototype: false,
            })}
          </div>
        </div>
      </div>
    </section>`
  }

  /**
   * The toANSI method is used to output the text for the console
   */
  async toANSI(props: ErrorStackProps) {
    const displayRaw = process.env.YOUCH_RAW
    if (displayRaw) {
      const depth = Number.isNaN(Number(displayRaw)) ? 2 : Number(displayRaw)
      return `\n\n${colors.red('[RAW]')}\n${dumpCli(props.error.raw, {
        depth: depth,
        inspectObjectPrototype: false,
        inspectStaticMembers: false,
        inspectArrayPrototype: false,
      })}`
    }

    const frames = await Promise.all(
      props.error.frames.map((frame, index) => {
        return this.#printStackFrame(
          frame,
          index,
          this.#getFirstExpandedFrameIndex(props.error.frames),
          props
        )
      })
    )

    return `\n\n${frames.join('\n')}`
  }
}
