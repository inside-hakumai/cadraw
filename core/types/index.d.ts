type ShapeType = 'line' | 'circle' | 'arc' | 'supplementalLine'
type TemporaryShapeType = 'tmp-line' | 'tmp-circle' | 'tmp-arc' | 'tmp-supplementalLine'
type OperationMode =
  | 'line:point-start'
  | 'line:point-end'
  | 'circle:point-center'
  | 'circle:fix-radius'
  | 'arc:point-center'
  | 'arc:fix-radius'
  | 'arc:fix-angle'
  | 'select'
  | 'supplementalLine:point-start'
  | 'supplementalLine:point-end'
type ConstraintType = 'circleCenter' | 'lineEdge' | 'arcCenter' | 'arcEdge'
type SnapType = ConstraintType | 'gridIntersection' | 'circumference' | 'onLine' | 'onArc'

interface Coordinate {
  x: number
  y: number
}

interface ShapeConstraintPoint {
  coord: Coordinate
  targetShapeId: number
  constraintType: ConstraintType
}

interface SnappingCoordCandidate extends Coordinate {
  priority: number
  snapInfo: SnapInfo
}

interface SnappingCoordinate extends Coordinate {
  snapInfoList: SnapInfo[]
}

interface ShapeSeed {
  type: ShapeType
}

interface LineShapeSeed extends ShapeSeed {
  type: 'line'
  start: Coordinate
  end: Coordinate
}

interface CircleShapeSeed extends ShapeSeed {
  type: 'circle'
  center: Coordinate
  radius: number
}

interface ArcShapeSeed extends ShapeSeed {
  type: 'arc'
  center: Coordinate
  radius: number
  startCoord: Coordinate
  endCoord: Coordinate
  startAngle: number
  endAngle: number
  angleDeltaFromStart: number
}

interface SupplementalShapeSeed extends ShapeSeed {
  type: 'supplementalLine'
  start: Coordinate
  end: Coordinate
}

interface Shape {
  type: ShapeType
  id: number
}

interface LineShape extends Shape, LineShapeSeed {
  type: 'line'
}

interface CircleShape extends Shape, CircleShapeSeed {
  type: 'circle'
}

interface ArcShape extends Shape, ArcShapeSeed {
  type: 'arc'
}

interface SupplementalLineShape extends Shape, SupplementalShapeSeed {
  type: 'supplementalLine'
}

interface TemporaryShape extends ShapeSeed {
  type: TemporaryShapeType
}

interface TemporaryLineShapeBase extends TemporaryShape {
  type: 'tmp-line'
  start: Coordinate
}
interface TemporaryLineShape extends TemporaryLineShapeBase, TemporaryShape {
  end: Coordinate
}

interface TemporaryCircleShapeBase extends TemporaryShape {
  type: 'tmp-circle'
  center: Coordinate
}
interface TemporaryCircleShape extends TemporaryCircleShapeBase, TemporaryShape {
  radius: number
  diameterStart: Coordinate
  diameterEnd: Coordinate
}

interface TemporaryArcCenter extends TemporaryShape {
  type: 'tmp-arc'
  center: Coordinate
}
interface TemporaryArcRadius extends TemporaryArcCenter {
  radius: number
  startCoord: Coordinate
  startAngle: number
}
interface TemporaryArcShape extends TemporaryArcRadius {
  endCoord: Coordinate
  endAngle: number
  angleDeltaFromStart: number
}

interface TemporarySupplementalLineShapeBase extends TemporaryShape {
  type: 'tmp-supplementalLine'
  start: Coordinate
}
interface TemporarySupplementalLineShape
  extends TemporarySupplementalLineShapeBase,
    TemporaryShape {
  end: Coordinate
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
