/**
 * 2つの座標間の距離を返します。
 * @param coord1 座標1
 * @param coord2 座標2
 * @returns 距離
 */
export const calcDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2))
}

/**
 * ベクトルの大きさを返します。
 * @param vector ベクトル
 * @returns 大きさ
 */
export const calcVectorLength = (vector: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
}

/**
 * 点Aと、円の円周上の点Aに最も近い点との距離を返します。
 * @param point 点A
 * @param circle 点Aと円周との距離を求める円
 * @returns 距離
 */
export const calcDistanceFromCircumference = (point: Coordinate, circle: CircleShape): number => {
  return Math.abs(calcDistance(point, circle.center) - circle.radius)
}

/**
 * 点からの線分上の最近傍点とその距離を返します。
 * @param point 点の座標
 * @param line 線分。両端座標の情報を持ちます。
 * @returns 最近傍点の情報
 */
export const findNearestPointOnLine = (
  point: Coordinate,
  line: { start: Coordinate; end: Coordinate }
): {
  nearestCoord: Coordinate
  distance: number
  isLineTerminal: boolean
} => {
  const lineLength = calcDistance(line.start, line.end)

  // 線分の始点から終点に向かう単位ベクトルn
  const n = {
    x: (line.end.x - line.start.x) / lineLength,
    y: (line.end.y - line.start.y) / lineLength,
  }

  // 始点からpointに向かうベクトルb
  const b: Coordinate = {
    x: point.x - line.start.x,
    y: point.y - line.start.y,
  }

  // 終点からpointに向かうベクトルc
  const c: Coordinate = {
    x: point.x - line.end.x,
    y: point.y - line.end.y,
  }

  // ベクトルnとベクトルbの内積
  const nbDot = n.x * b.x + n.y * b.y

  // 線分を含む直線上のpointの最近傍点
  const nearestCoord = {
    x: line.start.x + n.x * nbDot,
    y: line.start.y + n.y * nbDot,
  }

  // ベクトルn（始点から終点に向かうベクトル）とベクトルb（始点からpointに向かうベクトル）のなす角のcos
  const cosNB = (n.x * b.x + n.y * b.y) / calcVectorLength(b)
  // nの逆ベクトル（終点から始点に向かうベクトル）とベクトルc（終点からpointに向かうベクトル）のなす角のcos
  const cosNC = (-n.x * c.x + -n.y * c.y) / calcVectorLength(c)

  // cosNBが負の場合、最近傍点が線分の始点から外側に出てしまっているので、最近傍点は始点となる
  if (cosNB <= 0) {
    return {
      nearestCoord: line.start,
      distance: calcDistance(point, line.start),
      isLineTerminal: true,
    }
  }

  // cosInverseNCが負の場合、最近傍点が線分の終点から外側に出てしまっているので、最近傍点は終点となる
  if (cosNC <= 0) {
    return {
      nearestCoord: line.end,
      distance: calcDistance(point, line.end),
      isLineTerminal: true,
    }
  }

  // それ以外の場合、最近傍点は線分上にある
  return {
    nearestCoord,
    distance: calcDistance(point, nearestCoord),
    isLineTerminal: false,
  }
}

/**
 * 点からの扇上の最近傍点とその距離を返します。
 * @param point 点の座標
 * @param arc 扇。中心座標、弧部分のどちらかの端点の座標、その端点からもう一方の端点までがなす中心角の情報を持ちます。
 *            中心角は -360 < angle <= 360 の範囲で指定し、正の値だと反時計回り、負の値だと時計回りに弧を形成します。
 * @returns 最近傍点の情報
 */
export const findNearestPointOnSector = (
  point: Coordinate,
  arc: {
    center: Coordinate
    arcStartCoord: Coordinate
    angle: number
  }
): { nearestCoord: Coordinate; distance: number } | null => {
  const { center, arcStartCoord, angle } = arc

  const radius = calcDistance(center, arcStartCoord)

  // 水平方向からの点までの角度
  const pointAngle = calcCentralAngleFromHorizontalLine(point, center)
  const arcStartCoordAngle = calcCentralAngleFromHorizontalLine(arcStartCoord, center)

  if (pointAngle === null || arcStartCoordAngle === null) {
    return null
  }

  const arcEndCoordAngle = arcStartCoordAngle + arc.angle
  const arcEndCoord = calcCircumferenceCoordFromDegree(center, radius, arcEndCoordAngle)

  let nearestCoordToArc: {
    nearestCoord: Coordinate
    distance: number
  } | null = null

  const isPointInArc =
    // 扇がarcStartCoordから反時計回りに弧を形成している場合
    (angle > 0 &&
      // arcStartCoordとarcEndCoordの間に存在するか
      ((arcEndCoordAngle > arcStartCoordAngle &&
        isBetween(pointAngle, arcStartCoordAngle, arcEndCoordAngle)) ||
        // 弧がθ=0の直線を跨ぐ場合は、θ=0の上側と下側を分けて判定する
        (arcStartCoordAngle > arcEndCoordAngle &&
          (isBetween(pointAngle, 0, arcEndCoordAngle) ||
            isBetween(pointAngle, arcStartCoordAngle, 360))))) ||
    // 扇がarcStartCoordから時計回りに弧を形成している場合
    (angle < 0 &&
      // arcStartCoordとarcEndCoordの間に存在するか
      ((arcStartCoordAngle > arcEndCoordAngle &&
        isBetween(pointAngle, arcEndCoordAngle, arcStartCoordAngle)) ||
        // 弧がθ=0の直線を跨ぐ場合は、θ=0の上側と下側を分けて判定する
        (arcEndCoordAngle > arcStartCoordAngle && isBetween(pointAngle, 0, arcStartCoordAngle)) ||
        isBetween(pointAngle, arcEndCoordAngle, 360)))

  if (isPointInArc) {
    const intersections = findIntersectionOfCircleAndLine(
      { center, radius },
      { start: center, end: point }
    )
    const distance0 = calcDistance(point, intersections[0])
    const distance1 = calcDistance(point, intersections[1])

    nearestCoordToArc = {
      nearestCoord: distance0 < distance1 ? intersections[0] : intersections[1],
      distance: distance0 < distance1 ? distance0 : distance1,
    }
  }

  const nearestCoordToStartRadius = findNearestPointOnLine(point, {
    start: center,
    end: arcStartCoord,
  })
  const nearestCoordToEndRadius = findNearestPointOnLine(point, {
    start: center,
    end: arcEndCoord,
  })

  if (nearestCoordToArc === null) {
    if (nearestCoordToStartRadius < nearestCoordToEndRadius) {
      return nearestCoordToStartRadius
    } else {
      return nearestCoordToEndRadius
    }
  } else {
    if (nearestCoordToArc.distance < nearestCoordToStartRadius.distance) {
      if (nearestCoordToArc.distance < nearestCoordToEndRadius.distance) {
        return nearestCoordToArc
      } else {
        return nearestCoordToEndRadius
      }
    } else {
      if (nearestCoordToEndRadius.distance < nearestCoordToStartRadius.distance) {
        return nearestCoordToEndRadius
      } else {
        return nearestCoordToStartRadius
      }
    }
  }
}

