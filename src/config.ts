// src/config.ts
import type { GameConfig, DomElementIds } from './types';

/**
 * Game configuration object for Conway's Game of Life.
 * All parameters are defined here for easy tweaking.
 */
export const CONFIG: Readonly<GameConfig> = {
  canvasWidth: 700, // Adjust as needed, keep it a multiple of cell size for best results
  canvasHeight: 500, // Adjust as needed
  cellColorAlive: '#00e676', // Bright green for live cells
  cellColorDead: '#263238',  // Matches canvas background for "empty" look
  gridLineColor: '#37474f', // Subtle grid lines
  initialGridRows: 50,
  initialGridCols: 70, // Derived from canvasWidth / (canvasWidth/initialGridCols)
  defaultSimulationIntervalMs: 200,
  minSimulationIntervalMs: 50,  // Fastest speed
  maxSimulationIntervalMs: 1000, // Slowest speed
};

/**
 * DOM Element IDs used in the HTML.
 * Centralizes the IDs for easier management.
 */
export const DOM_IDS: Readonly<DomElementIds> = {
  canvas: 'gameOfLifeCanvas',
  startButton: 'startButton',
  stopButton: 'stopButton',
  stepButton: 'stepButton',
  resetButton: 'resetButton',
  clearButton: 'clearButton',
  speedSlider: 'speedSlider',
  generationCount: 'generationCount',
  simulationStatus: 'simulationStatus',
  templateSelector: 'templateSelector',
};
