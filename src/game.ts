// src/game.ts
import type { GameState, Grid, CellState, Pattern } from './types';
import { CONFIG } from './config';

/**
 * Creates an empty grid (all cells dead) with the specified dimensions.
 * @param numRows - The number of rows in the grid.
 * @param numCols - The number of columns in the grid.
 * @returns A new Grid with all cells set to dead (0).
 */
export function createEmptyGrid(numRows: number, numCols: number): Grid {
  return Array.from({ length: numRows }, () => Array(numCols).fill(0));
}

/**
 * Creates a grid with cells randomly set to alive or dead.
 * @param numRows - The number of rows.
 * @param numCols - The number of columns.
 * @param probability - The probability (0 to 1) of a cell being alive.
 * @returns A new Grid with randomly populated cells.
 */
export function createRandomGrid(numRows: number, numCols: number, probability: number = 0.3): Grid {
  return Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => (Math.random() < probability ? 1 : 0))
  );
}


/**
 * Initializes the game state.
 * @returns A new GameState object.
 */
export function createInitialGameState(): GameState {
  return {
    grid: createRandomGrid(CONFIG.initialGridRows, CONFIG.initialGridCols),
    numRows: CONFIG.initialGridRows,
    numCols: CONFIG.initialGridCols,
    generation: 0,
    status: 'paused',
    simulationInterval: CONFIG.defaultSimulationIntervalMs,
    timerId: null,
    isDrawing: false,
    drawMode: 1, // Default to drawing live cells
  };
}

/**
 * Calculates the next generation of the grid based on Conway's rules.
 * @param currentGrid - The current state of the grid.
 * @returns A new Grid representing the next generation.
 */
export function calculateNextGeneration(currentGrid: Grid): Grid {
  const numRows = currentGrid.length;
  const numCols = currentGrid[0]?.length || 0; // Safely get numCols

  if (numRows === 0 || numCols === 0) return []; // Handle empty grid case

  return currentGrid.map((rowArray, row) => {
    return rowArray.map((currentCellState, col) => {
      let liveNeighbors = 0;
      // Check all 8 neighbors
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue; // Skip the cell itself

          const neighborRow = row + i;
          const neighborCol = col + j;

          // Toroidal wrapping for edges
          const wrappedRow = (neighborRow + numRows) % numRows;
          const wrappedCol = (neighborCol + numCols) % numCols;

          // Safely access neighbor state using optional chaining
          if (currentGrid[wrappedRow]?.[wrappedCol] === 1) {
            liveNeighbors++;
          }
        }
      }

      // Apply Conway's rules based on currentCellState
      if (currentCellState === 1) { // Live cell
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          return 0 as CellState; // Dies
        } else {
          return 1 as CellState; // Survives
        }
      } else { // Dead cell
        if (liveNeighbors === 3) {
          return 1 as CellState; // Becomes alive
        } else {
          return 0 as CellState; // Stays dead
        }
      }
    });
  });
}

/**
 * Toggles the state of a specific cell in the grid.
 * @param grid - The grid to modify.
 * @param row - The row index of the cell.
 * @param col - The column index of the cell.
 * @param newState - Optional: if provided, sets the cell to this state. Otherwise, toggles.
 * @returns A new grid with the cell state updated, or the same grid if indices are out of bounds.
 */
