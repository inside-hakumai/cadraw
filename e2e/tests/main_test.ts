Feature('Web版')

Scenario('ページを開く', ({ I }) => {
  I.amOnPage('/')
  I.wait(10)
})
