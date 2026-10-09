/**
 * Lazy entry of the Journey hero rooms (Execution 5). src/main.ts imports this module with a
 * dynamic `import()` after the first frame, so the greybox shells give a usable view first
 * and the hero detail arrives in its own chunk.
 */

import { type BuiltDressing, buildDressing } from '../../build';
import { describeHeroRooms } from './describe';

export function buildHeroRooms(): BuiltDressing {
  return buildDressing(describeHeroRooms());
}
