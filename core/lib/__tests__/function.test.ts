import { calcCentralAngleFromHorizontalLine } from '../function'

describe('calcCentralAngleFromHorizontalLine()', () => {
  const cases: [Coordinate, number][] = [
    [{ x: 1, y: 0 }, 0],
    [{ x: 0.86602540378, y: -0.5 }, 30],
    [{ x: 0.70710678118, y: -0.70710678118 }, 45],
    [{ x: 0.5, y: -0.86602540378 }, 60],
    [{ x: 0, y: -1 }, 90],
    [{ x: -0.5, y: -0.86602540378 }, 120],
    [{ x: -0.70710678118, y: -0.70710678118 }, 135],
    [{ x: -0.86602540378, y: -0.5 }, 150],
    [{ x: -1, y: 0 }, 180],
    [{ x: -0.86602540378, y: 0.5 }, 210],
    [{ x: -0.70710678118, y: 0.70710678118 }, 225],
    [{ x: -0.5, y: 0.86602540378 }, 240],
    [{ x: 0, y: 1 }, 270],
    [{ x: 0.5, y: 0.86602540378 }, 300],
    [{ x: 0.70710678118, y: 0.70710678118 }, 315],
    [{ x: 0.86602540378, y: 0.5 }, 330],
  ]

  test.each(cases)('(%o) => %i', (coord, expected) => {
    expect(calcCentralAngleFromHorizontalLine(coord, { x: 0, y: 0 })).toBeCloseTo(expected)
  })

  test('円の中心と同じ座標を指定した場合はnullを返す', () => {
    expect(calcCentralAngleFromHorizontalLine({ x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull()
  })
})
