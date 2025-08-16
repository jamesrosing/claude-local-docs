#!/usr/bin/env node
/**
 * Search the local documentation
 */

const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '..', 'docs-index.json');

/**
 * Calculate relevance score for a document
 */
function calculateScore(doc, terms) {
  let score = 0;
  const searchText = doc.searchText || '';
  const title = (doc.title || '').toLowerCase();
  const headings = (doc.headings || []).join(' ').toLowerCase();
  
  for (const term of terms) {
    const termLower = term.toLowerCase();
    
    // Title match (highest weight)
    if (title.includes(termLower)) {
      score += 10;
      if (title.startsWith(termLower)) score += 5;
    }
    
    // Heading match (medium weight)
    if (headings.includes(termLower)) {
      score += 5;
    }
    
    // Content match (base weight)
    const contentMatches = (searchText.match(new RegExp(termLower, 'g')) || []).length;
    score += Math.min(contentMatches, 10); // Cap at 10 to prevent spam
  }
  
  return score;
}

/**
 * Search the documentation
 */
function searchDocs(query) {
  if (!fs.existsSync(INDEX_FILE)) {
    console.error('❌ Index not found. Run: node ~/.claude-docs/scripts/index-docs.js');
    process.exit(1);
  }
  
  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  
  if (terms.length === 0) {
    console.log('Please provide a search query');
    return [];
  }
  
  // Score and filter documents
  const results = index
    .map(doc => ({
      ...doc,
      score: calculateScore(doc, terms)
    }))
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10 results
  
  return results;
}

/**
 * Display search results
 */
function displayResults(results, query) {
  console.log(`\n🔍 Search results for: "${query}"\n`);
  
  if (results.length === 0) {
    console.log('No results found. Try different keywords.');
    return;
  }
  
  results.forEach((doc, idx) => {
    console.log(`${idx + 1}. ${doc.title}`);
    console.log(`   📁 ${doc.page}`);
    console.log(`   ${doc.preview}\n`);
  });
  
  // Output paths for Claude to read
  console.log('\n--- Full Documentation Paths ---');
  results.slice(0, 5).forEach(doc => {
    console.log(`Read: ${doc.fullPath}`);
  });
}

// Main execution
if (require.main === module) {
  const query = process.argv.slice(2).join(' ');
  
  if (!query) {
    console.log('Usage: node search.js <query>');
    console.log('Example: node search.js MCP servers');
    process.exit(0);
  }
  
  const results = searchDocs(query);
  displayResults(results, query);
  
  // If running in Claude, save results
  if (process.env.CLAUDE_SESSION) {
    fs.writeFileSync(
      '/tmp/claude-docs-results.json',
      JSON.stringify(results, null, 2)
    );
  }
}

module.exports = { searchDocs };