export function setCellState(
  grid: Grid,
  row: number,
  col: number,
  newState?: CellState
): Grid {
  const numRows = grid.length;
  // Determine expected number of columns, defaulting to CONFIG if grid is empty or malformed.
  const expectedNumCols = grid[0]?.length ?? CONFIG.initialGridCols;

  // Bounds checking for row and col against expected/derived dimensions
  if (row < 0 || row >= numRows || col < 0 || col >= expectedNumCols) {
    console.warn(`Attempted to set cell state out of bounds: [${row}, ${col}] based on grid dimensions (${numRows}x${expectedNumCols})`);
    return grid;
  }

  // Create a robust, deep-enough copy of the grid.
  // If a row `r` in the original grid is not an array (e.g., undefined),
  // replace it with a new array of `expectedNumCols` filled with 0s.
  // This ensures `interimGrid[rowIndex]` will always be an array.
  const interimGrid = grid.map((currentRowArray) => {
    let sanitizedRow = Array.isArray(currentRowArray) ? [...currentRowArray] : Array(expectedNumCols).fill(0);
    // Ensure the row has the correct number of columns, padding if necessary.
    if (sanitizedRow.length < expectedNumCols) {
      const oldContent = [...sanitizedRow];
      sanitizedRow = Array(expectedNumCols).fill(0);
      oldContent.forEach((val, i) => sanitizedRow[i] = val);
    } else if (sanitizedRow.length > expectedNumCols) {
      // Truncate if too long, though this case should ideally be prevented by grid creation logic.
      sanitizedRow = sanitizedRow.slice(0, expectedNumCols);
    }
    return sanitizedRow;
  });

  // Now, apply the state change using a functional approach on the sanitized interimGrid
  return interimGrid.map((currentRowArray, rIndex) => {
    if (rIndex !== row) {
      return currentRowArray; // These rows are already copies and correctly sized
    }
    // This is the target row; map its cells to create the updated row
    return currentRowArray.map((cell, cIndex) => {
      if (cIndex !== col) {
        return cell; // Keep other cells in this row as they are
      }
      // This is the cell to modify. 'cell' here is from interimGrid (copied and sanitized).
      return newState !== undefined ? newState : (cell === 1 ? 0 : 1);
    });
  });
}

/**
 * Loads a predefined pattern onto the grid.
 * @param grid - The current grid.
 * @param pattern - The pattern to load.
 * @param startRow - The starting row to place the pattern (top-left).
 * @param startCol - The starting column to place the pattern (top-left).
 * @returns A new grid with the pattern loaded.
 */
export function loadPattern(grid: Grid, pattern: Pattern, startRow: number, startCol: number): Grid {
  const numRows = grid.length;
  // Determine expected number of columns, defaulting to CONFIG if grid is empty or malformed.
  const expectedNumCols = grid[0]?.length ?? CONFIG.initialGridCols;

  // Create a robust, deep-enough copy of the grid, ensuring all rows are arrays of correct length.
  const sanitizedBaseGrid = grid.map((currentRowArray) => {
    let sanitizedRow = Array.isArray(currentRowArray) ? [...currentRowArray] : Array(expectedNumCols).fill(0);
    if (sanitizedRow.length < expectedNumCols) {
      const oldContent = [...sanitizedRow];
      sanitizedRow = Array(expectedNumCols).fill(0);
      oldContent.forEach((val, i) => sanitizedRow[i] = val);
    } else if (sanitizedRow.length > expectedNumCols) {
      sanitizedRow = sanitizedRow.slice(0, expectedNumCols);
    }
    return sanitizedRow;
  });

  // Pre-calculate the set of absolute coordinates where the pattern places live cells
  const patternLiveCells = new Set<string>();
  pattern.data.forEach(([rOffset, cOffset]) => {
    const rTarget = startRow + rOffset;
    const cTarget = startCol + cOffset;
    // Check if target coordinates are within the overall grid dimensions
    if (rTarget >= 0 && rTarget < numRows && cTarget >= 0 && cTarget < expectedNumCols) {
      patternLiveCells.add(`${rTarget},${cTarget}`);
    }
  });

  // Apply the pattern to the sanitizedBaseGrid using map for immutability
  const finalGridWithPattern = sanitizedBaseGrid.map((currentRowArray, rIndex) => {
    return currentRowArray.map((cellState, cIndex) => {
      if (patternLiveCells.has(`${rIndex},${cIndex}`)) {
        return 1 as CellState; // This cell is part of the pattern
      }
      return cellState; // Otherwise, keep the original cell state
    });
  });

  return finalGridWithPattern;
}
