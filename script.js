async function submitData() {
  const input = document.getElementById('dataInput').value;
  const errorDiv = document.getElementById('error');
  const resultDiv = document.getElementById('result');
  
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'none';
  
  let dataArray;
  if (input.includes('\n')) {
    dataArray = input.split('\n').map(s => s.trim()).filter(s => s);
  } else {
    dataArray = input.split(',').map(s => s.trim()).filter(s => s);
  }
  
  try {
    const response = await fetch('/api/bfhl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: dataArray })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    displayResult(result);
    
  } catch (error) {
    errorDiv.textContent = 'Error: ' + error.message;
    errorDiv.style.display = 'block';
  }
}

function displayResult(data) {
  const resultDiv = document.getElementById('result');
  
  document.getElementById('userId').textContent = data.user_id;
  document.getElementById('emailId').textContent = data.email_id;
  document.getElementById('rollNumber').textContent = data.college_roll_number;
  
  document.getElementById('totalTrees').textContent = data.summary.total_trees;
  document.getElementById('totalCycles').textContent = data.summary.total_cycles;
  document.getElementById('largestTreeRoot').textContent = data.summary.largest_tree_root || 'N/A';
  
  const hierarchiesDiv = document.getElementById('hierarchies');
  hierarchiesDiv.innerHTML = '';
  
  if (data.hierarchies && data.hierarchies.length > 0) {
    data.hierarchies.forEach((h, index) => {
      const item = document.createElement('div');
      item.className = 'hierarchy-item';
      
      let html = `<h4>Tree ${index + 1}: Root = ${h.root}`;
      if (h.has_cycle) {
        html += '<span class="cycle-badge">CYCLE DETECTED</span>';
      }
      html += '</h4>';
      
      if (h.has_cycle) {
        html += '<p><em>This group contains a cycle - tree structure not available</em></p>';
      } else {
        html += `<p><strong>Depth:</strong> ${h.depth}</p>`;
        html += '<div class="tree-view">' + JSON.stringify(h.tree, null, 2) + '</div>';
      }
      
      item.innerHTML = html;
      hierarchiesDiv.appendChild(item);
    });
  } else {
    hierarchiesDiv.innerHTML = '<p>No hierarchies found</p>';
  }
  
  const invalidDiv = document.getElementById('invalidEntries');
  invalidDiv.innerHTML = '';
  if (data.invalid_entries && data.invalid_entries.length > 0) {
    data.invalid_entries.forEach(entry => {
      const tag = document.createElement('span');
      tag.className = 'entry-tag invalid';
      tag.textContent = entry;
      invalidDiv.appendChild(tag);
    });
  } else {
    invalidDiv.innerHTML = '<p>No invalid entries</p>';
  }
  
  const duplicateDiv = document.getElementById('duplicateEdges');
  duplicateDiv.innerHTML = '';
  if (data.duplicate_edges && data.duplicate_edges.length > 0) {
    data.duplicate_edges.forEach(entry => {
      const tag = document.createElement('span');
      tag.className = 'entry-tag duplicate';
      tag.textContent = entry;
      duplicateDiv.appendChild(tag);
    });
  } else {
    duplicateDiv.innerHTML = '<p>No duplicate edges</p>';
  }
  
  resultDiv.style.display = 'block';
}
