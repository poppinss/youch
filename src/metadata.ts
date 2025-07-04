/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type ErrorMetadataGroups, type ErrorMetadataRow } from './types.js'

/**
 * Attach metadata to the parsed error as groups, sections
 * and rows.
 *
 * - Groups are rendered as cards
 * - Sections are headings within the cards
 * - And rows are rendered within HTML tables.
 *
 * The primitive row values are rendered as it is and rich data-types
 * like Objects, Arrays, Maps are printed using dumper.
 */
export class Metadata {
  #groups: ErrorMetadataGroups = {}

  /**
   * Converts value to an array (if not an array already)
   */
  #toArray(value: ErrorMetadataRow | ErrorMetadataRow[]): ErrorMetadataRow[] {
    return Array.isArray(value) ? value : [value]
  }

  /**
   * Define a group, its sections and their rows. In case of
   * existing groups/sections, the new data will be merged
   * with the existing data
   */
  group(
    name: string,
    sections: {
      [section: string]: ErrorMetadataRow | ErrorMetadataRow[]
    }
  ): this {
    this.#groups[name] = this.#groups[name] ?? {}
    Object.keys(sections).forEach((section) => {
      if (!this.#groups[name][section]) {
        this.#groups[name][section] = sections[section]
      } else {
        this.#groups[name][section] = this.#toArray(this.#groups[name][section])
        this.#groups[name][section].push(...this.#toArray(sections[section]))
      }
    })

    return this
  }

  /**
   * Returns the existing metadata groups, sections and
   * rows.
   */
  toJSON(): ErrorMetadataGroups {
    return this.#groups
  }
}
