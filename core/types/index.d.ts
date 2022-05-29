type ShapeType = 'line' | 'circle'
type OperationMode =
  | 'line:point-start'
  | 'line:point-end'
  | 'circle:point-center'
  | 'circle:fix-radius'
type SnapType = 'gridIntersection' | 'circleCenter' | 'circumference' | 'lineEdge'

interface Coordinate {
  x: number
  y: number
}

interface SnappingCoordCandidate extends Coordinate {
  priority: number
  snapInfo: SnapInfo
}

interface SnappingCoordinate extends Coordinate {
  snapInfoList: SnapInfo[]
}

interface ShapeSeed {
  type: string
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

interface Shape {
  type: 'circle' | 'line'
  id: number
}

interface LineShape extends Shape, LineShapeSeed {
  type: 'line'
}

interface CircleShape extends Shape, CircleShapeSeed {
  type: 'circle'
}

interface TemporaryShapeBase extends ShapeSeed {
  type: 'temporary-line' | 'temporary-circle'
}

interface TemporaryLineShapeBase extends TemporaryShapeBase {
  type: 'temporary-line'
  start: Coordinate
}

interface TemporaryCircleShapeBase extends TemporaryShape {
  type: 'temporary-circle'
  center: Coordinate
}

interface TemporaryShape extends ShapeSeed {
  type: 'temporary-line' | 'temporary-circle'
}

interface TemporaryLineShape extends TemporaryLineShapeBase, TemporaryShape {
  end: Coordinate
}

interface TemporaryCircleShape extends TemporaryCircleShapeBase, TemporaryShape {
  radius: number
  diameterStart: Coordinate
  diameterEnd: Coordinate
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
