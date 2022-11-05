import { useRecoilCallback } from 'recoil'
import { activeCoordState, shapeSeedConstraintsState, shapeSeedState } from '../state'
import {
  isArcSeed1ConstrainedByCenterTwoPoints,
  isArcSeed1ConstrainedByThreePoints,
  isArcSeed2ConstrainedByCenterTwoPoints,
  isArcSeed2ConstrainedByThreePoints,
  isCircleSeed1ConstrainedByTwoPointsRadius,
  isCircleSeed2ConstrainedByTwoPointsRadius,
  isCircleSeedConstrainedByTwoPoints,
  isLineSeedConstrainedByStartEnd,
  isRectangleSeedConstrainedByTwoCorners,
} from '../../lib/typeguard'
import { indicatingShapeIdState, pointingCoordState } from '../state/cursorState'
import {
  drawCommandState,
  drawStepState,
  drawTypeState,
  operationModeState,
} from '../state/userOperationState'
import { shapesState } from '../state/shapeState'
import useDrawStep from './useDrawStep'
import { currentSnapshotVersionState, snapshotsState } from '../state/snapshotsState'
import {
  calcCentralAngleFromHorizontalLine,
  calcDistance,
  findLineEquidistantFromTwoPoints,
} from '../../lib/function'

const useDrawing = () => {
  const { goToNextStep, goToFirstStep } = useDrawStep()

  const setShape = useRecoilCallback(
    ({ snapshot, set }) =>
      async (shape: Shape) => {
        const shapes = await snapshot.getPromise(shapesState)
        const snapshotVersion = await snapshot.getPromise(currentSnapshotVersionState)

        set(shapesState, oldValue => [...oldValue, shape])
        set(snapshotsState, oldState => {
          if (oldState.length === snapshotVersion + 1) {
            return [...oldState, [...shapes, shape]]
          } else {
            const newState = [...oldState]
            newState[snapshotVersion + 1] = [...shapes, shape]
            return newState
          }
        })
        set(currentSnapshotVersionState, oldState => oldState + 1)
      },
    []
  )

  const proceedLineDraw = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const pointingCoord = await snapshot.getPromise(pointingCoordState)
        const activeCoord = await snapshot.getPromise(activeCoordState)
        const operationMode = await snapshot.getPromise(operationModeState)
        const drawCommand = await snapshot.getPromise(drawCommandState)
        const drawStep = await snapshot.getPromise(drawStepState)
        const drawType = await snapshot.getPromise(drawTypeState)
        const shapeSeed = await snapshot.getPromise(shapeSeedState)
        const shapes = await snapshot.getPromise(shapesState)
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        if (activeCoord === null) {
          return
        }

        const lineDrawCommand = drawCommand as ShapeDrawCommand<'line'>

        if (lineDrawCommand === 'start-end') {
          const lineDrawStep = drawStep as CommandDrawStep<'line', 'start-end'>

          if (lineDrawStep === 'startPoint') {
            const newLineSeed: LineSeedConstrainedByStartEnd = {
              isSeed: true,
              shape: 'line',
              drawCommand: 'start-end',
              startPoint: { x: activeCoord.x, y: activeCoord.y },
              endPoint: { x: activeCoord.x, y: activeCoord.y },
            }
            set(shapeSeedConstraintsState, newLineSeed)
            await goToNextStep()
          }

          if (lineDrawStep === 'endPoint' && isLineSeedConstrainedByStartEnd(shapeSeed)) {
            const { startPoint, endPoint } = shapeSeed

            const newLine: Line = {
              id: shapes.length,
              type: drawType,
              shape: 'line',
              drawCommand: 'start-end',
              constraints: {
                startPoint: { x: startPoint.x, y: startPoint.y },
                endPoint: { x: endPoint.x, y: endPoint.y },
              },
              computed: {
                startPoint,
                endPoint,
              },
            }

            await setShape(newLine)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }
      },
    [goToFirstStep, goToNextStep, setShape]
  )

  const proceedRectangleDraw = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const pointingCoord = await snapshot.getPromise(pointingCoordState)
        const activeCoord = await snapshot.getPromise(activeCoordState)
        const operationMode = await snapshot.getPromise(operationModeState)
        const drawCommand = await snapshot.getPromise(drawCommandState)
        const drawStep = await snapshot.getPromise(drawStepState)
        const drawType = await snapshot.getPromise(drawTypeState)
        const shapeSeed = await snapshot.getPromise(shapeSeedState)
        const shapes = await snapshot.getPromise(shapesState)
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        if (activeCoord === null) {
          return
        }

        const rectangleDrawCommand = drawCommand as ShapeDrawCommand<'rectangle'>

        if (rectangleDrawCommand === 'two-corners') {
          const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'two-corners'>

          if (rectangleDrawStep === 'corner-1') {
            const newRectangleSeed: RectangleSeedConstrainedByTwoCorners = {
              isSeed: true,
              shape: 'rectangle',
              drawCommand: 'two-corners',
              corner1Point: activeCoord,
              corner2Point: activeCoord,
              upperLeftPoint: activeCoord,
            }

            set(shapeSeedConstraintsState, newRectangleSeed)
            await goToNextStep()
          }

          if (
            rectangleDrawStep === 'corner-2' &&
            isRectangleSeedConstrainedByTwoCorners(shapeSeed)
          ) {
            const { corner1Point, corner2Point } = shapeSeed

            if (corner2Point.x - corner1Point.x === 0 || corner2Point.y - corner1Point.y === 0) {
              return
            }

            const diagonalSlope =
              (corner2Point.y - corner1Point.y) / (corner2Point.x - corner1Point.x)

            let upperLeftPoint: Coordinate
            let upperRightPoint: Coordinate
            let lowerLeftPoint: Coordinate
            let lowerRightPoint: Coordinate
            if (diagonalSlope > 0) {
              // 対角線が右下に向かって引かれている場合

              if (corner1Point.x < corner2Point.x) {
                upperLeftPoint = { x: corner1Point.x, y: corner1Point.y }
                upperRightPoint = { x: corner2Point.x, y: corner1Point.y }
                lowerLeftPoint = { x: corner1Point.x, y: corner2Point.y }
                lowerRightPoint = { x: corner2Point.x, y: corner2Point.y }
              } else {
                upperLeftPoint = { x: corner2Point.x, y: corner2Point.y }
                upperRightPoint = { x: corner1Point.x, y: corner2Point.y }
                lowerLeftPoint = { x: corner2Point.x, y: corner1Point.y }
                lowerRightPoint = { x: corner1Point.x, y: corner1Point.y }
              }
            } else {
              // 対角線が右上に向かって引かれている場合

              if (corner1Point.x < corner2Point.x) {
                upperLeftPoint = { x: corner1Point.x, y: corner2Point.y }
                upperRightPoint = { x: corner2Point.x, y: corner2Point.y }
                lowerLeftPoint = { x: corner1Point.x, y: corner1Point.y }
                lowerRightPoint = { x: corner2Point.x, y: corner1Point.y }
              } else {
                upperLeftPoint = { x: corner2Point.x, y: corner1Point.y }
                upperRightPoint = { x: corner1Point.x, y: corner1Point.y }
                lowerLeftPoint = { x: corner2Point.x, y: corner2Point.y }
                lowerRightPoint = { x: corner1Point.x, y: corner2Point.y }
              }
            }

            const newRectangle: Rectangle = {
              id: shapes.length,
              type: drawType,
              shape: 'rectangle',
              drawCommand: 'two-corners',
              constraints: {
                corner1Point,
                corner2Point,
              },
              computed: {
                upperLeftPoint,
                upperRightPoint,
                lowerLeftPoint,
                lowerRightPoint,
              },
            }

            await setShape(newRectangle)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }

        if (rectangleDrawCommand === 'center-corner') {
          const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'center-corner'>

          if (rectangleDrawStep === 'center') {
            const newRectangleSeed: RectangleSeedConstrainedByCenterCorner = {
              isSeed: true,
              shape: 'rectangle',
              drawCommand: 'center-corner',
              center: activeCoord,
              cornerPoint: activeCoord,
              upperLeftPoint: activeCoord,
            }

            set(shapeSeedConstraintsState, newRectangleSeed)
            await goToNextStep()
          }

          if (rectangleDrawStep === 'corner') {
            const newRectangleSeed = shapeSeed as RectangleSeedConstrainedByCenterCorner
            const { center, cornerPoint } = newRectangleSeed

            if (cornerPoint.x === center.x || cornerPoint.y === center.y) {
              return
            }

            const diagonalSlope = (cornerPoint.y - center.y) / (cornerPoint.x - center.x)

            let upperLeftPoint: Coordinate
            let upperRightPoint: Coordinate
            let lowerLeftPoint: Coordinate
            let lowerRightPoint: Coordinate
            if (diagonalSlope > 0) {
              // 対角線が右下に向かって引かれている場合

              if (center.x < cornerPoint.x) {
                upperLeftPoint = {
                  x: center.x - (cornerPoint.x - center.x),
                  y: center.y - (cornerPoint.y - center.y),
                }
                upperRightPoint = {
                  x: cornerPoint.x,
                  y: center.y - (cornerPoint.y - center.y),
                }
                lowerLeftPoint = {
                  x: center.x - (cornerPoint.x - center.x),
                  y: cornerPoint.y,
                }
                lowerRightPoint = cornerPoint
              } else {
                upperLeftPoint = cornerPoint
                upperRightPoint = {
                  x: center.x + (center.x - cornerPoint.x),
                  y: cornerPoint.y,
                }
                lowerLeftPoint = {
                  x: cornerPoint.x,
                  y: center.y + (center.y - cornerPoint.y),
                }
                lowerRightPoint = {
                  x: center.x + (center.x - cornerPoint.x),
                  y: center.y + (center.y - cornerPoint.y),
                }
              }
            } else {
              // 対角線が右上に向かって引かれている場合

              if (center.x < cornerPoint.x) {
                upperLeftPoint = {
                  x: center.x - (cornerPoint.x - center.x),
                  y: cornerPoint.y,
                }
                upperRightPoint = cornerPoint
                lowerLeftPoint = {
                  x: center.x - (cornerPoint.x - center.x),
                  y: center.y + (center.y - cornerPoint.y),
                }
                lowerRightPoint = {
                  x: cornerPoint.x,
                  y: center.y + (center.y - cornerPoint.y),
                }
              } else {
                upperLeftPoint = {
                  x: cornerPoint.x,
                  y: center.y - (cornerPoint.y - center.y),
                }
                upperRightPoint = {
                  x: center.x + (center.x - cornerPoint.x),
                  y: center.y - (cornerPoint.y - center.y),
                }
                lowerLeftPoint = cornerPoint
                lowerRightPoint = {
                  x: center.x + (center.x - cornerPoint.x),
                  y: cornerPoint.y,
                }
              }
            }

            const newRectangle: Rectangle<CenterCornerConstraints> = {
              id: shapes.length,
              type: drawType,
              shape: 'rectangle',
              drawCommand: 'center-corner',
              constraints: {
                center,
                cornerPoint,
              },
              computed: {
                upperLeftPoint,
                upperRightPoint,
                lowerLeftPoint,
                lowerRightPoint,
              },
            }

            await setShape(newRectangle)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }
      },
    [goToFirstStep, goToNextStep, setShape]
  )

  const proceedCircleDraw = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const pointingCoord = await snapshot.getPromise(pointingCoordState)
        const activeCoord = await snapshot.getPromise(activeCoordState)
        const operationMode = await snapshot.getPromise(operationModeState)
        const drawCommand = await snapshot.getPromise(drawCommandState)
        const drawStep = await snapshot.getPromise(drawStepState)
        const drawType = await snapshot.getPromise(drawTypeState)
        const shapeSeed = await snapshot.getPromise(shapeSeedState)
        const shapes = await snapshot.getPromise(shapesState)
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        if (activeCoord === null) {
          return
        }

        const circleDrawCommand = drawCommand as ShapeDrawCommand<'circle'>

        if (circleDrawCommand === 'center-diameter') {
          const circleDrawStep = drawStep as CommandDrawStep<'circle', 'center-diameter'>

          if (circleDrawStep === 'center') {
            const newCircleSeed: CircleSeedConstrainedByCenterDiameter = {
              isSeed: true,
              shape: 'circle',
              drawCommand: 'center-diameter',
              center: activeCoord,
              diameterStart: activeCoord,
              diameterEnd: activeCoord,
              radius: 0,
            }
            set(shapeSeedConstraintsState, newCircleSeed)
            await goToNextStep()
          }

          if (circleDrawStep === 'diameter') {
            const circleSeed = shapeSeed as CircleSeedConstrainedByCenterDiameter

            const { center, radius } = circleSeed

            const newCircle: Circle<CenterRadiusConstraints> = {
              id: shapes.length,
              type: drawType,
              shape: 'circle',
              drawCommand: 'center-diameter',
              constraints: {
                center,
                radius,
              },
              computed: {
                center,
                radius,
              },
            }

            await setShape(newCircle)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }

        if (circleDrawCommand === 'two-points') {
          const circleDrawStep = drawStep as CommandDrawStep<'circle', 'two-points'>

          if (circleDrawStep === 'point1') {
            const newCircleSeed: CircleSeedConstrainedByTwoPoints = {
              isSeed: true,
              shape: 'circle',
              drawCommand: 'two-points',
              point1: activeCoord,
              point2: activeCoord,
              diameter: 0,
              center: activeCoord,
            }
            set(shapeSeedConstraintsState, newCircleSeed)
            await goToNextStep()
          }

          if (circleDrawStep === 'point2' && isCircleSeedConstrainedByTwoPoints(shapeSeed)) {
            const { point1, point2, center, diameter } = shapeSeed

            const newCircle: Circle<TwoPointsConstraints> = {
              id: shapes.length,
              type: drawType,
              shape: 'circle',
              drawCommand: 'two-points',
              constraints: {
                point1,
                point2,
              },
              computed: {
                center,
                radius: diameter / 2,
              },
            }
            await setShape(newCircle)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }

        if (circleDrawCommand === 'two-points-radius') {
          const circleDrawStep = drawStep as CommandDrawStep<'circle', 'two-points-radius'>

          if (circleDrawStep === 'point1') {
            const newCircleSeed: CircleSeed1ConstrainedByTwoPointsRadius = {
              isSeed: true,
              shape: 'circle',
              drawCommand: 'two-points-radius',
              point1: activeCoord,
              point2: activeCoord,
              distanceBetweenPoints: 0,
              radius: undefined,
              center: undefined,
            }
            set(shapeSeedConstraintsState, newCircleSeed)
            await goToNextStep()
          }

          if (circleDrawStep === 'point2' && isCircleSeed1ConstrainedByTwoPointsRadius(shapeSeed)) {
            const newCircleSeed: CircleSeed2ConstrainedByTwoPointsRadius = {
              ...shapeSeed,
              lineEquidistantFromTwoPoints: findLineEquidistantFromTwoPoints(
                shapeSeed.point1,
                shapeSeed.point2
              ),
              radius: calcDistance(shapeSeed.point1, activeCoord) / 2,
              center: {
                x: (shapeSeed.point1.x + activeCoord.x) / 2,
                y: (shapeSeed.point1.y + activeCoord.y) / 2,
              },
            }
            set(shapeSeedConstraintsState, newCircleSeed)
            await goToNextStep()
          }

          if (circleDrawStep === 'radius' && isCircleSeed2ConstrainedByTwoPointsRadius(shapeSeed)) {
            const { point1, point2, radius, center } = shapeSeed

            const newCircle: Circle<TwoPointsRadiusConstraints> = {
              id: shapes.length,
              type: drawType,
              shape: 'circle',
              drawCommand: 'two-points-radius',
              constraints: {
                point1,
                point2,
                radius,
              },
              computed: {
                center,
                radius,
              },
            }

            await setShape(newCircle)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }
      },
    [goToFirstStep, goToNextStep, setShape]
  )

  const proceedArcDraw = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const pointingCoord = await snapshot.getPromise(pointingCoordState)
        const activeCoord = await snapshot.getPromise(activeCoordState)
        const operationMode = await snapshot.getPromise(operationModeState)
        const drawCommand = await snapshot.getPromise(drawCommandState)
        const drawStep = await snapshot.getPromise(drawStepState)
        const drawType = await snapshot.getPromise(drawTypeState)
        const shapeSeed = await snapshot.getPromise(shapeSeedState)
        const shapes = await snapshot.getPromise(shapesState)
        const indicatingShapeId = await snapshot.getPromise(indicatingShapeIdState)

        if (activeCoord === null) {
          return
        }

        const arcDrawCommand = drawCommand as ShapeDrawCommand<'arc'>

        if (arcDrawCommand === 'center-two-points') {
          const arcDrawStep = drawStep as CommandDrawStep<'arc', 'center-two-points'>

          if (arcDrawStep === 'center') {
            const newArcSeed: ArcSeed1ConstrainedByCenterTwoPoints = {
              isSeed: true,
              shape: 'arc',
              drawCommand: 'center-two-points',
              center: activeCoord,
              startPoint: activeCoord,
              startPointAngle: 0,
              radius: 0,
            }
            set(shapeSeedConstraintsState, newArcSeed)
            await goToNextStep()
          }

          if (arcDrawStep === 'startPoint') {
            if (!isArcSeed1ConstrainedByCenterTwoPoints(shapeSeed)) {
              console.warn('shapeSeed is not ArcCenterTwoPointsSeed2')
              return null
            }

            const newValue: ArcSeed2ConstrainedByCenterTwoPoints = {
              ...shapeSeed,
              endPoint: activeCoord,
              endPointAngle: shapeSeed.startPointAngle,
              angleDeltaFromStart: 0,
            }

            set(shapeSeedConstraintsState, newValue)
            await goToNextStep()
          }

          if (arcDrawStep === 'endPoint') {
            if (!isArcSeed2ConstrainedByCenterTwoPoints(shapeSeed)) {
              console.warn('shapeSeed is not ArcCenterTwoPointsSeed3')
              return
            }

            const {
              center,
              startPoint,
              endPoint,
              startPointAngle,
              endPointAngle,
              angleDeltaFromStart,
              radius,
            } = shapeSeed

            const newArc: Arc<CenterAndTwoPointsConstraints> = {
              id: shapes.length,
              type: drawType,
              shape: 'arc',
              drawCommand: 'center-two-points',
              constraints: {
                center,
                startPoint,
                endPoint,
                angleDeltaFromStart,
              },
              computed: {
                center,
                startPoint,
                endPoint,
                startPointAngle,
                endPointAngle,
                radius,
                angleDeltaFromStart,
              },
            }

            await setShape(newArc)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }

        if (arcDrawCommand === 'three-points') {
          const arcDrawStep = drawStep as CommandDrawStep<'arc', 'three-points'>

          if (arcDrawStep === 'startPoint') {
            const newArcSeed: ArcSeed1ConstrainedThreePoints = {
              isSeed: true,
              shape: 'arc',
              drawCommand: 'three-points',
              startPoint: activeCoord,
              endPoint: activeCoord,
              distance: 0,
            }
            set(shapeSeedConstraintsState, newArcSeed)
            await goToNextStep()
          }

          if (arcDrawStep === 'endPoint') {
            set(shapeSeedConstraintsState, oldValue => {
              if (!isArcSeed1ConstrainedByThreePoints(oldValue)) {
                console.warn('shapeSeed is not ArcThreePointsSeed2')
                return null
              }

              const arcCenter: Coordinate = {
                x: (oldValue.startPoint.x + activeCoord.x) / 2,
                y: (oldValue.startPoint.y + activeCoord.y) / 2,
              }

              const arcStartAngle = calcCentralAngleFromHorizontalLine(
                oldValue.startPoint,
                arcCenter
              )
              const arcEndAngle = calcCentralAngleFromHorizontalLine(activeCoord, arcCenter)

              const angleDeltaFromStart =
                arcStartAngle && arcEndAngle
                  ? arcEndAngle > arcStartAngle
                    ? arcEndAngle - arcStartAngle
                    : 360 - (arcStartAngle - arcEndAngle)
                  : 0

              const newValue: ArcSeed2ConstrainedByThreePoints = {
                ...oldValue,
                endPoint: activeCoord,
                onLinePoint: activeCoord,
                center: arcCenter,
                startPointAngle: arcStartAngle ?? 0,
                endPointAngle: arcEndAngle ?? 0,
                radius: calcDistance(arcCenter, oldValue.startPoint),
                angleDeltaFromStart,
              }

              return newValue
            })
            await goToNextStep()
          }

          if (arcDrawStep === 'onLinePoint') {
            if (!isArcSeed2ConstrainedByThreePoints(shapeSeed)) {
              console.warn('shapeSeed is not ArcThreePointsSeed3')
              return
            }

            const {
              startPoint,
              endPoint,
              onLinePoint,
              startPointAngle,
              endPointAngle,
              center,
              radius,
            } = shapeSeed

            const angleDeltaFromStart =
              endPointAngle > startPointAngle
                ? endPointAngle - startPointAngle
                : 360 - (startPointAngle - endPointAngle)

            const newArcSeed: Arc<ThreePointsConstraints> = {
              id: shapes.length,
              type: drawType,
              shape: 'arc',
              drawCommand: 'three-points',
              constraints: {
                startPoint,
                endPoint,
                onLinePoint,
              },
              computed: {
                center,
                radius,
                startPointAngle,
                endPointAngle,
                startPoint,
                endPoint,
                angleDeltaFromStart,
              },
            }

            await setShape(newArcSeed)
            set(shapeSeedConstraintsState, null)
            await goToFirstStep()
          }
        }
      },
    [goToFirstStep, goToNextStep, setShape]
  )

  return { proceedLineDraw, proceedRectangleDraw, proceedCircleDraw, proceedArcDraw }
}

export default useDrawing
