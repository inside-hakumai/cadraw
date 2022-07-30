import { drawCommandList, drawType, shapeList, drawStepList } from '../lib/constants'

declare global {
  type DrawType = typeof drawType[number]
  type ShapeType = typeof shapeList[number]
  type DrawStepMap = typeof drawStepList

  interface DrawCommandMap {
    line: typeof drawCommandList['line'][number]
    circle: typeof drawCommandList['circle'][number]
    arc: typeof drawCommandList['arc'][number]
    rectangle: typeof drawCommandList['rectangle'][number]
  }

  // SにShapeTypeを指定し、その図形のコマンドのUnionを返す
  type ShapeDrawCommand<S extends ShapeType> = S extends keyof DrawCommandMap
    ? DrawCommandMap[S]
    : never

  // SにShapeType、CにそのShapeTypeのDrawCommandを指定し、その図形・コマンドのDrawStepのUnionを返す
  type CommandDrawStep<
    S extends ShapeType,
    C extends typeof DrawCommandMap[S][number]
  > = S extends ShapeType
    ? C extends typeof DrawCommandMap[S][number]
      ? DrawStepMap[S][C][number]
      : never
    : never

  // すべてのDrawCommandのUnion
  type DrawCommand = DrawCommandMap[keyof DrawCommandMap]

  // TにShapeTypeを指定し、そのShapeのすべてのDrawCommandにおけるDrawStepを返す
  type ShapeDrawStep<S extends ShapeType> = S extends ShapeType
    ? CommandDrawStep<S, ShapeDrawCommand<S>>
    : never

  // すべてのShapeType、すべてのDrawCommandのDrawStepのUnion
  type DrawStep = ShapeDrawStep<ShapeType>

  type OperationMode = ShapeType | 'select'
  type ConstraintType = 'circleCenter' | 'lineEdge' | 'arcCenter' | 'arcEdge'
  type SnapType =
    | ConstraintType
    | 'gridIntersection'
    | 'circumference'
    | 'onLine'
    | 'onArc'
    | 'onRectangle'

  interface Coordinate {
    x: number
    y: number
  }

  interface Vec {
    vx: number
    vy: number
  }

  interface ShapeConstraintPoint {
    coord: Coordinate
    targetShapeId: number
    constraintType: ConstraintType
  }

  interface Shape {
    type: DrawType
    shape: ShapeType
    drawCommand: DrawCommand
    id: number
  }

  interface Line extends Shape {
    shape: 'line'
    constraints: {
      startPoint: Coordinate
      endPoint: Coordinate
    }
  }

  interface CenterRadiusConstraints {
    center: Coordinate
    radius: number
  }

  interface TwoPointsConstraints {
    point1: Coordinate
    point2: Coordinate
  }

  interface TwoPointsRadiusConstraints {
    point1: Coordinate
    point2: Coordinate
    radius: number
  }

  type CircleConstraints =
    | CenterRadiusConstraints
    | TwoPointsConstraints
    | TwoPointsRadiusConstraints

  interface Circle<C extends CircleConstraints = Void> extends Shape {
    shape: 'circle'
    constraints: C
    computed: {
      center: Coordinate
      radius: number
    }
  }

  interface SnappingCoordCandidate extends Coordinate {
    priority: number
    snapInfo: SnapInfo
  }

  interface SnappingCoordinate extends Coordinate {
    snapInfoList: SnapInfo[]
  }

  interface RectangleParameters {
    upperLeftPoint: Coordinate
    upperRightPoint: Coordinate
    lowerLeftPoint: Coordinate
    lowerRightPoint: Coordinate
  }

  interface CenterCornerConstraints {
    center: Coordinate
    cornerPoint: Coordinate
  }

  interface TwoCornersConstraints {
    corner1Point: Coordinate
    corner2Point: Coordinate
  }

  type RectangleConstraints = CenterCornerConstraints | TwoCornersConstraints

  interface Rectangle<C extends RectangleConstraints = Void> extends Shape {
    shape: 'rectangle'
    constraints: C
    computed: RectangleParameters
  }

  interface ArcParameters {
    center: Coordinate
    startPoint: Coordinate
    endPoint: Coordinate
    startPointAngle: number
    endPointAngle: number
    radius: number
    angleDeltaFromStart: number
  }

  interface CenterAndTwoPointsConstraints {
    center: Coordinate
    startPoint: Coordinate
    endPoint: Coordinate
    angleDeltaFromStart: number
  }

  interface ThreePointsConstraints {
    startPoint: Coordinate
    endPoint: Coordinate
    onLinePoint: Coordinate
  }

  type ArcConstraints = CenterAndTwoPointsConstraints | ThreePointsConstraints

  interface Arc<C extends ArcConstraints = Void> extends Shape {
    shape: 'arc'
    constraints: C
    computed: ArcParameters
  }

  interface ShapeSeed {
    isSeed: true
    shape: ShapeType
    drawCommand: DrawCommand
  }

  interface LineSeedConstrainedByStartEnd extends ShapeSeed {
    shape: 'line'
    drawCommand: 'start-end'
    startPoint: Coordinate
    endPoint: Coordinate
  }

  interface RectangleSeedConstrainedByTwoCorners extends ShapeSeed {
    shape: 'rectangle'
    drawCommand: 'two-corners'
    corner1Point: Coordinate
    corner2Point: Coordinate
    upperLeftPoint: Coordinate
  }

  interface RectangleSeedConstrainedByCenterCorner extends ShapeSeed {
    shape: 'rectangle'
    drawCommand: 'center-corner'
    center: Coordinate
    cornerPoint: Coordinate
    upperLeftPoint: Coordinate
  }

  interface CircleSeedConstrainedByCenterDiameter extends ShapeSeed {
    shape: 'circle'
    drawCommand: 'center-diameter'
    center: Coordinate
    diameterStart: Coordinate
    diameterEnd: Coordinate
    radius: number
  }

  interface CircleSeedConstrainedByTwoPoints extends ShapeSeed {
    shape: 'circle'
    drawCommand: 'two-points'
    point1: Coordinate
    point2: Coordinate
    diameter: number
    center: Coordinate
  }

  interface CircleSeed1ConstrainedByTwoPointsRadius extends ShapeSeed {
    shape: 'circle'
    drawCommand: 'two-points-radius'
    point1: Coordinate
    point2: Coordinate
    distanceBetweenPoints: number
    radius: undefined
    center: undefined
  }

  interface CircleSeed2ConstrainedByTwoPointsRadius extends ShapeSeed {
    shape: 'circle'
    drawCommand: 'two-points-radius'
    point1: Coordinate
    point2: Coordinate
    lineEquidistantFromTwoPoints: { point: Coordinate; unitVector: Vec }
    distanceBetweenPoints: number
    radius: number
    center: Coordinate
  }

  interface ArcSeed1ConstrainedByCenterTwoPoints extends ShapeSeed {
    shape: 'arc'
    drawCommand: 'center-two-points'
    center: Coordinate
    startPoint: Coordinate
    startPointAngle: number
    radius: number
  }

  interface ArcSeed2ConstrainedByCenterTwoPoints extends ArcSeed1ConstrainedByCenterTwoPoints {
    endPoint: Coordinate
    endPointAngle: number
    angleDeltaFromStart: number
  }

  interface ArcSeed1ConstrainedThreePoints extends ShapeSeed {
    shape: 'arc'
    drawCommand: 'three-points'
    startPoint: Coordinate
    endPoint: Coordinate
    distance: number
  }

  interface ArcSeed2ConstrainedByThreePoints extends ArcSeed1ConstrainedThreePoints {
    onLinePoint: Coordinate
    center: Coordinate
    startPointAngle: number
    endPointAngle: number
    radius: number
    angleDeltaFromStart: number
  }

  interface SnapInfo {
    type: SnapType
  }

  interface SnapInfoGridIntersection extends SnapInfo {
    type: 'gridIntersection'
  }

  interface ShapeRelatedSnapInfo extends SnapInfo {
    targetShapeId: number
  }

  interface SnapInfoCircleCenter extends ShapeRelatedSnapInfo {
    type: 'circleCenter'
    targetShapeId: number
  }

  interface SnapInfoCircumference extends ShapeRelatedSnapInfo {
    type: 'circumference'
    targetShapeId: number
  }

  interface SnapInfoLineEdge extends ShapeRelatedSnapInfo {
    type: 'lineEdge'
    targetShapeId: number
  }
}
