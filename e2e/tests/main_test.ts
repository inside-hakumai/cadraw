Feature('Web版')

Scenario('直線を引く', async ({ I }) => {
  I.amOnPage('/')

  I.click('直線')

  // 一度クリックすると、その地点に直線の始点を表す点が描画されるはず
  await I.clickCoord(55, 105)
  await I.seeAttributesOnSvgElements('//body//*[@id="renderer"]/*[name()="circle"]', {
    cx: '55',
    cy: '105',
    r: '2',
    fill: 'blue',
  })

  // カーソルを移動させると、始点からカーソルの移動先まで直線が描画されるはず
  await I.moveTo(155, 122)
  await I.seeAttributesOnSvgElements('//body//*[@id="renderer"]/*[name()="line"]', {
    x1: '55',
    y1: '105',
    x2: '155',
    y2: '122',
    stroke: 'grey',
    'stroke-width': '1',
  })

  // 再度クリックすると、始点の点は消え、始点からその地点まで直線が描画されるはず
  await I.clickCoord(155, 122)
  I.dontSeeElement('//body//*[@id="renderer"]/*[name()="circle"]')
  await I.seeAttributesOnSvgElements('//body//*[@id="renderer"]/*[name()="line"]', {
    x1: '55',
    y1: '105',
    x2: '155',
    y2: '122',
    stroke: '#000000',
    'stroke-width': '1',
  })
})
