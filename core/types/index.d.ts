
type ShapeType = 'line' | 'circle'
type OperationMode = 'line:point-start' | 'line:point-end' | 'circle:point-center' | 'circle:fix-radius'

interface Coordinate {
  x: number,
  y: number
}

interface Shape {
  type: string
  id: number
  approximatedCoords: Coordinate[]
}

interface TemporaryShape {
  type: string
}

interface LineShape extends Shape {
  type: 'line'
  start: Coordinate
  end: Coordinate
}

interface CircleShape extends Shape {
  type: 'circle'
  center: Coordinate
  radius: number
}

interface TemporaryLineShape extends TemporaryShape {
  type: 'temporary-line'
  start: Coordinate
  end: Coordinate
}

interface TemporaryCircleShape extends TemporaryShape {
  type: 'temporary-circle'
  center: Coordinate
  radius: number
  diameterStart: Coordinate
  diameterEnd: Coordinate
}

interface CoordInfo {
  type: 'gridIntersection' | 'circleCenter' | 'circumference'
}

interface CoordInfoGridIntersection extends CoordInfo {
  type: 'gridIntersection'
}

interface CoordInfoCircleCenter extends CoordInfo {
  type: 'circleCenter'
  targetShapeId: number
}

interface CoordInfoCircumference extends CoordInfo {
  type: 'circumference'
  targetShapeId: number
}
