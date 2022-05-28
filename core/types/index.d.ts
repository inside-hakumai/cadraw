type ShapeType = 'line' | 'circle'
type OperationMode =
  | 'line:point-start'
  | 'line:point-end'
  | 'circle:point-center'
  | 'circle:fix-radius'

interface Coordinate {
  x: number
  y: number
}

interface SnappingCoordinate extends Coordinate {
  // distance: number
  priority: number
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
  approximatedCoords: Coordinate[]
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

interface CoordInfo {
  type: 'gridIntersection' | 'circleCenter' | 'circumference' | 'lineEdge'
}

interface CoordInfoGridIntersection extends CoordInfo {
  type: 'gridIntersection'
}

interface ShapeRelatedCoordInfo extends CoordInfo {
  targetShapeId: number
}

interface CoordInfoCircleCenter extends ShapeRelatedCoordInfo {
  type: 'circleCenter'
  targetShapeId: number
}

interface CoordInfoCircumference extends ShapeRelatedCoordInfo {
  type: 'circumference'
  targetShapeId: number
}

interface CoordInfoLineEdge extends ShapeRelatedCoordInfo {
  type: 'lineEdge'
  targetShapeId: number
}
