import { color } from './constants'
import { isLine } from './typeguard'

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
export const calcDistanceFromCircumference = (
  point: Coordinate,
  circle: Circle['constraints']
): number => {
  return Math.abs(calcDistance(point, circle.center) - circle.radius)
}

/**
 * 点Aと、長方形の線上の点Aに最も近い点との距離を返します。
 * @param point 点A
 * @param rectangle 点Aとの距離を求める長方形
 * @returns 距離
 */
export const findNearestPointOnRectangle = (
  point: Coordinate,
  rectangle: {
    upperLeftPoint: Coordinate
    upperRightPoint: Coordinate
    lowerLeftPoint: Coordinate
    lowerRightPoint: Coordinate
  }
): {
  nearestCoord: Coordinate
  distance: number
  isRectangleCorner: boolean
} => {
  const nearestPointOnLineUpperLeftToUpperRight = findNearestPointOnLineSegment(point, {
    startPoint: rectangle.upperLeftPoint,
    endPoint: rectangle.upperRightPoint,
  })

  const nearestPointOnLineUpperRightToLowerRight = findNearestPointOnLineSegment(point, {
    startPoint: rectangle.upperRightPoint,
    endPoint: rectangle.lowerRightPoint,
  })

  const nearestPointOnLineLowerRightToLowerLeft = findNearestPointOnLineSegment(point, {
    startPoint: rectangle.lowerRightPoint,
    endPoint: rectangle.lowerLeftPoint,
  })

  const nearestPointOnLineLowerLeftToUpperLeft = findNearestPointOnLineSegment(point, {
    startPoint: rectangle.lowerLeftPoint,
    endPoint: rectangle.upperLeftPoint,
  })

  const nearestPointCandidates = [
    nearestPointOnLineUpperLeftToUpperRight,
    nearestPointOnLineUpperRightToLowerRight,
    nearestPointOnLineLowerRightToLowerLeft,
    nearestPointOnLineLowerLeftToUpperLeft,
  ]

  const nearestPoint = nearestPointCandidates.reduce((acc, cur) => {
    return acc.distance > cur.distance ? cur : acc
  })

  return {
    nearestCoord: nearestPoint.nearestCoord,
    distance: nearestPoint.distance,
    isRectangleCorner: nearestPoint.isLineTerminal,
  }
}

/**
 * 点からの直線上の最近傍点とその距離を返します。
 * @param point 点の座標
 * @param line 直線。線上の1点の座標と単位ベクトルの情報を持ちます。
 */
export const findNearestPointOnLine = (
  point: Coordinate,
  line: {
    point: Coordinate
    unitVector: Vec
  }
): {
  nearestCoord: Coordinate
  distance: number
} => {
  // 線上の点からpointに向かうベクトルb
  const b: Vec = {
    vx: point.x - line.point.x,
    vy: point.y - line.point.y,
  }

  // 線の単位ベクトルとベクトルbの内積
  const nbDot = line.unitVector.vx * b.vx + line.unitVector.vy * b.vy

  // 直線上のpointの最近傍点
  const nearestCoord = {
    x: line.point.x + line.unitVector.vx * nbDot,
    y: line.point.y + line.unitVector.vy * nbDot,
  }

  return {
    nearestCoord,
    distance: calcDistance(point, nearestCoord),
  }
}

/**
 * 点からの線分上の最近傍点とその距離を返します。
 * @param point 点の座標
 * @param line 線分。両端座標の情報を持ちます。
 * @returns 最近傍点の情報
 */
