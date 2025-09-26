/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ParsedError } from 'youch-core/types'
import { createScript, createStyleSheet } from '@poppinss/dumper/html'

import { type Metadata } from './metadata.js'
import type { YouchTemplates } from './types.js'
import { type BaseComponent } from './component.js'
import { Header } from './templates/header/main.js'
import { Layout } from './templates/layout/main.js'
import { ErrorInfo } from './templates/error_info/main.js'
import { ErrorCause } from './templates/error_cause/main.js'
import { ErrorStack } from './templates/error_stack/main.js'
import { ErrorMetadata } from './templates/error_metadata/main.js'
import { ErrorStackSource } from './templates/error_stack_source/main.js'

/**
 * A super lightweight templates collection that allows composing
 * HTML using TypeScript based components with the ability to
 * override the component for a pre-defined template.
 *
 * @example
 * ```ts
 * const templates = new Templates()
 * const html = templates.render(
 *   {
 *     title: 'Internal server error',
 *     error: await new ErrorParser().parse(error)
 *   }
 * )
 *
 * // Override a template
 * class MyHeader extends BaseComponent {
 *   async render() {}
 * }
 *
 * templates.use('header', new MyHeader(templates.devMode))
 * ```
 */
export class Templates {
  #knownTemplates: YouchTemplates
  #styles: Map<string, string> = new Map([['global', createStyleSheet()]])
  #scripts: Map<string, string> = new Map([['global', createScript()]])

  constructor(public devMode: boolean) {
    this.#knownTemplates = {
      layout: new Layout(devMode),
      header: new Header(devMode),
      errorInfo: new ErrorInfo(devMode),
      errorStack: new ErrorStack(devMode),
      errorStackSource: new ErrorStackSource(devMode),
      errorCause: new ErrorCause(devMode),
      errorMetadata: new ErrorMetadata(devMode),
    }
  }

  /**
   * Returns a collection of style and script tags to dump
   * inside the document HEAD.
   */
  #getStylesAndScripts(cspNonce?: string) {
    /**
     * Keeping custom injected styles separate from the rest of
     * the styles and scripts, so that we can append them at
     * the end
     */
    let customInjectedStyles: string = ''
    let globalScript: string = ''
    const styles: string[] = []
    const scripts: string[] = []
    const cspNonceAttr = cspNonce ? ` nonce="${cspNonce}"` : ''

    this.#styles.forEach((bucket, name) => {
      if (name === 'injected') {
        customInjectedStyles = `<style id="${name}-styles"${cspNonceAttr}>${bucket}</style>`
      } else {
        styles.push(`<style id="${name}-styles"${cspNonceAttr}>${bucket}</style>`)
      }
    })
    this.#scripts.forEach((bucket, name) => {
      if (name === 'global') {
        globalScript = `<script id="${name}-script"${cspNonceAttr}>${bucket}</script>`
      }

      scripts.push(`<script id="${name}-script"${cspNonceAttr}>${bucket}</script>`)
    })

    return {
      styles: `${styles.join('\n')}\n${customInjectedStyles}`,
      scripts: scripts.join('\n'),
      globalScript,
    }
  }

  /**
   * Collects styles and scripts for components as we render
   * them.
   */
  async #collectStylesAndScripts(templateName: keyof YouchTemplates) {
    /**
     * Collect styles only once for a given template
     */
    if (!this.#styles.has(templateName)) {
      const styles = await this.#knownTemplates[templateName].getStyles()
      if (styles) {
        this.#styles.set(templateName, styles)
      }
    }

    /**
     * Collect script only once for a given template
     */
    if (!this.#scripts.has(templateName)) {
      const script = await this.#knownTemplates[templateName].getScript()
      if (script) {
        this.#scripts.set(templateName, script)
      }
    }
  }

  /**
   * Returns the HTML for a given template
   */
  async #tmplToHTML<K extends keyof YouchTemplates>(
    templateName: K,
    props: YouchTemplates[K]['$props']
  ): Promise<string> {
    const component: BaseComponent<any> = this.#knownTemplates[templateName]
    if (!component) {
      throw new Error(`Invalid template "${templateName}"`)
    }

    await this.#collectStylesAndScripts(templateName)
    return component.toHTML(props)
  }

  /**
   * Returns the ANSI output for a given template
   */
  async #tmplToANSI<K extends keyof YouchTemplates>(
    templateName: K,
    props: YouchTemplates[K]['$props']
  ): Promise<string> {
    const component: BaseComponent<any> = this.#knownTemplates[templateName]
    if (!component) {
      throw new Error(`Invalid template "${templateName}"`)
    }
    return component.toANSI(props)
  }

  /**
   * Define a custom component to be used in place of the default component.
   * Overriding components allows you control the HTML layout, styles and
   * the frontend scripts of an HTML fragment.
   */
  use<K extends keyof YouchTemplates>(templateName: K, component: YouchTemplates[K]): this {
    this.#knownTemplates[templateName] = component
    return this
  }

  /**
   * Inject custom styles to the document. Injected styles are
   * always placed after the global and the components style
   * tags.
   */
  injectStyles(cssFragment: string): this {
    let injectedStyles = this.#styles.get('injected') ?? ''
    injectedStyles += `\n${cssFragment}`
    this.#styles.set('injected', injectedStyles)
    return this
  }

  /**
   * Returns the HTML output for the given parsed error
   */
  async toHTML(props: {
    title: string
    ide?: string
    cspNonce?: string
    error: ParsedError
    metadata: Metadata
  }) {
    const html = await this.#tmplToHTML('layout', {
      title: props.title,
      ide: props.ide,
      cspNonce: props.cspNonce,
      children: async () => {
        const header = await this.#tmplToHTML('header', props)
        const info = await this.#tmplToHTML('errorInfo', props)
        const stackTrace = await this.#tmplToHTML('errorStack', {
          ide: process.env.EDITOR ?? 'vscode',
          sourceCodeRenderer: (error, frame) => {
            return this.#tmplToHTML('errorStackSource', {
              error,
              frame,
              ide: props.ide,
              cspNonce: props.cspNonce,
            })
          },
          ...props,
        })
        const cause = await this.#tmplToHTML('errorCause', props)
        const metadata = await this.#tmplToHTML('errorMetadata', props)

        return `${header}${info}${stackTrace}${cause}${metadata}`
      },
    })

    const { globalScript, scripts, styles } = this.#getStylesAndScripts(props.cspNonce)
    return html
      .replace('<!-- STYLES -->', styles)
      .replace('<!-- SCRIPTS -->', scripts)
      .replace('<!-- GLOBAL SCRIPT -->', globalScript)
  }

  /**
   * Returns the ANSI output to be printed on the terminal
   */
  async toANSI(props: { title: string; error: ParsedError; metadata: Metadata }) {
    const ansiOutput = await this.#tmplToANSI('layout', {
      title: props.title,
      children: async () => {
        const header = await this.#tmplToANSI('header', {})
        const info = await this.#tmplToANSI('errorInfo', props)
        const stackTrace = await this.#tmplToANSI('errorStack', {
          ide: process.env.EDITOR ?? 'vscode',
          sourceCodeRenderer: (error, frame) => {
            return this.#tmplToANSI('errorStackSource', {
              error,
              frame,
            })
          },
          ...props,
        })
        const cause = await this.#tmplToANSI('errorCause', props)
        const metadata = await this.#tmplToANSI('errorMetadata', props)
        return `${header}${info}${stackTrace}${cause}${metadata}`
      },
    })

    return ansiOutput
  }
}
