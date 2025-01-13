/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readFile } from 'node:fs/promises'

/**
 * BaseComponent that must be used to create custom components.
 * It has support for loading CSS files and frontend scripts.
 */
export abstract class BaseComponent<Props = undefined> {
  declare $props: Props
  #cachedStyles?: string
  #cachedScript?: string

  /**
   * A flag to know if we are in dev mode or not. In dev mode,
   * the styles and scripts are refetched from the disk.
   * Otherwise they are cached.
   */
  #inDevMode: boolean

  /**
   * Absolute path to the frontend JavaScript that should be
   * injected within the HTML head. The JavaScript does not
   * get transpiled, hence it should work cross browser by
   * default.
   */
  scriptFile?: string | URL

  /**
   * Absolute path to the CSS file that should be injected
   * within the HTML head.
   */
  cssFile?: string | URL

  constructor(devMode: boolean) {
    this.#inDevMode = devMode
  }

  /**
   * Returns the styles for the component. The null value
   * is not returned if no styles are associated with
   * the component
   */
  async getStyles(): Promise<string | null> {
    if (!this.cssFile) {
      return null
    }

    if (this.#inDevMode) {
      return await readFile(this.cssFile, 'utf-8')
    }

    this.#cachedStyles = this.#cachedStyles ?? (await readFile(this.cssFile, 'utf-8'))
    return this.#cachedStyles
  }

  /**
   * Returns the frontend script for the component. The null
   * value is not returned if no styles are associated
   * with the component
   */
  async getScript(): Promise<string | null> {
    if (!this.scriptFile) {
      return null
    }

    if (this.#inDevMode) {
      return await readFile(this.scriptFile, 'utf-8')
    }

    this.#cachedScript = this.#cachedScript ?? (await readFile(this.scriptFile, 'utf-8'))
    return this.#cachedScript
  }

  /**
   * The toHTML method is used to output the HTML for the
   * web view
   */
  abstract toHTML(props: Props): Promise<string>

  /**
   * The toANSI method is used to output the text for the console
   */
  abstract toANSI(props: Props): Promise<string>
}
