'use strict'

/*
 * youch
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 * Ported to Typescript by AvidCoder123 <github: AvidCoder123>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as cookie from 'cookie'
import Mustache from 'mustache'
import * as stackTrace from 'stack-trace'
import { IncomingMessage } from 'http'
const VIEW_PATH = './error.compiled.mustache'
const startingSlashRegex = /\\|\//

interface youchStackFrame extends stackTrace.StackFrame {
  context?: frameContext
}
interface frameContext {
  start?: number
  pre?: Array<string>| string;
  line?: string;
  post?: Array<string> | string;
  getLineNumber?: () => number
}
interface serializedFrame {
    classes?: string
    file: string,
    filePath: string,
    method: string,
    line: number,
    column: number,
    context: frameContext,
    isModule: boolean,
    isNative: boolean,
    isApp: boolean
}
interface serializedData {
  request?: object
  links?: string[]
  loadFA?: boolean
  message: string;
  name: string;
  status: any;
  frames: serializedFrame[];
}
interface youchError extends Error {
  status?: number;
}

const viewTemplate = fs.readFileSync(path.join(__dirname, VIEW_PATH), 'utf-8')

export default class Youch {
  public codeContext: number
  public _filterHeaders: string[]
  public error: youchError
  public request: IncomingMessage
  public links: ((data: serializedData)=>string)[]
  constructor (error: youchError, request: IncomingMessage) {
    this.codeContext = 5
    this._filterHeaders = ['cookie', 'connection']
    this.error = error
    this.request = request
  }

  /**
   * Returns the source code for a given file. It unable to
   * read file it resolves the promise with a null.
   *
   * @param  {Object} frame
   * @return {Promise}
   */
  _getFrameSource (frame: youchStackFrame): Promise<object> {
    const path = frame
      .getFileName()
      .replace(/dist\/webpack:\//g, '') // unix
      .replace(/dist\\webpack:\\/g, '') // windows

    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf-8', (error, contents) => {
        if (error) {
          resolve(null)
          return
        }

        const lines = contents.split(/\r?\n/)
        const lineNumber = frame.getLineNumber()

        resolve({
          pre: lines.slice(
            Math.max(0, lineNumber - (this.codeContext + 1)),
            lineNumber - 1
          ),
          line: lines[lineNumber - 1],
          post: lines.slice(lineNumber, lineNumber + this.codeContext)
        })
      })
    })
  }

  /**
   * Parses the error stack and returns serialized
   * frames out of it.
   *
   * @return {Object}
   */
   _parseError (): Promise<youchStackFrame[]>|youchStackFrame {
    return new Promise((resolve, reject) => {
      const stack: youchStackFrame[] = stackTrace.parse(this.error)
      Promise.all(
        stack.map(async (frame) => {
          if (this._isNode(frame)) {
            return Promise.resolve(frame)
          }
          return this._getFrameSource(frame).then((context) => {

            frame.context = context
            return frame
          })
        })
      )
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Returns the context with code for a given
   * frame.
   *
   * @param  {Object}
   * @return {Object}
   */
   _getContext (frame: youchStackFrame): frameContext {
    if (!frame.context) {
      return {}
    }
    return {
      start: frame.getLineNumber() - (frame.context.pre || []).length,
      pre: (<string[]>frame.context.pre).join('\n'),
      line: frame.context.line,
      post: (<string[]>frame.context.post).join('\n')
    }
  }

  /**
   * Returns classes to be used inside HTML when
   * displaying the frames list.
   *
   * @param  {Object}
   * @param  {Number}
   *
   * @return {String}
   */
   _getDisplayClasses (frame: serializedFrame, index: number): string {
    const classes = []
    if (index === 0) {
      classes.push('active')
    }

    if (!frame.isApp) {
      classes.push('native-frame')
    }

    return classes.join(' ')
  }

  /**
   * Compiles the view using HTML
   *
   * @param  {String}
   * @param  {Object}
   *
   * @return {String}
   */
   _compileView (view: string, data: any): string {
    return Mustache.render(view, data)
  }

  /**
   * Serializes frame to a usable error object.
   *
   * @param  {Object}
   *
   * @return {Object}
   */
   _serializeFrame (frame: youchStackFrame): serializedFrame {
    const relativeFileName =
      frame.getFileName().indexOf(process.cwd()) > -1
        ? frame
          .getFileName()
          .replace(process.cwd(), '')
          .replace(startingSlashRegex, '')
        : frame.getFileName()

    return {
      file: relativeFileName,
      filePath: frame.getFileName(),
      method: frame.getFunctionName(),
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
      context: this._getContext(frame),
      isModule: this._isNodeModule(frame),
      isNative: this._isNode(frame),
      isApp: this._isApp(frame)
    }
  }

  /**
   * Returns whether frame belongs to nodejs
   * or not.
   *
   * @return {Boolean} [description]
   */
   _isNode (frame: youchStackFrame): boolean {
    if (frame.isNative()) {
      return true
    }

    const filename = frame.getFileName() || ''
    return !path.isAbsolute(filename) && filename[0] !== '.'
  }

  /**
   * Returns whether code belongs to the app
   * or not.
   *
   * @return {Boolean} [description]
   */
   _isApp (frame: youchStackFrame):boolean {
    return !this._isNode(frame) && !this._isNodeModule(frame)
  }

  /**
   * Returns whether frame belongs to a node_module or
   * not
   *
   * @method _isNodeModule
   *
   * @param  {Object}      frame
   *
   * @return {Boolean}
   *
   * @private
   */
  private _isNodeModule (frame: youchStackFrame): boolean {
    return (frame.getFileName() || '').indexOf('node_modules' + path.sep) > -1
  }

  /**
   * Serializes stack to Mustache friendly object to
   * be used within the view. Optionally can pass
   * a callback to customize the frames output.
   *
   * @param  {Object}
   * @param  {Function} [callback]
   *
   * @return {Object}
   */
   _serializeData (stack: youchStackFrame[], callback?: (frame: youchStackFrame, index: number) => serializedFrame): serializedData {
    callback = callback || this._serializeFrame.bind(this)
    return {
      message: this.error.message,
      name: this.error.name,
      status: this.error.status,
      frames:
        stack instanceof Array === true
          ? stack.filter((frame) => frame.getFileName()).map(callback)
          : []
    }
  }

  /**
   * Returns a serialized object with important
   * information.
   *
   * @return {Object}
   */
   _serializeRequest (): object {
    const headers = []

    Object.keys(this.request.headers).forEach((key) => {
      if (this._filterHeaders.indexOf(key) > -1) {
        return
      }
      headers.push({
        key: key.toUpperCase(),
        value: this.request.headers[key]
      })
    })

    const parsedCookies = cookie.parse(this.request.headers.cookie || '')
    const cookies = Object.keys(parsedCookies).map((key) => {
      return { key, value: parsedCookies[key] }
    })

    return {
      url: this.request.url,
      httpVersion: this.request.httpVersion,
      method: this.request.method,
      connection: this.request.headers.connection,
      headers: headers,
      cookies: cookies
    }
  }

  /**
   * Stores the link `callback` which
   * will be processed when rendering
   * the HTML view.
   *
   * @param {Function} callback
   *
   * @returns {Object}
   */
  public addLink (callback: Function): object {
    if (typeof callback === 'function') {
      this.links.push(<((data:serializedData)=>string)> callback)
      return this
    }

    throw new Error('Pass a callback function to "addLink"')
  }

  /**
   * Returns error stack as JSON.
   *
   * @return {Promise}
   */
  public toJSON (): Promise<{error: serializedData}> {
    return new Promise((resolve, reject) => {
      (<Promise<youchStackFrame[]>>this._parseError())
        .then((stack) => {
          resolve({
            error: this._serializeData(stack)
          })
        })
        .catch(reject)
    })
  }

  /**
   * Returns HTML representation of the error stack
   * by parsing the stack into frames and getting
   * important info out of it.
   *
   * @return {Promise}
   */
  public toHTML (): Promise<string> {
    return new Promise((resolve, reject) => {
      (<Promise<youchStackFrame[]>>this._parseError())
        .then((stack) => {
          const data = this._serializeData(stack, (frame, index) => {
            const serializedFrame = this._serializeFrame(frame)
            serializedFrame.classes = this._getDisplayClasses(
              serializedFrame,
              index
            )
            return serializedFrame
          })

          const request = this._serializeRequest()

          data.request = request
          data.links = (<((data:serializedData)=>string)[]>this.links).map((renderLink) => renderLink(data))
          data.loadFA = !!data.links.find((link) => link.includes('fa-'))

          return resolve(this._compileView(viewTemplate, data))
        })
        .catch(reject)
    })
  }
}
