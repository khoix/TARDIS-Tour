/**
 * Build step for the console room: the generic structure build plus the contra-rotating
 * rotor rings. The viewer stops calling `tick` under prefers-reduced-motion.
 */

import { type BuiltStructure, buildStructure } from '../../build';
import type { StructureDescription } from '../../structure';
import { describeConsoleRoom } from './describe';
import { CONSOLE_PARAMS, type ConsoleParams } from './params';

export function buildConsoleRoom(
  description: StructureDescription = describeConsoleRoom(),
  params: ConsoleParams = CONSOLE_PARAMS,
): BuiltStructure {
  const { structure, spinners } = buildStructure(description);
  const radiansPerMs = (2 * Math.PI) / (params.ringPeriodSeconds * 1000);
  return {
    ...structure,
    tick(nowMs) {
      for (const { object, primitive } of spinners) {
        object.rotation.y = primitive.spin * radiansPerMs * nowMs;
      }
      return spinners.length > 0;
    },
  };
}
