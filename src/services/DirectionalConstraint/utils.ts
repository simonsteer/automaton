import range from 'lodash/range'
import { Constraint } from './types'

export const unpackOffsets = (offsets: Constraint['offsets']) =>
  Object.keys(offsets).reduce(
    (acc, key) => {
      const nums: number[] = []

      const offsetRanges = offsets[key as keyof Constraint['offsets']]
      offsetRanges.forEach(offsetRange =>
        nums.push(
          ...(Array.isArray(offsetRange)
            ? range(offsetRange[0], offsetRange[1] + 1)
            : [offsetRange])
        )
      )
      acc[key as keyof Constraint['offsets']].push(...nums)

      return acc
    },
    { x: [] as number[], y: [] as number[] }
  )
