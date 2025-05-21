// src/types.ts

/** Represents the state of a single cell (0 for dead, 1 for alive). */
export type CellState = 0 | 1;

/** Represents the 2D grid of cells. */
export type Grid = CellState[][];

/** Game simulation status. */
export type SimulationStatus = 'running' | 'paused' | 'stopped';

/**
 * Defines the overall state of the Conway's Game of Life simulation.
 */
export interface GameState {
  /** The current generation of the grid. */
  grid: Grid;
  /** The number of rows in the grid. */
  readonly numRows: number;
  /** The number of columns in the grid. */
  readonly numCols: number;
  /** Current generation count. */
  generation: number;
  /** Current status of the simulation (e.g., running, paused). */
  status: SimulationStatus;
  /** Interval in milliseconds for simulation steps when running. */
  simulationInterval: number;
  /** ID of the interval timer for the simulation loop. Null if not running. */
  timerId: number | null;
  /** Flag to indicate if the user is currently drawing on the grid. */
  isDrawing: boolean;
  /** The state to draw when clicking/dragging (alive or dead). */
  drawMode: CellState;
}

/**
 * Configuration settings for the Game of Life simulation.
 * All properties are readonly to prevent accidental modification.
 */
export interface GameConfig {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly cellColorAlive: string;
  readonly cellColorDead: string;
  readonly gridLineColor: string;
  readonly initialGridRows: number;
  readonly initialGridCols: number;
  readonly defaultSimulationIntervalMs: number; // ms between generations
  readonly minSimulationIntervalMs: number;
  readonly maxSimulationIntervalMs: number;
}

/**
 * Defines the string IDs for DOM elements used by the game UI.
 */
export interface DomElementIds {
  readonly canvas: string;
  readonly startButton: string;
  readonly stopButton: string;
  readonly stepButton: string;
  readonly resetButton: string; // For randomizing
  readonly clearButton: string;
  readonly speedSlider: string;
  readonly generationCount: string;
  readonly simulationStatus: string;
  readonly templateSelector: string;
}

/**
 * Represents a pre-defined pattern that can be loaded onto the grid.
 * The pattern is an array of [row, col] coordinates for live cells,
 * relative to a top-left anchor point on the grid.
 */
export interface Pattern {
  readonly name: string;
  readonly data: Array<[number, number]>; // Array of [row, col] offsets for live cells
  readonly width: number; // Approximate width of the pattern for centering
  readonly height: number; // Approximate height of the pattern for centering
}