/**
 * 円と線の交点座標を返します。
 * @param circle 円。中心座標を半径の情報を持ちます。
 * @param line 直線。直線上の2点の座標の情報を持ちます。
 * @return 交点座標
 */
export const findIntersectionOfCircleAndLine = (
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

/**
 * y=0、x>0である円周上の一点との間の中心角をもとに、円上の一点の座標を返します。
 * @param center 円の中心点の座標
 * @param radius 円の半径
 * @param degree 座標を求める円周上の一点の中心角
 * @returns 座標
 */
export const calcCircumferenceCoordFromDegree = (
  center: Coordinate,
  radius: number,
  degree: number
): Coordinate => {
  const radian = (degree * Math.PI) / 180
  const x = center.x + radius * Math.cos(radian)
  const y = center.y - radius * Math.sin(radian) // xy座標系とSVG空間の座標系ではy軸の正負が逆転する
  return { x, y }
}

/**
 * 円周上の一点を指定し、y=0、x>0である円周上の一点との間の中心角を返します。
 * @param coord 円周上の一点の座標
 * @param center 円の中心座標
 * @returns 中心角。 0 <= angle < 360 の範囲で返します。circleとcenterの座標が一致する場合はnullを返します。
 */
export const calcCentralAngleFromHorizontalLine = (coord: Coordinate, center: Coordinate) => {
  const x = coord.x - center.x
  const y = -1 * (coord.y - center.y) // xy座標系とSVG空間の座標系ではy軸の正負が逆転する

  const radius = calcDistance(center, coord)

  const degree = (Math.acos(x / radius) * 180) / Math.PI

  if (isNaN(degree)) {
    return null
  }

  return y >= 0 ? degree : 360 - degree
}

/**
 * グリッド線の交点の座標のリストを返します。
 * @returns グリッド線の交点の座標のリスト
 */
export const getGridIntersections = (): Coordinate[] => {
  const gridIntersections: Coordinate[] = []
  // x = 50ごとに垂直方向のグリッド線を引いている
  for (let x = 0; x <= window.innerWidth; x += 50) {
    // y = 50ごとに水平方向のグリッド線を引いている
    for (let y = 0; y <= window.innerHeight; y += 50) {
      gridIntersections.push({ x, y })
    }
  }

  return gridIntersections
}

/**
 * state.ts に定義されているsnapDestinationCoordのデフォルト値を返します。
 * グリッドの交点に対するスナップが機能するための座標情報が含まれています。
 * @returns snapDestinationCoordのデフォルト値
 */
export const getSnapDestinationCoordDefaultValue = (): {
  [xy: string]: SnappingCoordCandidate[] | undefined
} => {
  const defaultValue: { [xy: string]: SnappingCoordCandidate[] | undefined } = {}

  for (const targetCoord of getGridIntersections()) {
    for (let x = Math.floor(targetCoord.x) - 4; x <= Math.ceil(targetCoord.x) + 4; x++) {
      for (let y = Math.floor(targetCoord.y) - 4; y <= Math.ceil(targetCoord.y) + 4; y++) {
        const key = `${x}-${y}`

        defaultValue[key] = [
          ...(defaultValue[key] || []),
          {
            ...targetCoord,
            snapInfo: { type: 'gridIntersection' } as SnapInfoGridIntersection,
            priority: 3,
          },
        ]
      }
    }
  }

  return defaultValue
}

export const assert = (condition: boolean, message?: string): void => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

export const isBetween = (value: number, min: number, max: number): boolean => {
  if (min > max) {
    throw new Error(`min(${min}) > max(${max})`)
  }
  return max >= value && value >= min
}
