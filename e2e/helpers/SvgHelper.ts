import Helper from '@codeceptjs/helper'
import { Page } from 'playwright-core'
import assert from 'assert'

class SvgHelper extends Helper {
  // before/after hooks
  /**
   * @protected
   */
  _before() {
    // remove if not used
  }

  /**
   * @protected
   */
  _after() {
    // remove if not used
  }

  // add custom methods here
  // If you need to access other helpers
  // use: this.helpers['helperName']

  /**
   * bodyタグ上の任意の座標をクリックするためのヘルパー関数です。
   * @param x bodyタグ左上を原点とするx座標
   * @param y bodyタグ左上を原点とするy座標
   */
  async clickCoord(x: number, y: number) {
    const page: Page = this.helpers.Playwright.page

    await page.click('body', {
      position: { x, y },
    })
  }

  /**
   * ページの左上を原点とする座標を指定してその位置にカーソルを移動させます。
   * @param x x座標
   * @param y y座標
   */
  async moveTo(x: number, y: number) {
    const page: Page = this.helpers.Playwright.page
    await page.mouse.move(x, y)
  }

  /**
   * 与えられたlocatorで特定される要素が持つ属性が期待したものであるかどうかを確認します。
   * codeceptjsのseeAttributesOnElements()と似ていますが、codeceptjsのものは
   * svgタグおよびその内部の要素に対して機能しないため、代わりにこれを使用します。
   * @param selector 要素を特性するlocator
   * @param attributes 期待する属性名と値の組
   */
  async seeAttributesOnSvgElements(selector: string, attributes: { [key: string]: string }) {
    const page: Page = this.helpers.Playwright.page

    for (const [attributeName, expected] of Object.entries(attributes)) {
      const actual = await page.getAttribute(selector, attributeName)
      assert.equal(
        actual,
        expected,
        `Attribute "${attributeName}" expects value ${expected} but is given ${actual}`
      )
    }
  }
}

export = SvgHelper
