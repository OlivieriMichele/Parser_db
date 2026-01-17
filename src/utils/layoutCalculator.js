/**
 * Calcola il layout ottimale per i nodi del diagramma
 * Raggruppa classi connesse e minimizza intersezioni
 */

const NODE_WIDTH = 250;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 100;
const VERTICAL_SPACING = 100;
const PADDING = 50;

/**
 * Crea un grafo di adiacenza dalle relazioni
 */
const buildGraph = (nodes, relations) => {
  const graph = new Map();
  
  nodes.forEach(node => {
    graph.set(node.name, new Set());
  });
  
  relations.forEach(rel => {
    if (graph.has(rel.from) && graph.has(rel.to)) {
      graph.get(rel.from).add(rel.to);
      graph.get(rel.to).add(rel.from);
    }
  });
  
  return graph;
};

/**
 * Trova cluster di nodi connessi usando BFS
 */
const findClusters = (graph) => {
  const visited = new Set();
  const clusters = [];
  
  for (const [node] of graph) {
    if (!visited.has(node)) {
      const cluster = [];
      const queue = [node];
      visited.add(node);
      
      while (queue.length > 0) {
        const current = queue.shift();
        cluster.push(current);
        
        const neighbors = graph.get(current);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      
      clusters.push(cluster);
    }
  }
  
  return clusters;
};

/**
 * Calcola posizioni per un singolo cluster
 */
const layoutCluster = (cluster, startX, startY) => {
  const positions = new Map();
  const cols = Math.ceil(Math.sqrt(cluster.length));
  
  cluster.forEach((nodeName, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = startX + col * (NODE_WIDTH + HORIZONTAL_SPACING);
    const y = startY + row * (NODE_HEIGHT + VERTICAL_SPACING);
    
    positions.set(nodeName, { x, y });
  });
  
  return positions;
};

/**
 * Calcola il layout intelligente per tutti i nodi
 */
export const calculateSmartLayout = (nodes, relations) => {
  if (!nodes || nodes.length === 0) {
    return new Map();
  }
  
  const graph = buildGraph(nodes, relations);
  const clusters = findClusters(graph);
  
  // Ordina i cluster per dimensione (più grandi prima)
  clusters.sort((a, b) => b.length - a.length);
  
  const positions = new Map();
  let currentY = PADDING;
  let maxX = 0;
  
  clusters.forEach(cluster => {
    const clusterPositions = layoutCluster(cluster, PADDING, currentY);
    
    // Aggiungi le posizioni al risultato finale
    clusterPositions.forEach((pos, nodeName) => {
      positions.set(nodeName, pos);
      maxX = Math.max(maxX, pos.x);
    });
    
    // Calcola l'altezza del cluster
    const rows = Math.ceil(cluster.length / Math.ceil(Math.sqrt(cluster.length)));
    const clusterHeight = rows * (NODE_HEIGHT + VERTICAL_SPACING);
    
    currentY += clusterHeight + VERTICAL_SPACING * 2;
  });
  
  return positions;
};

/**
 * Calcola layout a griglia semplice (fallback)
 */
export const calculateGridLayout = (nodes) => {
  const positions = new Map();
  const cols = 5;
  
  nodes.forEach((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = PADDING + col * (NODE_WIDTH + HORIZONTAL_SPACING);
    const y = PADDING + row * (NODE_HEIGHT + VERTICAL_SPACING);
    
    positions.set(node.name, { x, y });
  });
  
  return positions;
};

/**
 * Snap position to grid
 */
export const snapToGrid = (x, y, gridSize = 25) => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
};

/**
 * Calcola le dimensioni del canvas necessarie
 */
export const calculateCanvasSize = (positions) => {
  let maxX = 0;
  let maxY = 0;
  
  positions.forEach(pos => {
    maxX = Math.max(maxX, pos.x + NODE_WIDTH);
    maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
  });
  
  return {
    width: maxX + PADDING,
    height: maxY + PADDING
  };
};

export const NODE_DIMENSIONS = {
  width: NODE_WIDTH,
  height: NODE_HEIGHT
};