export const findNearestPointOnLineSegment = (
  point: Coordinate,
  line: { startPoint: Coordinate; endPoint: Coordinate }
): {
  nearestCoord: Coordinate
  distance: number
  isLineTerminal: boolean
} => {
  const lineLength = calcDistance(line.startPoint, line.endPoint)

  // 線分の始点から終点に向かう単位ベクトルn
  const n = {
    x: (line.endPoint.x - line.startPoint.x) / lineLength,
    y: (line.endPoint.y - line.startPoint.y) / lineLength,
  }

  // 始点からpointに向かうベクトルb
  const b: Coordinate = {
    x: point.x - line.startPoint.x,
    y: point.y - line.startPoint.y,
  }

  // 終点からpointに向かうベクトルc
  const c: Coordinate = {
    x: point.x - line.endPoint.x,
    y: point.y - line.endPoint.y,
  }

  // ベクトルnとベクトルbの内積
  const nbDot = n.x * b.x + n.y * b.y

  // 線分を含む直線上のpointの最近傍点
  const nearestCoord = {
    x: line.startPoint.x + n.x * nbDot,
    y: line.startPoint.y + n.y * nbDot,
  }

  // ベクトルn（始点から終点に向かうベクトル）とベクトルb（始点からpointに向かうベクトル）のなす角のcos
  const cosNB = (n.x * b.x + n.y * b.y) / calcVectorLength(b)
  // nの逆ベクトル（終点から始点に向かうベクトル）とベクトルc（終点からpointに向かうベクトル）のなす角のcos
  const cosNC = (-n.x * c.x + -n.y * c.y) / calcVectorLength(c)

  // cosNBが負の場合、最近傍点が線分の始点から外側に出てしまっているので、最近傍点は始点となる
  if (cosNB <= 0) {
    return {
      nearestCoord: line.startPoint,
      distance: calcDistance(point, line.startPoint),
      isLineTerminal: true,
    }
  }

  // cosInverseNCが負の場合、最近傍点が線分の終点から外側に出てしまっているので、最近傍点は終点となる
  if (cosNC <= 0) {
    return {
      nearestCoord: line.endPoint,
      distance: calcDistance(point, line.endPoint),
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
 * 点からの円弧上の最近傍点とその距離を返します。
 * @param point 点の座標
 * @param arc 円弧。中心座標、両端の座標、始点から終点までがなす中心角の情報を持ちます。
 *            中心角は -360 < angle < 360 の範囲で指定し、正の値だと始点から反時計回り、負の値だと時計回りに弧を形成します。
 * @returns 最近傍点の情報
 */
export const findNearestPointOnArc = (
  point: Coordinate,
  arc: Arc
): { nearestCoord: Coordinate; distance: number; isArcTerminal: boolean } | null => {
  const {
    center,
    radius,
    startPoint,
    endPoint,
    startPointAngle,
    endPointAngle,
    angleDeltaFromStart,
  } = arc.computed

  // 水平方向からの点までの角度
  const pointAngle = calcCentralAngleFromHorizontalLine(point, center)

  if (pointAngle === null) {
    return null
  }

  const isPointInArc =
    // 円弧がarcStartCoordから反時計回りに弧を形成している場合
    (angleDeltaFromStart > 0 &&
      // arcStartCoordとarcEndCoordの間に存在するか
      ((endPointAngle > startPointAngle &&
        isBetween(pointAngle, startPointAngle, endPointAngle, false, false)) ||
        // 弧がθ=0の直線を跨ぐ場合は、θ=0の上側と下側を分けて判定する
        (startPointAngle > endPointAngle &&
          (isBetween(pointAngle, 0, endPointAngle, true, false) ||
            isBetween(pointAngle, startPointAngle, 360, false, false))))) ||
    // 円弧がarcStartCoordから時計回りに弧を形成している場合
    (angleDeltaFromStart < 0 &&
      // arcStartCoordとarcEndCoordの間に存在するか
      ((startPointAngle > endPointAngle &&
        isBetween(pointAngle, endPointAngle, startPointAngle, false, false)) ||
        // 弧がθ=0の直線を跨ぐ場合は、θ=0の上側と下側を分けて判定する
        (endPointAngle > startPointAngle &&
          isBetween(pointAngle, 0, startPointAngle, true, false)) ||
        isBetween(pointAngle, endPointAngle, 360, false, false)))

  if (isPointInArc) {
    const intersections = findIntersectionOfCircleAndLine(
      { center, radius },
      { start: center, end: point }
    )
    const distance0 = calcDistance(point, intersections[0])
    const distance1 = calcDistance(point, intersections[1])

    return {
      nearestCoord: distance0 < distance1 ? intersections[0] : intersections[1],
      distance: distance0 < distance1 ? distance0 : distance1,
      isArcTerminal: false,
    }
  }

  const distanceToArcStart = calcDistance(point, startPoint)
  const distanceToArcEnd = calcDistance(point, endPoint)

  return distanceToArcStart < distanceToArcEnd
    ? {
        nearestCoord: startPoint,
        distance: distanceToArcStart,
        isArcTerminal: true,
      }
    : {
        nearestCoord: endPoint,
        distance: distanceToArcEnd,
        isArcTerminal: true,
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
 * 2点から等しい距離となる直線を返します。
 * @param point1 点1の座標
 * @param point2 点2の座標
 * @returns 2点から等しい距離にある直線
 */
export const findLineEquidistantFromTwoPoints = (
  point1: Coordinate,
  point2: Coordinate
): {
  point: Coordinate
  unitVector: Vec
} => {
  const pointBetweenTwoPoints: Coordinate = {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  }

  const distance = calcDistance(point1, point2)

  const unitVector: Vec = {
    vx: (point2.y - point1.y) / distance,
    vy: -(point2.x - point1.x) / distance,
  }

  return {
    point: pointBetweenTwoPoints,
    unitVector,
  }
}

/**
 * 3点から等しい距離にある点の座標を返します。
 * @param point1 点1の座標
 * @param point2 点2の座標
 * @param point3 点3の座標
 * @returns 3点から等しい距離にある点の座標
 */
export const findPointEquidistantFromThreePoints = (
  point1: Coordinate,
  point2: Coordinate,
  point3: Coordinate
): Coordinate => {
  const lineEquidistantFromPoint1And2 = findLineEquidistantFromTwoPoints(point1, point2)
  const lineEquidistantFromPoint2And3 = findLineEquidistantFromTwoPoints(point2, point3)

  const { x: x1, y: y1 } = lineEquidistantFromPoint1And2.point
  const { vx: nx1, vy: ny1 } = lineEquidistantFromPoint1And2.unitVector
  const { x: x2, y: y2 } = lineEquidistantFromPoint2And3.point
  const { vx: nx2, vy: ny2 } = lineEquidistantFromPoint2And3.unitVector

  const a = (nx2 * (y1 - y2) - ny2 * (x1 - x2)) / (nx1 * ny2 - nx2 * ny1)
  // const b = (x1 + a * nx1 - x2) / nx2

  return {
    x: x1 + a * nx1,
    y: y1 + a * ny1,
  }
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

/**
 * 値が指定した値の範囲に含まれているかどうかを返します。
 * @param value 範囲内に含まれているかどうかを判定する値
 * @param min 最小値
 * @param max 最大値
 * @param includeMin trueの場合、最小値を範囲に含みます。
 * @param includeMax trueの場合、最大値を範囲に含みます。
 */
export const isBetween = (
  value: number,
  min: number,
  max: number,
  includeMin: boolean,
  includeMax: boolean
): boolean => {
  if (min > max) {
    throw new Error(`min(${min}) > max(${max})`)
  }

  // 範囲に最小値と最大値を含む場合
  if (includeMin && includeMax) {
    return max >= value && value >= min
  }

  // 範囲に最小値を含まず、最大値を含む場合
  if (!includeMin && includeMax) {
    return max >= value && value > min
  }

  // 範囲に最小値を含み、最大値を含まない場合
  if (includeMin && !includeMax) {
    return max > value && value >= min
  }

  // 範囲に最小値と最大値を含まない場合
  return max > value && value > min
}

/**
 * xy座標系において、点が三角形の内部に位置するかどうかを返します。
 * @param point 判定する点
 * @param triangleVertexes 三角形を構成する3つの頂点の座標
 * @returns 点が三角形の内部に位置するかどうか
 */
export const isPointInTriangle = (point: Coordinate, triangleVertexes: Coordinate[]): boolean => {
  if (triangleVertexes.length !== 3) {
    throw new Error('A triangle must have just 3 vertexes')
  }

  const [a, b, c] = triangleVertexes

  const vAP = { x: point.x - a.x, y: point.y - a.y }
  const vAC = { x: c.x - a.x, y: c.y - a.y }
  const vBP = { x: point.x - b.x, y: point.y - b.y }
  const vBA = { x: a.x - b.x, y: a.y - b.y }
  const vCP = { x: point.x - c.x, y: point.y - c.y }
  const vCB = { x: b.x - c.x, y: b.y - c.y }

  // 3頂点と点が関係する3つの外積を計算する
  const crossProductA = vAP.x * vAC.y - vAP.y * vAC.x
  const crossProductB = vBP.x * vBA.y - vBP.y * vBA.x
  const crossProductC = vCP.x * vCB.y - vCP.y * vCB.x

  // 点が三角形の内部に位置する場合、3つの外積の正負が揃う
  return (
    (crossProductA >= 0 && crossProductB >= 0 && crossProductC >= 0) ||
    (crossProductA <= 0 && crossProductB <= 0 && crossProductC <= 0)
  )
}

/**
 * 図形の描画に使用するカラーコードを返します。
 * @param isSelected その図形が選択状態にあるかどうか
 * @param isFocused その図形にフォーカスが当たっているかどうか
 * @param drawType その図形の描画タイプ
 * @returns カラーコード
 */
export const getStrokeColor = (isSelected: boolean, isFocused: boolean, drawType: DrawType) => {
  if (drawType === 'dragShadow') return color.stroke.shadow
  if (isSelected) return color.stroke.onSelected
  if (isFocused) return color.stroke.onFocused

  return color.stroke.normal
}

export const cloneShape = <S extends Shape>(shape: S): S => {
  if (isLine(shape)) {
    return {
      id: shape.id,
      type: shape.type,
      shape: shape.shape,
      drawCommand: shape.drawCommand,
      constraints: {
        startPoint: {
          x: shape.constraints.startPoint.x,
          y: shape.constraints.startPoint.y,
        },
        endPoint: {
          x: shape.constraints.endPoint.x,
          y: shape.constraints.endPoint.y,
        },
      },
      computed: {
        startPoint: {
          x: shape.computed.startPoint.x,
          y: shape.computed.startPoint.y,
        },
        endPoint: {
          x: shape.computed.endPoint.x,
          y: shape.computed.endPoint.y,
        },
      },
    } as typeof shape
  } else {
    return shape
  }
}

export const addCoord = (source: Coordinate, dx: number, dy: number): Coordinate => {
  return {
    x: source.x + dx,
    y: source.y + dy,
  }
}
