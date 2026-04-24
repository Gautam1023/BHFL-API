const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USER_ID = "gautam_24042006";
const EMAIL_ID = "gs1225@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA2311003030398";

function isValidNodeFormat(str) {
  const trimmed = str.trim();
  if (!trimmed) return false;
  const pattern = /^[A-Z]->[A-Z]$/;
  if (!pattern.test(trimmed)) return false;
  const [parent, child] = trimmed.split('->');
  if (parent === child) return false;
  return true;
}

function detectCycle(edges) {
  const graph = {};
  const allNodes = new Set();
  
  edges.forEach(edge => {
    const [parent, child] = edge.split('->');
    allNodes.add(parent);
    allNodes.add(child);
    if (!graph[parent]) graph[parent] = [];
    graph[parent].push(child);
  });
  
  const visited = new Set();
  const recStack = new Set();
  
  function hasCycle(node) {
    visited.add(node);
    recStack.add(node);
    
    const children = graph[node] || [];
    for (const child of children) {
      if (!visited.has(child)) {
        if (hasCycle(child)) return true;
      } else if (recStack.has(child)) {
        return true;
      }
    }
    
    recStack.delete(node);
    return false;
  }
  
  for (const node of allNodes) {
    if (!visited.has(node)) {
      if (hasCycle(node)) return true;
    }
  }
  return false;
}

function findGroups(edges) {
  const allNodes = new Set();
  const adjList = {};
  
  edges.forEach(edge => {
    const [parent, child] = edge.split('->');
    allNodes.add(parent);
    allNodes.add(child);
    
    if (!adjList[parent]) adjList[parent] = [];
    if (!adjList[child]) adjList[child] = [];
    adjList[parent].push(child);
    adjList[child].push(parent);
  });
  
  const visited = new Set();
  const groups = [];
  
  function dfs(node, group) {
    visited.add(node);
    group.push(node);
    (adjList[node] || []).forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, group);
      }
    });
  }
  
  for (const node of allNodes) {
    if (!visited.has(node)) {
      const group = [];
      dfs(node, group);
      groups.push(new Set(group));
    }
  }
  
  return groups;
}

function findRootsInGroup(edges) {
  const parents = new Set();
  const children = new Set();
  
  edges.forEach(edge => {
    const [parent, child] = edge.split('->');
    parents.add(parent);
    children.add(child);
  });
  
  const roots = [];
  for (const p of parents) {
    if (!children.has(p)) {
      roots.push(p);
    }
  }
  
  if (roots.length === 0 && edges.length > 0) {
    const allNodes = new Set();
    edges.forEach(edge => {
      const [p, c] = edge.split('->');
      allNodes.add(p);
      allNodes.add(c);
    });
    return [Array.from(allNodes).sort()[0]];
  }
  
  return roots;
}

function buildNestedTree(edges, root) {
  function buildNode(node) {
    const nodeTree = {};
    edges.forEach(edge => {
      const [parent, child] = edge.split('->');
      if (parent === node) {
        nodeTree[child] = buildNode(child);
      }
    });
    return nodeTree;
  }
  
  return { [root]: buildNode(root) };
}

function calculateDepth(tree) {
  function getDepth(node) {
    const keys = Object.keys(node);
    if (keys.length === 0) return 1;
    
    let maxChildDepth = 0;
    for (const key of keys) {
      const childDepth = getDepth(node[key]);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
    return 1 + maxChildDepth;
  }
  
  return getDepth(tree);
}

app.post('/bfhl', (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid request body. Expected { data: [...] }" });
  }
  
  const invalid_entries = [];
  const validEntries = [];
  const seenEdges = new Set();
  const duplicate_edges = [];
  
  data.forEach(entry => {
    if (typeof entry !== 'string') {
      invalid_entries.push(entry);
      return;
    }
    
    if (!isValidNodeFormat(entry)) {
      invalid_entries.push(entry.trim() || entry);
      return;
    }
    
    const normalized = entry.trim();
    
    if (seenEdges.has(normalized)) {
      if (!duplicate_edges.includes(normalized)) {
        duplicate_edges.push(normalized);
      }
      return;
    }
    
    seenEdges.add(normalized);
    validEntries.push(normalized);
  });
  
  const groups = findGroups(validEntries);
  const hierarchies = [];
  let total_trees = 0;
  let total_cycles = 0;
  let largestDepth = 0;
  let largest_tree_root = "";
  
  groups.forEach(groupNodes => {
    const groupEdges = validEntries.filter(edge => {
      const [p, c] = edge.split('->');
      return groupNodes.has(p) && groupNodes.has(c);
    });
    
    const hasCycle = detectCycle(groupEdges);
    
    if (hasCycle) {
      total_cycles++;
      const smallestNode = Array.from(groupNodes).sort()[0];
      hierarchies.push({
        root: smallestNode,
        tree: {},
        has_cycle: true
      });
    } else {
      const roots = findRootsInGroup(groupEdges);
      
      roots.forEach(root => {
        total_trees++;
        const nestedTree = buildNestedTree(groupEdges, root);
        const depth = calculateDepth(nestedTree);
        
        if (depth > largestDepth || (depth === largestDepth && root < largest_tree_root)) {
          largestDepth = depth;
          largest_tree_root = root;
        }
        
        hierarchies.push({
          root: root,
          tree: nestedTree,
          depth: depth
        });
      });
    }
  });
  
  res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies: hierarchies,
    invalid_entries: invalid_entries,
    duplicate_edges: duplicate_edges,
    summary: {
      total_trees: total_trees,
      total_cycles: total_cycles,
      largest_tree_root: largest_tree_root
    }
  });
});

module.exports = app;
