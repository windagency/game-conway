// src/input.ts
import type { GameState, Pattern } from './types';
import { DOM_IDS, CONFIG } from './config';
import { getCellCoordinatesFromClick } from './renderer';
import * as Patterns from './patterns'; // Assuming patterns are defined in patterns.ts

/**
 * Sets up event listeners for UI controls and canvas interactions.
 * @param gameStateRef - A mutable reference to the game state.
 * @param onStart - Callback to start the simulation.
 * @param onStop - Callback to stop the simulation.
 * @param onStep - Callback to advance one generation.
 * @param onRandomizeGrid - Callback to generate a new random grid.
 * @param onClearGrid - Callback to clear the grid.
 * @param onCellToggle - Callback to toggle a cell's state: (row, col, drawMode) => void
 * @param onSpeedChange - Callback for speed slider change: (interval: number) => void
 * @param onLoadPattern - Callback to load a pattern: (pattern: Pattern) => void
 */
export function setupInputHandlers(
  gameStateRef: { current: GameState }, // Use a ref object to share mutable state
  onStart: () => void,
  onStop: () => void,
  onStep: () => void,
  onRandomizeGrid: () => void,
  onClearGrid: () => void,
  onCellToggle: (row: number, col: number, explicitState?: 0 | 1) => void,
  onSpeedChange: (interval: number) => void,
  onLoadPattern: (pattern: Pattern) => void
): void {
  const startButton = document.getElementById(DOM_IDS.startButton) as HTMLButtonElement;
  const stopButton = document.getElementById(DOM_IDS.stopButton) as HTMLButtonElement;
  const stepButton = document.getElementById(DOM_IDS.stepButton) as HTMLButtonElement;
  const resetButton = document.getElementById(DOM_IDS.resetButton) as HTMLButtonElement;
  const clearButton = document.getElementById(DOM_IDS.clearButton) as HTMLButtonElement;
  const speedSlider = document.getElementById(DOM_IDS.speedSlider) as HTMLInputElement;
  const canvas = document.getElementById(DOM_IDS.canvas) as HTMLCanvasElement;
  const templateSelector = document.getElementById(DOM_IDS.templateSelector) as HTMLSelectElement;

  if (!startButton || !stopButton || !stepButton || !resetButton || !clearButton || !speedSlider || !canvas || !templateSelector) {
    console.error("Input Handler Error: One or more control elements not found.");
    return;
  }

  startButton.addEventListener('click', () => {
    onStart();
    updateButtonStates(gameStateRef.current.status, startButton, stopButton, stepButton, clearButton, resetButton, templateSelector);
  });

  stopButton.addEventListener('click', () => {
    onStop();
    updateButtonStates(gameStateRef.current.status, startButton, stopButton, stepButton, clearButton, resetButton, templateSelector);
  });

  stepButton.addEventListener('click', () => {
    if (gameStateRef.current.status === 'paused') { // Only step if paused
      onStep();
    }
  });

  resetButton.addEventListener('click', () => {
    onRandomizeGrid();
    updateButtonStates(gameStateRef.current.status, startButton, stopButton, stepButton, clearButton, resetButton, templateSelector);
  });

  clearButton.addEventListener('click', () => {
    onClearGrid();
    updateButtonStates(gameStateRef.current.status, startButton, stopButton, stepButton, clearButton, resetButton, templateSelector);
  });

  speedSlider.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    // Slider value is inverted: smaller value means faster (shorter interval)
    const interval = CONFIG.maxSimulationIntervalMs - parseFloat(target.value) + CONFIG.minSimulationIntervalMs;
    onSpeedChange(interval);
  });
  // Set initial slider value display correctly
  speedSlider.value = (CONFIG.maxSimulationIntervalMs - gameStateRef.current.simulationInterval + CONFIG.minSimulationIntervalMs).toString();


  // Canvas click and drag handling
  let isMouseDown = false;

  canvas.addEventListener('mousedown', (event) => {
    if (gameStateRef.current.status !== 'paused') return; // Only draw when paused
    isMouseDown = true;
    const canvasRect = canvas.getBoundingClientRect();
    const cellCoords = getCellCoordinatesFromClick(canvasRect, event.clientX, event.clientY, gameStateRef.current.numRows, gameStateRef.current.numCols);
    if (cellCoords) {
      // Determine draw mode on first click of a drag
      const currentCellState = gameStateRef.current.grid?.[cellCoords.row]?.[cellCoords.col];
      gameStateRef.current.drawMode = currentCellState === 1 ? 0 : 1; // Toggle based on first cell clicked
      onCellToggle(cellCoords.row, cellCoords.col, gameStateRef.current.drawMode);
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!isMouseDown || gameStateRef.current.status !== 'paused') return;
    const canvasRect = canvas.getBoundingClientRect();
    const cellCoords = getCellCoordinatesFromClick(canvasRect, event.clientX, event.clientY, gameStateRef.current.numRows, gameStateRef.current.numCols);
    if (cellCoords) {
      // Check if cell state is already what we're drawing to avoid redundant toggles
      if (gameStateRef.current.grid?.[cellCoords.row]?.[cellCoords.col] !== gameStateRef.current.drawMode) {
        onCellToggle(cellCoords.row, cellCoords.col, gameStateRef.current.drawMode);
      }
    }
  });

  canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  canvas.addEventListener('mouseleave', () => { // Stop drawing if mouse leaves canvas
    isMouseDown = false;
  });

  // Template loading
  templateSelector.addEventListener('change', (event) => {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue && Patterns.PRESET_PATTERNS[selectedValue]) {
      onLoadPattern(Patterns.PRESET_PATTERNS[selectedValue]);
      // Reset selector after loading to allow re-selection of same pattern
      (event.target as HTMLSelectElement).value = "";
    }
  });


  // Initial button states
  updateButtonStates(gameStateRef.current.status, startButton, stopButton, stepButton, clearButton, resetButton, templateSelector);
}

/**
 * Updates the enabled/disabled state of control buttons based on simulation status.
 */
export function updateButtonStates(
  status: GameState['status'],
  startButton: HTMLButtonElement,
  stopButton: HTMLButtonElement,
  stepButton: HTMLButtonElement,
  clearButton: HTMLButtonElement,
  resetButton: HTMLButtonElement,
  templateSelector: HTMLSelectElement
): void {
  startButton.disabled = status === 'running';
  stopButton.disabled = status !== 'running';
  stepButton.disabled = status === 'running';
  clearButton.disabled = status === 'running';
  resetButton.disabled = status === 'running';
  templateSelector.disabled = status === 'running';
}
