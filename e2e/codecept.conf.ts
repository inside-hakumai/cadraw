import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure'
import fetch from 'node-fetch'
import { setTimeout } from 'timers/promises'

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS)

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins()

export const config: CodeceptJS.MainConfig = {
  tests: './tests/*_test.ts',
  output: './output',
  helpers: {
    Playwright: {
      url: 'http://localhost:3000',
      show: true,
      browser: 'chromium',
    },
  },
  include: {},
  name: 'cadraw',
  translation: 'ja-JP',
  bootstrap: async () => {
    let retryCount = 0

    do {
      try {
        const response = await fetch('http://localhost:3000')
        if (response.status === 200) {
          break
        }
      } catch (e) {
        retryCount += 1
      }
      await setTimeout(3000)
    } while (retryCount < 5)

    if (retryCount >= 5) {
      throw new Error('Failed to confirm that the web server is accessible')
    }
  },
}
