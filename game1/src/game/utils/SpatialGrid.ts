import { Entity, Vector2 } from '../types';

/**
 * Spatial grid for optimized collision detection
 * Divides the game world into cells for O(1) broad phase collision detection
 */
export class SpatialGrid<T extends Entity> {
  private grid: Map<string, Set<T>>;
  private cellSize: number;
  private width: number;
  private height: number;

  constructor(width: number, height: number, cellSize: number = 100) {
    this.grid = new Map();
    this.cellSize = cellSize;
    this.width = width;
    this.height = height;
  }

  /**
   * Clear all entities from the grid
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Get the cell key for a position
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Get all cell keys that an entity overlaps
   */
  private getEntityCells(entity: T): string[] {
    const cells: string[] = [];
    const { position, radius } = entity;
    
    const minX = Math.floor((position.x - radius) / this.cellSize) * this.cellSize;
    const maxX = Math.floor((position.x + radius) / this.cellSize) * this.cellSize;
    const minY = Math.floor((position.y - radius) / this.cellSize) * this.cellSize;
    const maxY = Math.floor((position.y + radius) / this.cellSize) * this.cellSize;

    for (let x = minX; x <= maxX; x += this.cellSize) {
      for (let y = minY; y <= maxY; y += this.cellSize) {
        cells.push(this.getCellKey(x, y));
      }
    }

    return cells;
  }

  /**
   * Add an entity to the grid
   */
  add(entity: T): void {
    const cells = this.getEntityCells(entity);
    
    for (const cellKey of cells) {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, new Set());
      }
      this.grid.get(cellKey)!.add(entity);
    }
  }

  /**
   * Remove an entity from the grid
   */
  remove(entity: T): void {
    const cells = this.getEntityCells(entity);
    
    for (const cellKey of cells) {
      const cell = this.grid.get(cellKey);
      if (cell) {
        cell.delete(entity);
        if (cell.size === 0) {
          this.grid.delete(cellKey);
        }
      }
    }
  }

  /**
   * Update an entity's position in the grid
   */
  update(entity: T, oldPosition: Vector2): void {
    const oldCells = new Set(this.getEntityCells({ ...entity, position: oldPosition }));
    const newCells = new Set(this.getEntityCells(entity));

    // Remove from cells it's no longer in
    for (const cellKey of oldCells) {
      if (!newCells.has(cellKey)) {
        const cell = this.grid.get(cellKey);
        if (cell) {
          cell.delete(entity);
          if (cell.size === 0) {
            this.grid.delete(cellKey);
          }
        }
      }
    }

    // Add to new cells
    for (const cellKey of newCells) {
      if (!oldCells.has(cellKey)) {
        if (!this.grid.has(cellKey)) {
          this.grid.set(cellKey, new Set());
        }
        this.grid.get(cellKey)!.add(entity);
      }
    }
  }

  /**
   * Get all entities that could potentially collide with the given entity
   */
  getNearbyEntities(entity: T): Set<T> {
    const nearby = new Set<T>();
    const cells = this.getEntityCells(entity);

    for (const cellKey of cells) {
      const cell = this.grid.get(cellKey);
      if (cell) {
        for (const other of cell) {
          if (other !== entity && other.active) {
            nearby.add(other);
          }
        }
      }
    }

    return nearby;
  }

  /**
   * Get all entities within a radius of a position
   */
  getEntitiesInRadius(position: Vector2, radius: number): Set<T> {
    const nearby = new Set<T>();
    const tempEntity: T = {
      position,
      radius,
      active: true,
    } as T;

    const cells = this.getEntityCells(tempEntity);

    for (const cellKey of cells) {
      const cell = this.grid.get(cellKey);
      if (cell) {
        for (const entity of cell) {
          if (entity.active) {
            const dx = entity.position.x - position.x;
            const dy = entity.position.y - position.y;
            const distSq = dx * dx + dy * dy;
            const radiusSum = entity.radius + radius;
            
            if (distSq <= radiusSum * radiusSum) {
              nearby.add(entity);
            }
          }
        }
      }
    }

    return nearby;
  }

  /**
   * Debug: Get grid statistics
   */
  getStats() {
    let totalEntities = 0;
    let maxEntitiesPerCell = 0;
    let activeCells = this.grid.size;

    for (const cell of this.grid.values()) {
      totalEntities += cell.size;
      maxEntitiesPerCell = Math.max(maxEntitiesPerCell, cell.size);
    }

    return {
      activeCells,
      totalEntities,
      maxEntitiesPerCell,
      avgEntitiesPerCell: activeCells > 0 ? totalEntities / activeCells : 0,
    };
  }

  /**
   * Debug: Draw grid lines (for visualization)
   */
  drawGrid(ctx: CanvasRenderingContext2D, color: string = 'rgba(255, 255, 255, 0.1)'): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= this.width; x += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.height; y += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
  }
}