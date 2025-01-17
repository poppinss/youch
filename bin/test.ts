import { expect } from '@japa/expect'
import { assert } from '@japa/assert'
import { fileSystem } from '@japa/file-system'
import { expectTypeOf } from '@japa/expect-type'
import { snapshot } from '@japa/snapshot'
import { configure, processCLIArgs, run } from '@japa/runner'

processCLIArgs(process.argv.splice(2))
configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [expect(), assert(), fileSystem(), expectTypeOf(), snapshot()],
})

run()
