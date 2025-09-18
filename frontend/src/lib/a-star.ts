export interface AStarNode {
  id: string;
  // Add any other properties needed for cost calculation, e.g., position
  [key: string]: any;
}

interface AStarOptions<T extends AStarNode> {
  start: T;
  goal: T;
  getNeighbors: (node: T) => T[];
  heuristic: (a: T, b: T) => number; // h(n)
  distance: (a: T, b: T) => number;  // g(n)
}

/**
 * Implements the A* pathfinding algorithm.
 * @param options - The configuration for the A* search.
 * @returns An array of nodes representing the path from start to goal, or an empty array if no path is found.
 */
export function aStar<T extends AStarNode>({
  start,
  goal,
  getNeighbors,
  heuristic,
  distance,
}: AStarOptions<T>): T[] {
  const openSet = new Set<T>([start]);
  const cameFrom = new Map<string, T>();

  const gScore = new Map<string, number>();
  gScore.set(start.id, 0);

  const fScore = new Map<string, number>();
  fScore.set(start.id, heuristic(start, goal));

  while (openSet.size > 0) {
    let current: T | undefined;
    let lowestFScore = Infinity;

    for (const node of openSet) {
      const score = fScore.get(node.id) ?? Infinity;
      if (score < lowestFScore) {
        lowestFScore = score;
        current = node;
      }
    }

    if (!current || current.id === goal.id) {
      // Path found, reconstruct it
      const path: T[] = [];
      let temp: T | undefined = current;
      while (temp) {
        path.unshift(temp);
        temp = cameFrom.get(temp.id);
      }
      return path;
    }

    openSet.delete(current);
    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
      const tentativeGScore = (gScore.get(current.id) ?? Infinity) + distance(current, neighbor);
      
      if (tentativeGScore < (gScore.get(neighbor.id) ?? Infinity)) {
        cameFrom.set(neighbor.id, current);
        gScore.set(neighbor.id, tentativeGScore);
        fScore.set(neighbor.id, tentativeGScore + heuristic(neighbor, goal));
        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        }
      }
    }
  }

  // No path found
  return [];
}