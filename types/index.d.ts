
type ShapeType = 'line' | 'circle'

type OperationMode = 'circle:point-center' | 'circle:fix-radius'

interface Shape {
  type: string
}

interface TemporaryShape {
  type: string
}

interface LineShape extends Shape {
  type: 'line'
  start: { x: number, y: number }
  end: { x: number, y: number }
}

interface CircleShape extends Shape {
  type: 'circle'
  center: { x: number, y: number }
  radius: number
}

interface TemporaryCircleShape extends TemporaryShape {
  type: 'temporary-circle'
  center: { x: number, y: number }
  radius: number
  diameterStart: { x: number, y: number }
  diameterEnd: { x: number, y: number }
}
