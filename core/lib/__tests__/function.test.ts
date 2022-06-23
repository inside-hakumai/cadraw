import {
  calcCentralAngleFromHorizontalLine,
  findLineEquidistantFromTwoPoints,
  isPointInTriangle,
} from '../function'

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

describe('findLineEquidistantFromTwoPoints()', () => {
  const cases: [Coordinate, Coordinate, { point: Coordinate; unitVector: Vector }][] = [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { point: { x: 0.5, y: 0 }, unitVector: { vx: 0, vy: -1 } },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { point: { x: 0.5, y: 0.5 }, unitVector: { vx: 1 / Math.sqrt(2), vy: -1 / Math.sqrt(2) } },
    ],
    [
      { x: 0, y: 0 },
      { x: 2, y: 1 },
      { point: { x: 1, y: 0.5 }, unitVector: { vx: 1 / Math.sqrt(5), vy: -2 / Math.sqrt(5) } },
    ],
  ]

  test.each(cases)('(%o, %o)', (coord1, coord2, expected) => {
    const actual = findLineEquidistantFromTwoPoints(coord1, coord2)
    expect(actual.point.x).toBeCloseTo(expected.point.x)
    expect(actual.point.y).toBeCloseTo(expected.point.y)
    expect(actual.unitVector.vx).toBeCloseTo(expected.unitVector.vx)
    expect(actual.unitVector.vy).toBeCloseTo(expected.unitVector.vy)
  })
})

describe('isPointInTriangle()', () => {
  const cases: [Coordinate, [Coordinate, Coordinate, Coordinate], boolean][] = [
    // 点が頂点のいずれかと一致する場合
    [
      { x: 0, y: 0 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    [
      { x: 1, y: 0 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    [
      { x: 0, y: 1 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    // 点が線上に存在する場合
    [
      { x: 0.5, y: 0 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    [
      { x: 0, y: 0.5 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    [
      { x: 0.5, y: 0.5 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    // 点が内部に存在する場合
    [
      { x: 0.2, y: 0.2 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    // 点が外部に存在する場合
    [
      { x: 0.5, y: -1 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      false,
    ],
    [
      { x: -1, y: 0.5 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      false,
    ],
    [
      { x: 1, y: 1 },
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      false,
    ],
  ]

  test.each(cases)('(%o, %o, %b)', (point, triangle, expected) => {
    const actual = isPointInTriangle(point, triangle)
    expect(actual).toBe(expected)
  })
})
