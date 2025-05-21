// src/patterns.ts
import type { Pattern } from './types';

export const PRESET_PATTERNS: Record<string, Pattern> = {
  glider: {
    name: 'Glider',
    data: [
      [0, 1], [1, 2], [2, 0], [2, 1], [2, 2]
    ],
    width: 3,
    height: 3,
  },
  lwss: { // Light-Weight Spaceship
    name: 'LWSS',
    data: [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 0], [1, 4],
      [2, 4],
      [3, 0], [3, 3]
    ],
    width: 5,
    height: 4,
  },
  pulsar: {
    name: 'Pulsar',
    data: [
      // Top-left quadrant
      [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
      [2, 0], [2, 5], [2, 7], [2, 12],
      [3, 0], [3, 5], [3, 7], [3, 12],
      [4, 0], [4, 5], [4, 7], [4, 12],
      [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
      // Mirror for other quadrants (Pulsar is symmetric)
      // Top-right quadrant (mirrored horizontally around col 6)
      [0, 12 - 2], [0, 12 - 3], [0, 12 - 4],
      // Bottom-left quadrant (mirrored vertically around row 6)
      [12 - 0, 2], [12 - 0, 3], [12 - 0, 4], [12 - 0, 8], [12 - 0, 9], [12 - 0, 10],
      [12 - 2, 0], [12 - 2, 5], [12 - 2, 7], [12 - 2, 12],
      [12 - 3, 0], [12 - 3, 5], [12 - 3, 7], [12 - 3, 12],
      [12 - 4, 0], [12 - 4, 5], [12 - 4, 7], [12 - 4, 12],
      [12 - 5, 2], [12 - 5, 3], [12 - 5, 4], [12 - 5, 8], [12 - 5, 9], [12 - 5, 10],
    ],
    width: 13,
    height: 13,
  },
  gosperGliderGun: {
    name: 'Gosper Glider Gun',
    data: [
      [0, 24],
      [1, 22], [1, 24],
      [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
      [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35],
      [4, 0], [4, 1], [4, 10], [4, 16], [4, 20], [4, 21],
      [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17], [5, 22], [5, 24],
      [6, 10], [6, 16], [6, 24],
      [7, 11], [7, 15],
      [8, 12], [8, 13]
    ],
    width: 36,
    height: 9,
  }
  // Add more patterns here
};
