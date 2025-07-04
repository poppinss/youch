/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cookie from 'cookie'
import { ErrorParser } from 'youch-core'
import type { Parser, SourceLoader, Transformer, YouchParserOptions } from 'youch-core/types'

import { Metadata } from './metadata.js'
import { Templates } from './templates.js'
import { type YouchANSIOptions, type YouchHTMLOptions, type YouchJSONOptions } from './types.js'

/**
 * Youch exposes the API to render errors to HTML output
 */
export class Youch {
  /**
   * Properties to be shared with the Error parser
   */
  #sourceLoader?: SourceLoader
  #parsers: Parser[] = []
  #transformers: Transformer[] = []

  /**
   * Manage templates used for converting error to the HTML
   * output
   */
  templates = new Templates(false)

  /**
   * Define metadata to be displayed alongside the error output
   */
  metadata = new Metadata()

  /**
   * Creates an instance of the ErrorParser and applies the
   * source loader, parsers and transformers on it
   */
  #createErrorParser(options: YouchParserOptions) {
    const errorParser = new ErrorParser(options)
    if (this.#sourceLoader) {
      errorParser.defineSourceLoader(this.#sourceLoader)
    }
    this.#parsers.forEach((parser) => errorParser.useParser(parser))
    this.#transformers.forEach((transformer) => errorParser.useTransformer(transformer))

    return errorParser
  }

  /**
   * Defines the request properties as a metadata group
   */
  #defineRequestMetadataGroup(request: YouchHTMLOptions['request']) {
    if (!request || Object.keys(request).length === 0) {
      return
    }

    this.metadata.group('Request', {
      ...(request.url
        ? {
            url: {
              key: 'URL',
              value: request.url,
            },
          }
        : {}),
      ...(request.method
        ? {
            method: {
              key: 'Method',
              value: request.method,
            },
          }
        : {}),
      ...(request.headers
        ? {
            headers: Object.keys(request.headers).map((key) => {
              const value = request.headers![key]
              return {
                key,
                value: key === 'cookie' ? { ...cookie.parse(value as string) } : value,
              }
            }),
          }
        : {}),
    })
  }

  /**
   * Define custom implementation for loading the source code
   * of a stack frame.
   */
  defineSourceLoader(loader: SourceLoader): this {
    this.#sourceLoader = loader
    return this
  }

  /**
   * Define a custom parser. Parsers are executed before the
   * error gets parsed and provides you with an option to
   * modify the error
   */
  useParser(parser: Parser): this {
    this.#parsers.push(parser)
    return this
  }

  /**
   * Define a custom transformer. Transformers are executed
   * after the error has been parsed and can mutate the
   * properties of the parsed error.
   */
  useTransformer(transformer: Transformer): this {
    this.#transformers.push(transformer)
    return this
  }

  /**
   * Parses error to JSON
   */
  async toJSON(error: unknown, options?: YouchJSONOptions) {
    options = { ...options }
    return this.#createErrorParser({ offset: options.offset }).parse(error)
  }

  /**
   * Render error to HTML
   */
  async toHTML(error: unknown, options?: YouchHTMLOptions) {
    options = { ...options }

    this.#defineRequestMetadataGroup(options.request)

    const parsedError = await this.#createErrorParser({ offset: options.offset }).parse(error)
    return this.templates.toHTML({
      title: options.title ?? 'An error has occurred',
      ide: options.ide ?? process.env.IDE ?? 'vscode',
      cspNonce: options.cspNonce,
      error: parsedError,
      metadata: this.metadata,
    })
  }

  /**
   * Render error to ANSI output
   */
  async toANSI(error: unknown, options?: YouchANSIOptions) {
    options = { ...options }
    const parsedError = await this.#createErrorParser({ offset: options.offset }).parse(error)

    return this.templates.toANSI({
      title: '',
      error: parsedError,
      metadata: this.metadata,
    })
  }
}
