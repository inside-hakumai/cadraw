import { useRecoilCallback } from 'recoil'
import { drawCommandState, drawStepState, operationModeState } from '../states'

const useDrawStep = () => {
  const goToNextStep = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const operationMode = await snapshot.getPromise(operationModeState)
        const drawCommand = await snapshot.getPromise(drawCommandState)
        const drawStep = await snapshot.getPromise(drawStepState)

        if (operationMode === 'line') {
          const lineDrawCommand = drawCommand as ShapeDrawCommand<'line'>

          if (lineDrawCommand === 'start-end') {
            const lineDrawStep = drawStep as CommandDrawStep<'line', 'start-end'>

            if (lineDrawStep === 'startPoint') {
              set(drawStepState, 'endPoint')
            }
          }
        }

        if (operationMode === 'rectangle') {
          const rectangleDrawCommand = drawCommand as ShapeDrawCommand<'rectangle'>

          if (rectangleDrawCommand === 'two-corners') {
            const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'two-corners'>

            if (rectangleDrawStep === 'corner-1') {
              set(drawStepState, 'corner-2')
            }
          }

          if (rectangleDrawCommand === 'center-corner') {
            const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'center-corner'>

            if (rectangleDrawStep === 'center') {
              set(drawStepState, 'corner')
            }
          }
        }

        if (operationMode === 'circle') {
          const circleDrawCommand = drawCommand as ShapeDrawCommand<'circle'>

          if (circleDrawCommand === 'center-diameter') {
            const circleDrawStep = drawStep as CommandDrawStep<'circle', 'center-diameter'>

            if (circleDrawStep === 'center') {
              set(drawStepState, 'diameter')
            }
          }
        }

        if (operationMode === 'arc') {
          const arcDrawCommand = drawCommand as ShapeDrawCommand<'arc'>

          if (arcDrawCommand === 'center-two-points') {
            const arcDrawStep = drawStep as CommandDrawStep<'arc', 'center-two-points'>

            if (arcDrawStep === 'center') {
              set(drawStepState, 'startPoint')
            }

            if (arcDrawStep === 'startPoint') {
              set(drawStepState, 'endPoint')
            }
          }

          if (arcDrawCommand === 'three-points') {
            const arcDrawStep = drawStep as CommandDrawStep<'arc', 'three-points'>

            if (arcDrawStep === 'startPoint') {
              set(drawStepState, 'endPoint')
            }

            if (arcDrawStep === 'endPoint') {
              set(drawStepState, 'onLinePoint')
            }
          }
        }
      },
    []
  )

  const goToFirstStep = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const operationMode = await snapshot.getPromise(operationModeState)
        const drawCommand = await snapshot.getPromise(drawCommandState)

        if (operationMode === 'line') {
          const lineDrawCommand = drawCommand as ShapeDrawCommand<'line'>

          if (lineDrawCommand === 'start-end') {
            set(drawStepState, 'startPoint')
          }
        }

        if (operationMode === 'rectangle') {
          const rectangleDrawCommand = drawCommand as ShapeDrawCommand<'rectangle'>

          if (rectangleDrawCommand === 'two-corners') {
            set(drawStepState, 'corner-1')
          }

          if (rectangleDrawCommand === 'center-corner') {
            set(drawStepState, 'center')
          }
        }

        if (operationMode === 'circle') {
          const circleDrawCommand = drawCommand as ShapeDrawCommand<'circle'>

          if (circleDrawCommand === 'center-diameter') {
            set(drawStepState, 'center')
          }
        }

        if (operationMode === 'arc') {
          const arcDrawCommand = drawCommand as ShapeDrawCommand<'arc'>

          if (arcDrawCommand === 'center-two-points') {
            set(drawStepState, 'center')
          }

          if (arcDrawCommand === 'three-points') {
            set(drawStepState, 'startPoint')
          }
        }
      },
    []
  )

  return { goToNextStep, goToFirstStep }
}

export default useDrawStep
