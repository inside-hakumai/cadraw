
type ShapeType = 'line' | 'circle'
type OperationMode = 'line:point-start' | 'line:point-end' | 'circle:point-center' | 'circle:fix-radius'

interface Coordinate {
  x: number,
  y: number
}

interface Shape {
  type: string
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
