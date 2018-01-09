'use strict'

const concat = require('concat')
const UglifyJS = require('uglify-js')
const fs = require('fs')
const path = require('path')

const INPUT = path.join(__dirname, '..', 'static')
const OUTPUT = path.join(__dirname, '..', 'src')

/**
 * Absolute path to a static file
 *
 * @method absPath
 *
 * @param  {String} file
 *
 * @return {String}
 */
function absPath (file) {
  return path.join(INPUT, file)
}

/**
 * Js files to concat and uglify. Define them in correct order
 *
 * @type {Array}
 */
const jsFiles = [
  'zepto.js',
  'prism.js',
  'app.js'
].map(absPath)

/**
 * Css files to compile and uglify.
 *
 * @type {Array}
 */
const cssFiles = [
  'prism.css',
  'magic-checkbox.css',
  'app.css'
].map(absPath)

/**
 * Base template source. Must be mustache template
 */
let templateSource = fs.readFileSync(absPath('error.mustache'), 'utf-8')

/**
 * Bundling js files by concatenating them and then
 * uglifying them.
 *
 * @method bundleJsFiles
 *
 * @return {Promise<String>}
 */
function bundleJsFiles () {
  return concat(jsFiles)
  .then((output) => {
    const uglified = UglifyJS.minify(output)
    if (uglified.error) {
      throw new Error(uglified.error)
    }
    return uglified.code
  })
}

/**
 * Bundle css files by concatenating them and minifying them
 * via css nano.
 *
 * @method bundleCssFiles
 *
 * @return {Promise<String>}
 */
function bundleCssFiles () {
  return concat(cssFiles)
}

(async function () {
  const js = await bundleJsFiles()
  const css = await bundleCssFiles()
  templateSource = templateSource.replace(/\[\[__js__\]\]/, () => js)
  templateSource = templateSource.replace(/\[\[__css__\]\]/, css)
  fs.writeFileSync(path.join(OUTPUT, 'error.compiled.mustache'), templateSource)
})().then(() => {
  console.log('Bundle created')
  process.exit(0)
}).catch((error) => {
  console.log('Unable to bundle files, due to following error')
  console.log(error)
  process.exit(1)
})
