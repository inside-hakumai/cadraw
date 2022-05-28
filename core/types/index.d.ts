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

interface CoordinateWithDistance extends Coordinate {
  distance: number
}

interface Shape {
  type: string
  id: number
  approximatedCoords: Coordinate[]
}

interface Line {
  start: Coordinate
  end: Coordinate
}

interface TemporaryShape {
  type: string
}

interface LineShape extends Shape, Line {
  type: 'line'
}

interface CircleShape extends Shape {
  type: 'circle'
  center: Coordinate
  radius: number
}

interface TemporaryLineShape extends TemporaryShape, Line {
  type: 'temporary-line'
}

interface TemporaryCircleShape extends TemporaryShape {
  type: 'temporary-circle'
  center: Coordinate
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
