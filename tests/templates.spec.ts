/*
 * youch
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { JSDOM } from 'jsdom'
import { test } from '@japa/runner'
import { ErrorParser } from 'youch-core'
import type { ParsedError } from 'youch-core/types'

import { Metadata } from '../src/metadata.js'
import { Templates } from '../src/templates.js'
import { BaseComponent } from '../src/component.js'

test.group('Templates', () => {
  test('render error to HTML', async ({ expect }) => {
    const templates = new Templates(true)
    const html = await templates.toHTML({
      title: 'Internal Server Error',
      metadata: new Metadata(),
      error: await new ErrorParser().parse(new Error('Something went wrong')),
    })

    const { window } = new JSDOM(html)

    expect(window.document.querySelector('title')?.textContent).toEqual('Internal Server Error')
    expect(window.document.querySelector('#error-message')?.textContent?.trim()).toEqual(
      'Something went wrong'
    )
    expect(window.document.querySelector('#event-handlers-script')?.textContent?.trim()).toEqual(
      'document.getElementById("toggle-theme-checkbox").addEventListener("change",function(){toggleTheme(this)});document.getElementById("formatted-frames").addEventListener("click",function(){showFormattedFrames(this)});document.getElementById("raw-frames").addEventListener("click",function(){showRawFrames(this)});document.getElementById("stack-frame-toggle-indicator-0").addEventListener("click",function(event){toggleFrameSource(event,\'frame-1\')});document.getElementById("stack-frame-location-1").addEventListener("click",function(event){toggleFrameSource(event,\'frame-1\')});'
    )
    expect(window.document.querySelector('#error-hint')).toEqual(null)
  })

  test('display error hint', async ({ expect }) => {
    const error = new Error('Something went wrong')
    ;(error as any).hint = 'This is a dummy hint message'

    const templates = new Templates(true)
    const html = await templates.toHTML({
      title: 'Internal Server Error',
      metadata: new Metadata(),
      error: await new ErrorParser().parse(error),
    })

    const { window } = new JSDOM(html)

    expect(window.document.querySelector('#error-hint')?.textContent?.trim()).toEqual(
      'This is a dummy hint message'
    )
  })

  test('print stack trace source', async ({ expect }) => {
    const error = new Error('Something went wrong')

    const templates = new Templates(true)
    const html = await templates.toHTML({
      title: 'Internal Server Error',
      metadata: new Metadata(),
      error: await new ErrorParser().parse(error),
    })

    const { window } = new JSDOM(html)
    expect(
      window.document.querySelector('.stack-frame-app .stack-frame-source')?.textContent?.trim()
    ).toContain(`const error = new Error('Something went wrong')`)
  })

  test('print error cause', async ({ expect }) => {
    const error = new Error('Something went wrong', {
      cause: 'Another error',
    })

    const templates = new Templates(true)
    const html = await templates.toHTML({
      title: 'Internal Server Error',
      metadata: new Metadata(),
      error: await new ErrorParser().parse(error),
    })

    const { window } = new JSDOM(html)
    expect(window.document.querySelector('#error-cause')).not.toBe(null)
  })

  test('inject custom styles after rest of the styles', async ({ expect }) => {
    const error = new Error('Something went wrong', {
      cause: 'Another error',
    })

    const templates = new Templates(true)
    templates.injectStyles('body { color: #fff; }')

    const html = await templates.toHTML({
      title: 'Internal Server Error',
      metadata: new Metadata(),
      error: await new ErrorParser().parse(error),
    })

    const { window } = new JSDOM(html)
    const styleTags = window.document.querySelectorAll('style')
    const lastStyleTag = Array.from(styleTags.values())[styleTags.length - 1]
    expect(lastStyleTag.getAttribute('id')).toEqual('injected-styles')
  })

  test('inject custom styles multiple times', async ({ expect }) => {
    const error = new Error('Something went wrong', {
      cause: 'Another error',
    })

    const templates = new Templates(true)
    templates.injectStyles('body { color: #fff; }')
    templates.injectStyles('body { background: #000; }')

    const html = await templates.toHTML({
      title: 'Internal Server Error',
      metadata: new Metadata(),
      error: await new ErrorParser().parse(error),
    })

    const { window } = new JSDOM(html)
    const styleTags = window.document.querySelectorAll('style')
    const lastStyleTag = Array.from(styleTags.values())[styleTags.length - 1]
    expect(lastStyleTag.textContent?.trim()).toEqual(
      `body { color: #fff; }\nbody { background: #000; }`
    )
  })

  test('use a custom component for a given template', async ({ expect }) => {
    class CustomErrorInfo extends BaseComponent<{
      title: string
      error: ParsedError
    }> {
      async toHTML(props: CustomErrorInfo['$props']) {
        return `<h1 id="custom-error-message">${props.error.message}</h1>`
      }
      async toANSI() {
        return ''
      }
    }

    const error = new Error('Something went wrong', {
      cause: 'Another error',
    })

    const templates = new Templates(true)
    templates.use('errorInfo', new CustomErrorInfo(templates.devMode))

    const html = await templates.toHTML({
      title: 'Internal Server Error',
      metadata: new Metadata(),
      error: await new ErrorParser().parse(error),
    })

    const { window } = new JSDOM(html)

    /**
     * Since we are overriding the existing component, we do not expect
     * its styles to be defined within the output HTML
     */
    expect(window.document.querySelector('#errorInfo-styles')).toEqual(null)
    expect(window.document.querySelector('#custom-error-message')?.textContent?.trim()).toEqual(
      'Something went wrong'
    )
  })
})
