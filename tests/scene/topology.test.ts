import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { getTransform } from '../../src/data/layout';
import { connectorLegs, legLength, roomBounds, walkPoint } from '../../src/scene/topology';

describe('topology view geometry', () => {
  it('derives room bounds from the floor centre and size', () => {
    const t = getTransform('L-01');
    if (!t) throw new Error('no L-01 transform');
    const b = roomBounds(t);
    expect(b.min[1]).toBe(t.position[1]);
    expect(b.max[1] - b.min[1]).toBe(t.size[1]);
    expect(b.max[0] - b.min[0]).toBe(t.size[0]);
    expect((b.min[2] + b.max[2]) / 2).toBe(t.position[2]);
  });

  it.each(V1_CONNECTIONS.map((c) => [c.id, c] as const))(
    '%s is drawn as contiguous axis-aligned legs between its rooms',
    (_id, c) => {
      const a = getTransform(c.from.room);
      const b = getTransform(c.to.room);
      if (!a || !b) throw new Error('connection endpoint has no transform');
      const start = walkPoint(a);
      const end = walkPoint(b);
      const legs = connectorLegs(start, end);
      expect(legs.length).toBeGreaterThan(0);
      expect(legs[0]?.from).toEqual(start);
      expect(legs.at(-1)?.to).toEqual(end);
      legs.forEach((leg, i) => {
        expect(legLength(leg)).toBeGreaterThan(0);
        const axisIndex = { x: 0, y: 1, z: 2 }[leg.axis];
        for (let k = 0; k < 3; k++) {
          if (k !== axisIndex) expect(leg.to[k]).toBe(leg.from[k]);
        }
        if (i > 0) expect(leg.from).toEqual(legs[i - 1]?.to);
      });
    },
  );

  it('draws a purely vertical edge as one Y leg', () => {
    expect(connectorLegs([0, 0, 0], [0, -5, 0])).toEqual([
      { from: [0, 0, 0], to: [0, -5, 0], axis: 'y' },
    ]);
  });
});
