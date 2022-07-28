import { drawCommandList, drawType, shapeList } from '../lib/constants'

declare global {
  type DrawType = typeof drawType[number]
  type ShapeType = typeof shapeList[number]

  interface DrawCommandMap {
    line: typeof drawCommandList['line'][number]
    circle: typeof drawCommandList['circle'][number]
    arc: typeof drawCommandList['arc'][number]
    rectangle: typeof drawCommandList['rectangle'][number]
  }

  type TemporaryShapeType =
    | 'tmp-line'
    | 'tmp-circle'
    | 'tmp-arc'
    | 'tmp-three-points-arc'
    | 'tmp-supplementalLine'

  interface DrawStepMap {
    line: {
      'start-end': 'startPoint' | 'endPoint'
    }
    circle: {
      'center-diameter': 'center' | 'diameter'
    }
    arc: {
      'center-two-points': 'center' | 'startPoint' | 'endPoint'
      'three-points': 'startPoint' | 'endPoint' | 'onLinePoint'
    }
    rectangle: {
      'two-corners': 'corner-1' | 'corner-2'
      'center-corner': 'center' | 'corner'
    }
  }

  // SにShapeTypeを指定し、その図形のコマンドのUnionを返す
  type ShapeDrawCommand<S extends ShapeType> = S extends keyof DrawCommandMap
    ? DrawCommandMap[S]
    : never

  // SにShapeType、CにそのShapeTypeのDrawCommandを指定し、その図形・コマンドのDrawStepを返す
  type DrawCommandSteps<
    S extends ShapeType,
    C extends typeof DrawCommandMap[S][number]
  > = S extends ShapeType
    ? C extends typeof DrawCommandMap[S][number]
      ? DrawStepMap[S][C]
      : never
    : never

  // すべてのDrawCommandのUnion
  type DrawCommand = DrawCommandMap[keyof DrawCommandMap]

  // TにShapeTypeを指定し、そのShapeのすべてのDrawCommandにおけるDrawStepを返す
  type AllStepsOfShape<T> = T extends ShapeType ? DrawStepMap[T][keyof DrawStepMap[T]] : never

  // すべてのShapeType、すべてのDrawCommandのDrawStepのUnion
  type DrawStep = AllStepsOfShape<ShapeType>

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

  interface Rectangle extends Shape {
    shape: 'rectangle'
    constraints: {
      corner1Point: Coordinate
      corner2Point: Coordinate
    }
    computed: {
      upperLeftPoint: Coordinate
      upperRightPoint: Coordinate
      lowerLeftPoint: Coordinate
      lowerRightPoint: Coordinate
    }
  }

  interface RectangleCenterCorner extends Shape {
    shape: 'rectangle'
    constraints: {
      center: Coordinate
      cornerPoint: Coordinate
    }
    computed: {
      upperLeftPoint: Coordinate
      upperRightPoint: Coordinate
      lowerLeftPoint: Coordinate
      lowerRightPoint: Coordinate
    }
  }

  interface Circle extends Shape {
    shape: 'circle'
    constraints: {
      center: Coordinate
      radius: number
    }
  }

  interface ArcConstraints {
    constrainShape: 'arc'
  }

  interface ArcConstraintsWithCenterAndTwoPoints extends ArcConstraints {
    constraintType: 'center-two-points'
    center: Coordinate
    radius: number
    startPoint: Coordinate
    endPoint: Coordinate
    startPointAngle: number
    endPointAngle: number
    angleDeltaFromStart: number
  }

  interface ArcConstraintsWithThreePoints extends ArcConstraints {
    constraintType: 'three-points'
    startPoint: Coordinate
    endPoint: Coordinate
    onLinePoint: Coordinate
    center: Coordinate
    startPointAngle: number
    endPointAngle: number
    angleDeltaFromStart: number
    radius: number
  }

  interface Arc<C extends ArcConstraints> extends Shape {
    shape: 'arc'
    constraints: C
  }

  interface SnappingCoordCandidate extends Coordinate {
    priority: number
    snapInfo: SnapInfo
  }

  interface SnappingCoordinate extends Coordinate {
    snapInfoList: SnapInfo[]
  }

  // interface ShapeSeed {
  //   type: ShapeType
  // }

  // interface LineShapeSeed extends ShapeSeed {
  //   type: 'line'
  //   startPoint: Coordinate
  //   endPoint: Coordinate
  // }

  // interface CircleShapeSeed extends ShapeSeed {
  //   type: 'circle'
  //   center: Coordinate
  //   radius: number
  // }

  // interface ArcShapeSeed extends ShapeSeed {
  //   type: 'arc'
  //   center: Coordinate
  //   radius: number
  //   startCoord: Coordinate
  //   endCoord: Coordinate
  //   startAngle: number
  //   endAngle: number
  //   angleDeltaFromStart: number
  // }

  // interface ArcWithThreePointsShapeSeed extends ShapeSeed {
  //   type: 'arc'
  //   startPoint: Coordinate
  //   endPoint: Coordinate
  //   onLinePoint: Coordinate
  //   center: Coordinate
  //   startPointAngle: number
  //   endPointAngle: number
  //   radius: number
  // }

  // interface SupplementalShapeSeed extends ShapeSeed {
  //   type: 'supplementalLine'
  //   startPoint: Coordinate
  //   endPoint: Coordinate
  // }

  interface Shape {
    type: DrawType
    shape: ShapeType
    drawCommand: DrawCommand
    id: number
  }

  // interface LineShape extends Shape, LineShapeSeed {
  //   type: 'line'
  // }
  //
  // interface CircleShape extends Shape, CircleShapeSeed {
  //   type: 'circle'
  // }
  //
  // interface ArcShape extends Shape, ArcShapeSeed {
  //   type: 'arc'
  // }
  //
  // interface ArcWithThreePointsShape extends Shape, ArcWithThreePointsShapeSeed {
  //   type: 'arc'
  // }
  //
  // interface SupplementalLineShape extends Shape, SupplementalShapeSeed {
  //   type: 'supplementalLine'
  // }

  // interface TemporaryShape extends ShapeSeed {
  //   type: TemporaryShapeType
  // }
  //
  // interface TemporaryLineShapeBase extends TemporaryShape {
  //   type: 'tmp-line'
  //   startPoint: Coordinate
  // }
  //
  // interface TemporaryLineShape extends TemporaryLineShapeBase, TemporaryShape {
  //   endPoint: Coordinate
  // }
  //
  // interface TemporaryCircleShapeBase extends TemporaryShape {
  //   type: 'tmp-circle'
  //   center: Coordinate
  // }
  //
  // interface TemporaryCircleShape extends TemporaryCircleShapeBase, TemporaryShape {
  //   radius: number
  //   diameterStart: Coordinate
  //   diameterEnd: Coordinate
  // }

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

  // interface TemporaryArcCenter extends TemporaryShape {
  //   type: 'tmp-arc'
  //   center: Coordinate
  // }
  //
  // interface TemporaryArcRadius extends TemporaryArcCenter {
  //   radius: number
  //   startCoord: Coordinate
  //   startAngle: number
  // }
  //
  // interface TemporaryArcShape extends TemporaryArcRadius {
  //   endCoord: Coordinate
  //   endAngle: number
  //   angleDeltaFromStart: number
  // }

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
  }

  // interface TemporaryArcStartPoint extends TemporaryShape {
  //   type: 'tmp-three-points-arc'
  //   startPoint: Coordinate
  // }
  //
  // interface TemporaryArcStartPointAndEndPoint extends TemporaryArcStartPoint {
  //   type: 'tmp-three-points-arc'
  //   endPoint: Coordinate
  //   distance: number
  // }
  //
  // interface TemporaryArcThreePoint extends TemporaryArcStartPointAndEndPoint {
  //   type: 'tmp-three-points-arc'
  //   onLinePoint: Coordinate
  //   center: Coordinate
  //   startPointAngle: number
  //   endPointAngle: number
  //   radius: number
  // }

  // interface TemporarySupplementalLineShapeBase extends TemporaryShape {
  //   type: 'tmp-supplementalLine'
  //   startPoint: Coordinate
  // }
  //
  // interface TemporarySupplementalLineShape
  //   extends TemporarySupplementalLineShapeBase,
  //     TemporaryShape {
  //   endPoint: Coordinate
  // }

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
