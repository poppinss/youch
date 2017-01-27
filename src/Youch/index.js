'use strict'

/*
 * youch
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Mustache = require('mustache')
const path = require('path')
const fs = require('fs')
const VIEW_PATH = '../resources/error.mustache'

const viewTemplate = fs.readFileSync(path.join(__dirname, VIEW_PATH), 'utf-8')

class Youch {
  constructor (error, request) {
    const options = {
      context: 5
    }

    this._filterHeaders = ['cookie', 'connection']
    this.stackman = require('stackman')(options)
    this.error = error
    this.request = request
  }

  /**
   * Parses the error stack and returns serialized
   * frames out of it.
   *
   * @return {Object}
   */
  _parseError () {
    return new Promise((resolve) => {
      this.stackman(this.error, (stack) => {
        resolve(stack)
      })
    })
  }

  /**
   * Returns the context with code for a given
   * frame.
   *
   * @param  {Object}
   * @return {Object}
   */
  _getContext (frame) {
    if (!frame.context) {
      return {}
    }

    return {
      start: frame.getLineNumber() - (frame.context.pre || []).length,
      pre: frame.context.pre.join('\n'),
      line: frame.context.line,
      post: frame.context.post.join('\n')
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
  _getDisplayClasses (frame, index) {
    const classes = []
    if (index === 0) {
      classes.push('active')
    }

    if (!frame.isApp()) {
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
  _complieView (view, data) {
    return Mustache.render(view, data)
  }

  /**
   * Serializes frame to a usable error object.
   *
   * @param  {Object}
   *
   * @return {Object}
   */
  _serializeFrame (frame) {
    return {
      file: frame.getRelativeFileName(),
      method: frame.getFunctionNameSanitized(),
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
      context: this._getContext(frame)
    }
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
  _serializeData (stack, callback) {
    callback = callback || this._serializeFrame.bind(this)
    return {
      message: this.error.message,
      name: this.error.name,
      status: this.error.status,
      frames: stack.frames instanceof Array === true ? stack.frames.map(callback) : []
    }
  }

  /**
   * Returns a serialized object with important
   * information.
   *
   * @return {Object}
   */
  _serializeRequest () {
    const headers = []
    const headerCookies = (this.request.headers.cookie || '').split(/;\s/)

    Object.keys(this.request.headers).forEach((key) => {
      if (this._filterHeaders.indexOf(key) > -1) {
        return
      }
      headers.push({
        key: key.toUpperCase(),
        value: this.request.headers[key]
      })
    })

    const cookies = Object.keys(headerCookies).map((cookie) => {
      const [key, value] = headerCookies[cookie].split(/=(.*)/)
      return {key, value}
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
   * Returns error stack as JSON.
   *
   * @return {Promise}
   */
  toJSON () {
    return new Promise((resolve, reject) => {
      this
      ._parseError()
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
  toHTML () {
    return new Promise((resolve, reject) => {
      this
      ._parseError()
      .then((stack) => {
        const data = this._serializeData(stack, (frame, index) => {
          const serializedFrame = this._serializeFrame(frame)
          serializedFrame.classes = this._getDisplayClasses(frame, index)
          return serializedFrame
        })

        const request = this._serializeRequest()
        data.request = request
        resolve(this._complieView(viewTemplate, data))
      })
      .catch(reject)
    })
  }
}

module.exports = Youch
