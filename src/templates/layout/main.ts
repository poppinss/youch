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
import type { LayoutProps } from '../../types.js'

/**
 * Layout component renders the HTML structure for the document
 * along with the styles for the global elements.
 *
 * You can define a custom Layout if you want to modify the HTML
 * structure or the CSS variables for the colors.
 */
export class Layout extends BaseComponent<LayoutProps> {
  cssFile = new URL('./layout/style.css', publicDirURL)
  scriptFile = new URL('./layout/script.js', publicDirURL)

  /**
   * The toHTML method is used to output the HTML for the
   * web view
   */
  async toHTML(props: LayoutProps): Promise<string> {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${props.title}</title>
        <!-- STYLES -->
        <!-- GLOBAL SCRIPT -->
      </head>
      <body>
        <div id="layout">
          ${await props.children()}
        </div>
        <!-- SCRIPTS -->
      </body>
    </html>`
  }

  /**
   * The toANSI method is used to output the text for the console
   */
  async toANSI(props: LayoutProps) {
    return `\n${await props.children()}\n`
  }
}
