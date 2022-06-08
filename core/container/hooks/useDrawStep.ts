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
            const lineDrawStep = drawStep as DrawCommandSteps<'line', 'start-end'>

            if (lineDrawStep === 'startPoint') {
              set(drawStepState, 'endPoint')
            }
          }
        }

        if (operationMode === 'circle') {
          const circleDrawCommand = drawCommand as ShapeDrawCommand<'circle'>

          if (circleDrawCommand === 'center-diameter') {
            const circleDrawStep = drawStep as DrawCommandSteps<'circle', 'center-diameter'>

            if (circleDrawStep === 'center') {
              set(drawStepState, 'diameter')
            }
          }
        }

        if (operationMode === 'arc') {
          const arcDrawCommand = drawCommand as ShapeDrawCommand<'arc'>

          if (arcDrawCommand === 'center-two-points') {
            const arcDrawStep = drawStep as DrawCommandSteps<'arc', 'center-two-points'>

            if (arcDrawStep === 'center') {
              set(drawStepState, 'startPoint')
            }

            if (arcDrawStep === 'startPoint') {
              set(drawStepState, 'endPoint')
            }
          }
        }

        if (operationMode === 'supplementalLine') {
          const supplementalLineDrawCommand = drawCommand as ShapeDrawCommand<'supplementalLine'>

          if (supplementalLineDrawCommand === 'start-end') {
            const supplementalLineDrawStep = drawStep as DrawCommandSteps<
              'supplementalLine',
              'start-end'
            >

            if (supplementalLineDrawStep === 'startPoint') {
              set(drawStepState, 'endPoint')
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
        }

        if (operationMode === 'supplementalLine') {
          const supplementalLineDrawCommand = drawCommand as ShapeDrawCommand<'supplementalLine'>

          if (supplementalLineDrawCommand === 'start-end') {
            set(drawStepState, 'startPoint')
          }
        }
      },
    []
  )

  return { goToNextStep, goToFirstStep }
}

export default useDrawStep
