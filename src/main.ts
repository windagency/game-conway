// src/main.ts
import type { GameState, Pattern } from './types';
import {
  createInitialGameState,
  calculateNextGeneration,
  createEmptyGrid,
  createRandomGrid,
  setCellState,
  loadPattern,
} from './game';
import { initializeRenderer, render } from './renderer';
import { setupInputHandlers, updateButtonStates } from './input';
import { DOM_IDS } from './config'; // Import CONFIG for centering patterns


class GameOfLife {
  private gameStateRef: { current: GameState }; // Use a ref object for mutable state
  private animationFrameId: number | null = null;

  constructor() {
    this.gameStateRef = { current: createInitialGameState() };
    initializeRenderer(this.gameStateRef.current); // Pass initial state for cell size calculation
    this.setupEventHandlers();
    this.gameLoop = this.gameLoop.bind(this); // Bind gameLoop context
    render(this.gameStateRef.current); // Initial render
  }

  private setupEventHandlers(): void {
    setupInputHandlers(
      this.gameStateRef,
      this.startSimulation.bind(this),
      this.stopSimulation.bind(this),
      this.stepGeneration.bind(this),
      this.randomizeGrid.bind(this),
      this.clearGrid.bind(this),
      this.handleCellToggle.bind(this),
      this.handleSpeedChange.bind(this),
      this.handleLoadPattern.bind(this)
    );
  }

  private startSimulation(): void {
    if (this.gameStateRef.current.status === 'running') return;

    this.gameStateRef.current.status = 'running';
    // Clear any existing timer before starting a new one
    if (this.gameStateRef.current.timerId !== null) {
      clearInterval(this.gameStateRef.current.timerId);
    }
    this.gameStateRef.current.timerId = window.setInterval(() => {
      this.stepGeneration();
    }, this.gameStateRef.current.simulationInterval);

    // Also kick off the animation frame loop if it's not already running for rendering
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    this.updateUIButtons();
  }

  private stopSimulation(): void {
    if (this.gameStateRef.current.status !== 'running') return;

    this.gameStateRef.current.status = 'paused';
    if (this.gameStateRef.current.timerId !== null) {
      clearInterval(this.gameStateRef.current.timerId);
      this.gameStateRef.current.timerId = null;
    }
    // We might want to stop the animationFrameLoop if nothing else needs rendering continuously
    // For now, let it run for potential UI updates or if we add other animations.
    // if (this.animationFrameId !== null) {
    //   cancelAnimationFrame(this.animationFrameId);
    //   this.animationFrameId = null;
    // }
    this.updateUIButtons();
    render(this.gameStateRef.current); // Ensure status update is rendered
  }

  private stepGeneration(): void {
    this.gameStateRef.current.grid = calculateNextGeneration(this.gameStateRef.current.grid);
    this.gameStateRef.current.generation++;
    // No need to call render here if gameLoop is active, otherwise call it
    if (this.gameStateRef.current.status !== 'running') {
      render(this.gameStateRef.current);
    }
  }

  private randomizeGrid(): void {
    this.stopSimulation(); // Stop if running
    this.gameStateRef.current.grid = createRandomGrid(this.gameStateRef.current.numRows, this.gameStateRef.current.numCols);
    this.gameStateRef.current.generation = 0;
    this.gameStateRef.current.status = 'paused';
    render(this.gameStateRef.current);
    this.updateUIButtons();
  }

  private clearGrid(): void {
    this.stopSimulation(); // Stop if running
    this.gameStateRef.current.grid = createEmptyGrid(this.gameStateRef.current.numRows, this.gameStateRef.current.numCols);
    this.gameStateRef.current.generation = 0;
    this.gameStateRef.current.status = 'paused';
    render(this.gameStateRef.current);
    this.updateUIButtons();
  }

  private handleCellToggle(row: number, col: number, explicitState?: 0 | 1): void {
    if (this.gameStateRef.current.status === 'paused') {
      this.gameStateRef.current.grid = setCellState(this.gameStateRef.current.grid, row, col, explicitState);
      render(this.gameStateRef.current); // Re-render after toggle
    }
  }

  private handleSpeedChange(interval: number): void {
    this.gameStateRef.current.simulationInterval = interval;
    if (this.gameStateRef.current.status === 'running') {
      // Restart simulation with new interval
      this.stopSimulation(); // This will set status to paused
      this.startSimulation(); // This will use the new interval
    }
  }

  private handleLoadPattern(pattern: Pattern): void {
    this.stopSimulation(); // Stop simulation before loading
    this.gameStateRef.current.grid = createEmptyGrid(this.gameStateRef.current.numRows, this.gameStateRef.current.numCols); // Clear grid first

    // Calculate center position to place the pattern
    const startRow = Math.floor((this.gameStateRef.current.numRows - pattern.height) / 2);
    const startCol = Math.floor((this.gameStateRef.current.numCols - pattern.width) / 2);

    this.gameStateRef.current.grid = loadPattern(this.gameStateRef.current.grid, pattern, startRow, startCol);
    this.gameStateRef.current.generation = 0;
    this.gameStateRef.current.status = 'paused';
    render(this.gameStateRef.current);
    this.updateUIButtons();
  }


  private updateUIButtons(): void {
    const startButton = document.getElementById(DOM_IDS.startButton) as HTMLButtonElement;
    const stopButton = document.getElementById(DOM_IDS.stopButton) as HTMLButtonElement;
    const stepButton = document.getElementById(DOM_IDS.stepButton) as HTMLButtonElement;
    const clearButton = document.getElementById(DOM_IDS.clearButton) as HTMLButtonElement;
    const resetButton = document.getElementById(DOM_IDS.resetButton) as HTMLButtonElement;
    const templateSelector = document.getElementById(DOM_IDS.templateSelector) as HTMLSelectElement;


    if (startButton && stopButton && stepButton && clearButton && resetButton && templateSelector) {
      updateButtonStates(this.gameStateRef.current.status, startButton, stopButton, stepButton, clearButton, resetButton, templateSelector);
    }
  }

  private gameLoop(): void {
    // The simulation step is handled by setInterval when 'running'
    // This loop is primarily for rendering smoothly.
    render(this.gameStateRef.current);
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public start(): void {
    console.log("Conway's Game of Life Initialized.");
    this.animationFrameId = requestAnimationFrame(this.gameLoop); // Start rendering loop
    this.updateUIButtons(); // Set initial button states
  }
}

// --- Application Entry Point ---
window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new GameOfLife();
    game.start();
  } catch (error) {
    console.error("Fatal Error: Could not start Conway's Game of Life.", error);
    const body = document.querySelector('body');
    if (body) {
      const errorContainer = document.createElement('div');
      // Basic styling for error message
      errorContainer.style.color = 'red';
      errorContainer.style.padding = '20px';
      errorContainer.style.textAlign = 'center';
      errorContainer.innerHTML = `<h1>Initialization Failed</h1><p>Could not start the game. Check console for details.</p><p>${(error as Error).message}</p>`;
      body.prepend(errorContainer); // Prepend to make it visible
    }
  }
});
