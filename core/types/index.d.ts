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

  interface Line extends Shape {
    shape: 'line'
    constraints: {
      startPoint: Coordinate
      endPoint: Coordinate
    }
  }

  interface Circle extends Shape {
    shape: 'circle'
    constraints: {
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

  interface Shape {
    type: DrawType
    shape: ShapeType
    drawCommand: DrawCommand
    id: number
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
    drawStep: DrawStep
  }

  interface LineStartEndSeed1 extends ShapeSeed {
    shape: 'line'
    drawCommand: 'start-end'
    drawStep: 'startPoint'
    startPoint: Coordinate
  }

  interface LineStartEndSeed2 extends LineStartEndSeed1 {
    drawStep: 'endPoint'
    endPoint: Coordinate
  }

  interface RectangleTwoCornersSeed1 extends ShapeSeed {
    shape: 'rectangle'
    drawStep: 'corner-1'
    corner1Point: Coordinate
  }

  interface RectangleTwoCornersSeed2 extends RectangleTwoCornersSeed1 {
    drawStep: 'corner-2'
    corner2Point: Coordinate
    upperLeftPoint: Coordinate
  }

  interface RectangleCenterCornerSeed1 extends ShapeSeed {
    shape: 'rectangle'
    drawStep: 'center'
    center: Coordinate
  }

  interface RectangleCenterCornerSeed2 extends RectangleCenterCornerSeed1 {
    drawStep: 'corner'
    cornerPoint: Coordinate
    upperLeftPoint: Coordinate
  }

  interface CircleCenterDiameterSeed1 extends ShapeSeed {
    shape: 'circle'
    drawCommand: 'center-diameter'
    drawStep: 'center'
    center: Coordinate
  }

  interface CircleCenterDiameterSeed2 extends CircleCenterDiameterSeed1 {
    drawStep: 'diameter'
    radius: number
    diameterStart: Coordinate
    diameterEnd: Coordinate
  }

  interface ArcCenterTwoPointsSeed1 extends ShapeSeed {
    shape: 'arc'
    drawCommand: 'center-two-points'
    drawStep: 'center'
    center: Coordinate
  }

  interface ArcCenterTwoPointsSeed2 extends ArcCenterTwoPointsSeed1 {
    drawStep: 'startPoint'
    radius: number
    startPoint: Coordinate
    startPointAngle: number
  }

  interface ArcCenterTwoPointsSeed3 extends ArcCenterTwoPointsSeed2 {
    drawStep: 'endPoint'
    endPoint: Coordinate
    endPointAngle: number
    angleDeltaFromStart: number
  }

  interface ArcThreePointsSeed1 extends ShapeSeed {
    shape: 'arc'
    drawCommand: 'three-points'
    drawStep: 'startPoint'
    startPoint: Coordinate
  }

  interface ArcThreePointsSeed2 extends ArcThreePointsSeed1 {
    drawStep: 'endPoint'
    endPoint: Coordinate
    distance: number
  }

  interface ArcThreePointsSeed3 extends ArcThreePointsSeed2 {
    drawStep: 'onLinePoint'
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
