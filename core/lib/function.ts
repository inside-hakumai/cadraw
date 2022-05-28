export const calcDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2))
}

/**
 * 円と線の交点座標を返します。
 * @param circle 円。中心座標を半径の情報を持ちます。
 * @param line 直線。直線上の2点の座標の情報を持ちます。
 * @return 交点座標
 */
export const findIntersection = (
  circle: { center: Coordinate; radius: number },
  line: { start: Coordinate; end: Coordinate }
): Coordinate[] => {
  /*
   前提条件:
   - 円の原点座標を (m, n)、円の半径をrとする
   - 直線が2点 (a1, b1)、(a2, b2) を通るものとする
   */

  // H = (b2 - b1) / (a2 - a1) とする
  const H = (line.end.y - line.start.y) / (line.end.x - line.start.x)

  // I = b1 - n - (H * a1) とする
  const I = line.start.y - circle.center.y - H * line.start.x

  // A = H^2 + 1
  // B = 2 * (H * I - m)
  // C = I^2 - r^2 + m^2 とする
  const A = H ** 2 + 1
  const B = 2 * (H * I - line.start.x)
  const C = I ** 2 - circle.radius ** 2 + circle.center.x ** 2

  // 交点のx座標は (B +- sqrt(B^2 - 4AC)) / 2A で算出できる。
  // このとき、D = B^2 - 4AC とすると、
  // D > 0 ならば交点が2つ存在、D = 0 ならば交点が1つ存在、D < 0 ならば交点が存在しない
  const D = B ** 2 - 4 * A * C

  if (Math.abs(D) < 0.000001) {
    // 交点が1つ存在する
    const x = -B / (2 * A)
    const y = H * (x - line.start.x) + line.start.y
    return [{ x, y }]
  } else if (D < 0) {
    // 交点が存在しない
    return []
  } else {
    // D > 0 交点が2つ存在する
    const x1 = (-B + Math.sqrt(D)) / (2 * A)
    const x2 = (-B - Math.sqrt(D)) / (2 * A)

    const y1 = H * (x1 - line.start.x) + line.start.y
    const y2 = H * (x2 - line.start.x) + line.start.y

    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ]
  }
}
