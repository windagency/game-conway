// src/renderer.ts
import type { GameState, Grid } from './types';
import { CONFIG, DOM_IDS } from './config';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let generationCountEl: HTMLElement | null = null;
let simulationStatusEl: HTMLElement | null = null;

let CELL_WIDTH: number = 0;
let CELL_HEIGHT: number = 0;

/**
 * Initializes the renderer, caching DOM elements and canvas context.
 * Calculates cell dimensions based on canvas and grid size.
 * @param gameState - The initial game state to determine grid dimensions.
 * @throws Error if canvas element or context cannot be found.
 */
export function initializeRenderer(gameState: GameState): void {
  canvas = document.getElementById(DOM_IDS.canvas) as HTMLCanvasElement;
  if (!canvas) throw new Error(`Canvas element with ID "${DOM_IDS.canvas}" not found.`);

  ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D rendering context not available.');

  generationCountEl = document.getElementById(DOM_IDS.generationCount);
  simulationStatusEl = document.getElementById(DOM_IDS.simulationStatus);

  // Set canvas physical dimensions
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;

  // Calculate cell dimensions
  CELL_WIDTH = CONFIG.canvasWidth / gameState.numCols;
  CELL_HEIGHT = CONFIG.canvasHeight / gameState.numRows;

  if (!generationCountEl || !simulationStatusEl) {
    console.warn('Renderer Warning: Status display elements not found.');
  }
}

/**
 * Draws the grid lines on the canvas.
 * @param activeCtx - The active 2D rendering context.
 * @param numRows - Number of rows in the grid.
 * @param numCols - Number of columns in the grid.
 */
function drawGridLines(activeCtx: CanvasRenderingContext2D, numRows: number, numCols: number): void {
  activeCtx.strokeStyle = CONFIG.gridLineColor;
  activeCtx.lineWidth = 0.5; // Thin lines

  // Horizontal lines
  for (let i = 0; i <= numRows; i++) {
    activeCtx.beginPath();
    activeCtx.moveTo(0, i * CELL_HEIGHT);
    activeCtx.lineTo(CONFIG.canvasWidth, i * CELL_HEIGHT);
    activeCtx.stroke();
  }

  // Vertical lines
  for (let j = 0; j <= numCols; j++) {
    activeCtx.beginPath();
    activeCtx.moveTo(j * CELL_WIDTH, 0);
    activeCtx.lineTo(j * CELL_WIDTH, CONFIG.canvasHeight);
    activeCtx.stroke();
  }
}

/**
 * Draws the cells on the grid.
 * @param activeCtx - The active 2D rendering context.
 * @param grid - The current grid state.
 */
function drawCells(activeCtx: CanvasRenderingContext2D, grid: Grid): void {
  const numRows = grid.length;
  const numCols = grid[0]?.length || 0;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (grid?.[row]?.[col] === 1) { // If cell is alive
        activeCtx.fillStyle = CONFIG.cellColorAlive;
        activeCtx.fillRect(col * CELL_WIDTH, row * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
      } else {
        activeCtx.fillStyle = CONFIG.cellColorDead;
        activeCtx.fillRect(col * CELL_WIDTH, row * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
      }
    }
  }
}

/**
 * Updates the status display elements (generation count, simulation status).
 * @param gameState - The current game state.
 */
function updateStatusDisplay(gameState: GameState): void {
  if (generationCountEl) {
    generationCountEl.textContent = gameState.generation.toString();
  }
  if (simulationStatusEl) {
    simulationStatusEl.textContent = gameState.status.charAt(0).toUpperCase() + gameState.status.slice(1);
  }
}

/**
 * Main render function to draw the entire game state.
 * @param gameState - The current game state.
 */
export function render(gameState: GameState): void {
  if (!ctx || !canvas) {
    console.error('Render Error: Renderer not initialized.');
    return;
  }

  // Clear canvas (or fill with dead cell color, effectively clearing)
  ctx.fillStyle = CONFIG.cellColorDead;
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

  drawCells(ctx, gameState.grid);
  drawGridLines(ctx, gameState.numRows, gameState.numCols);
  updateStatusDisplay(gameState);
}

/**
 * Converts mouse click coordinates on the canvas to grid cell coordinates.
 * @param canvasRect - The bounding rectangle of the canvas.
 * @param clientX - The mouse X coordinate relative to the viewport.
 * @param clientY - The mouse Y coordinate relative to the viewport.
 * @param numRows - Number of rows in the grid.
 * @param numCols - Number of columns in the grid.
 * @returns An object { row, col } or null if outside canvas.
 */
export function getCellCoordinatesFromClick(
  canvasRect: DOMRect,
  clientX: number,
  clientY: number,
  numRows: number,
  numCols: number
): { row: number; col: number } | null {
  const x = clientX - canvasRect.left;
  const y = clientY - canvasRect.top;

  if (x < 0 || x > CONFIG.canvasWidth || y < 0 || y > CONFIG.canvasHeight) {
    return null; // Click outside canvas
  }

  const col = Math.floor(x / CELL_WIDTH);
  const row = Math.floor(y / CELL_HEIGHT);

  if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
    return { row, col };
  }
  return null; // Should not happen if previous checks are correct
}
