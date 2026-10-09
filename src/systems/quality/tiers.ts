/**
 * Adaptive quality tiers (Execution 8). Pure logic, no Three.js: what each tier draws, which
 * tier a device starts on, and when sustained slow frames step it down. The viewer applies a
 * tier (src/scene/viewer.ts); the visual state hides the reduced tier's detail parts.
 */

export const QUALITY_TIERS = ['high', 'medium', 'low'] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];

/** Draw-call and triangle ceilings for the overview at a tier (renderer.info, per frame). */
export interface RenderBudget {
  readonly calls: number;
  readonly triangles: number;
}

export interface QualitySettings {
  readonly tier: QualityTier;
  /** Device pixel ratio is capped at this. */
  readonly pixelRatioCap: number;
  /** Key-light shadow map (adds a depth pass over the shadow casters). */
  readonly shadows: boolean;
  readonly shadowMapSize: number;
  /** How many diegetic lights (src/scene/lighting.ts, in priority order) are on. */
  readonly diegeticLights: number;
  /** Ambient motion (the rotor rings). */
  readonly ambientMotion: boolean;
  /** `reduced` hides small detail parts except in the selected room. */
  readonly detail: 'full' | 'reduced';
  readonly budget: RenderBudget;
}

export const QUALITY: Readonly<Record<QualityTier, QualitySettings>> = {
  high: {
    tier: 'high',
    pixelRatioCap: 2,
    shadows: true,
    shadowMapSize: 2048,
    diegeticLights: 6,
    ambientMotion: true,
    detail: 'full',
    budget: { calls: 480, triangles: 85_000 },
  },
  medium: {
    tier: 'medium',
    pixelRatioCap: 1.5,
    shadows: false,
    shadowMapSize: 0,
    diegeticLights: 3,
    ambientMotion: true,
    detail: 'full',
    budget: { calls: 300, triangles: 45_000 },
  },
  low: {
    tier: 'low',
    pixelRatioCap: 1,
    shadows: false,
    shadowMapSize: 0,
    diegeticLights: 0,
    ambientMotion: false,
    detail: 'reduced',
    budget: { calls: 260, triangles: 36_000 },
  },
};

export function isQualityTier(value: unknown): value is QualityTier {
  return (QUALITY_TIERS as readonly unknown[]).includes(value);
}

/** The next tier down, or null at the bottom. */
export function lowerTier(tier: QualityTier): QualityTier | null {
  return QUALITY_TIERS[QUALITY_TIERS.indexOf(tier) + 1] ?? null;
}

export function pixelRatioFor(tier: QualityTier, devicePixelRatio: number): number {
  return Math.min(Math.max(devicePixelRatio, 1), QUALITY[tier].pixelRatioCap);
}

/** What the starting tier is chosen from (all readable before the first frame). */
export interface DeviceProfile {
  readonly devicePixelRatio: number;
  /** Primary pointer is coarse (touch). */
  readonly coarsePointer: boolean;
  readonly viewportWidth: number;
  readonly hardwareConcurrency?: number | undefined;
  /** `navigator.deviceMemory` in GB, where the browser reports it. */
  readonly deviceMemory?: number | undefined;
}

/** Narrow viewports get the compact layout; they start below the high tier. */
export const COMPACT_WIDTH_PX = 720;

/**
 * Starting tier: low for very weak hardware (≤ 2 cores or ≤ 2 GB), medium for touch or compact
 * devices (mobile GPUs, high pixel ratios), high otherwise. Frame times then step it down.
 */
export function initialTier(d: DeviceProfile): QualityTier {
  if ((d.hardwareConcurrency ?? 8) <= 2 || (d.deviceMemory ?? 8) <= 2) return 'low';
  if (d.coarsePointer || d.viewportWidth <= COMPACT_WIDTH_PX) return 'medium';
  return 'high';
}

export interface QualityOptions {
  /** A tier from `?quality=high|medium|low`, which pins it; null to choose by device. */
  readonly pinned: QualityTier | null;
  /** Whether sustained slow frames step the tier down. */
  readonly auto: boolean;
  /** Dev-only stats overlay. */
  readonly stats: boolean;
}

/**
 * Reads `?quality=` and `?stats`. A pinned tier never auto-downgrades. Test runs (`?test`) do not
 * either unless `quality=auto`: headless frame times are software rendering, not a device.
 */
export function parseQualityOptions(search: string, dev: boolean): QualityOptions {
  const params = new URLSearchParams(search);
  const q = params.get('quality');
  const pinned = isQualityTier(q) ? q : null;
  const auto = pinned === null && (q === 'auto' || !params.has('test'));
  return { pinned, auto, stats: dev || params.has('stats') };
}

export interface MonitorOptions {
  /** Frames slower than this (ms) are slow; 33.3 ms is 30 frames per second. */
  readonly targetMs: number;
  /** Consecutive-frame samples judged together. */
  readonly window: number;
  /** Share of the window that must be slow to step down. */
  readonly slowShare: number;
  /** Quiet period after a change (ms) while the new tier settles. */
  readonly cooldownMs: number;
  /** Intervals longer than this (ms) are stalls or background tabs, not frame times. */
  readonly ignoreAboveMs: number;
}

export const DEFAULT_MONITOR: MonitorOptions = {
  targetMs: 1000 / 30,
  window: 40,
  slowShare: 0.75,
  cooldownMs: 3000,
  ignoreAboveMs: 1000,
};

/**
 * Watches frame-to-frame intervals of continuous rendering (the viewer renders on demand, so it
 * samples only frames rendered back to back) and asks for a downgrade when most of a full
 * window is slow. It never upgrades: a tier that was too slow once stays down for the session,
 * so the picture never oscillates.
 */
export class FrameTimeMonitor {
  private samples: number[] = [];
  private quietUntil = -Infinity;
  private ema = NaN;

  constructor(private readonly options: MonitorOptions = DEFAULT_MONITOR) {}

  /** Smoothed frame time (ms) of recent samples; NaN before any. */
  get frameMs(): number {
    return this.ema;
  }

  /** Records one interval; true when the tier should step down now. */
  sample(intervalMs: number, nowMs: number): boolean {
    const o = this.options;
    if (!(intervalMs > 0) || intervalMs > o.ignoreAboveMs) return false;
    this.ema = Number.isNaN(this.ema) ? intervalMs : this.ema * 0.9 + intervalMs * 0.1;
    if (nowMs < this.quietUntil) return false;
    this.samples.push(intervalMs);
    if (this.samples.length > o.window) this.samples.shift();
    if (this.samples.length < o.window) return false;
    const slow = this.samples.filter((ms) => ms > o.targetMs).length;
    if (slow < o.slowShare * o.window) return false;
    this.restart(nowMs);
    return true;
  }

  /** Clears the window and starts the quiet period (call when the tier changes). */
  restart(nowMs: number): void {
    this.samples = [];
    this.quietUntil = nowMs + this.options.cooldownMs;
  }
}
