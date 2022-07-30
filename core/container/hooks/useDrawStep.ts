import { useRecoilCallback } from 'recoil'
import { drawCommandState, drawStepState, operationModeState } from '../states'
import { drawStepList } from '../../lib/constants'
import {
  isValidArcCommand,
  isValidCircleCommand,
  isValidLineCommand,
  isValidRectangleCommand,
} from '../../lib/typeguard'

const useDrawStep = () => {
  const goToNextStep = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const operationMode = await snapshot.getPromise(operationModeState)
        const drawCommand = await snapshot.getPromise(drawCommandState)
        const drawStep = await snapshot.getPromise(drawStepState)

        const goIfValidIndex = (stepList: ReadonlyArray<DrawStep>, currentStepIndex: number) => {
          if (currentStepIndex === -1) {
            console.warn(`${drawStep} is not found in ${drawCommand}`)
          } else if (currentStepIndex === stepList.length - 1) {
            console.warn(`${drawStep} is last step of ${drawCommand}`)
          } else {
            set(drawStepState, stepList[currentStepIndex + 1])
          }
        }

        if (drawStep === null) {
          return
        }

        if (operationMode === 'line' && isValidLineCommand(drawCommand)) {
          if (drawCommand === 'start-end') {
            const lineDrawStep = drawStep as CommandDrawStep<'line', 'start-end'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(lineDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
          }
          return
        }

        if (operationMode === 'rectangle' && isValidRectangleCommand(drawCommand)) {
          if (drawCommand === 'two-corners') {
            const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'two-corners'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(rectangleDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
          }

          if (drawCommand === 'center-corner') {
            const rectangleDrawStep = drawStep as CommandDrawStep<'rectangle', 'center-corner'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(rectangleDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
          }
          return
        }

        if (operationMode === 'circle' && isValidCircleCommand(drawCommand)) {
          if (drawCommand === 'center-diameter') {
            const circleDrawStep = drawStep as CommandDrawStep<'circle', 'center-diameter'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(circleDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
          }

          if (drawCommand === 'two-points') {
            const circleDrawStep = drawStep as CommandDrawStep<'circle', 'two-points'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(circleDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
          }

          if (drawCommand === 'two-points-radius') {
            const circleDrawStep = drawStep as CommandDrawStep<'circle', 'two-points-radius'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(circleDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
          }
          return
        }

        if (operationMode === 'arc' && isValidArcCommand(drawCommand)) {
          if (drawCommand === 'center-two-points') {
            const arcDrawStep = drawStep as CommandDrawStep<'arc', 'center-two-points'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(arcDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
          }

          if (drawCommand === 'three-points') {
            const arcDrawStep = drawStep as CommandDrawStep<'arc', 'three-points'>
            const stepList = drawStepList[operationMode][drawCommand]

            const currentStepIndex = stepList.indexOf(arcDrawStep)
            goIfValidIndex(stepList, currentStepIndex)
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

        if (operationMode === 'line' && isValidLineCommand(drawCommand)) {
          set(drawStepState, drawStepList[operationMode][drawCommand][0])
          return
        }

        if (operationMode === 'rectangle' && isValidRectangleCommand(drawCommand)) {
          set(drawStepState, drawStepList[operationMode][drawCommand][0])
          return
        }

        if (operationMode === 'circle' && isValidCircleCommand(drawCommand)) {
          set(drawStepState, drawStepList[operationMode][drawCommand][0])
          return
        }

        if (operationMode === 'arc' && isValidArcCommand(drawCommand)) {
          set(drawStepState, drawStepList[operationMode][drawCommand][0])
        }
      },
    []
  )

  return { goToNextStep, goToFirstStep }
}

export default useDrawStep
