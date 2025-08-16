#!/usr/bin/env node
/**
 * Fetches Claude Code documentation from docs.anthropic.com
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Documentation pages to fetch
const DOCS_PAGES = [
  // Getting Started
  'overview',
  'quickstart', 
  'common-workflows',
  'memory',
  
  // Build with Claude Code
  'sdk',
  'sub-agents',
  'output-styles',
  'hooks-guide',
  'github-actions',
  'mcp',
  'troubleshooting',
  
  // IDE & Integration
  'ide-integrations',
  'interactive-mode',
  'slash-commands',
  
  // Deployment
  'third-party-integrations',
  'amazon-bedrock',
  'google-vertex-ai',
  'corporate-proxy',
  'llm-gateway',
  'devcontainer',
  
  // Administration
  'setup',
  'iam',
  'security',
  'data-usage',
  'monitoring-usage',
  'costs',
  'analytics',
  
  // Configuration
  'settings',
  'cli-reference'
];

const BASE_URL = 'https://docs.anthropic.com/en/docs/claude-code/';
const CONTENT_DIR = path.join(__dirname, '..', 'content');

/**
 * Fetch a URL and return the HTML content
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Extract markdown content from HTML
 */
function extractMarkdown(html, pageName) {
  // Simple extraction - gets main content
  // In production, use a proper HTML to Markdown converter
  
  let content = html;
  
  // Extract title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(' \\| Anthropic', '') : pageName;
  
  // Extract main content (simplified)
  const mainMatch = content.match(/<main[^>]*>([\\s\\S]*?)<\/main>/i);
  if (mainMatch) {
    content = mainMatch[1];
  }
  
  // Clean up HTML (basic conversion)
  content = content
    .replace(/<script[\\s\\S]*?<\/script>/gi, '')
    .replace(/<style[\\s\\S]*?<\/style>/gi, '')
    .replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '# $1\\n')
    .replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '## $1\\n')
    .replace(/<h3[^>]*>([^<]+)<\/h3>/gi, '### $1\\n')
    .replace(/<h4[^>]*>([^<]+)<\/h4>/gi, '#### $1\\n')
    .replace(/<code>([^<]+)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>([\\s\\S]*?)<\/pre>/gi, '```\\n$1\\n```')
    .replace(/<strong>([^<]+)<\/strong>/gi, '**$1**')
    .replace(/<em>([^<]+)<\/em>/gi, '*$1*')
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)')
    .replace(/<p>([\\s\\S]*?)<\/p>/gi, '$1\\n\\n')
    .replace(/<li>([^<]+)<\/li>/gi, '- $1\\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\n{3,}/g, '\\n\\n');
  
  // Add frontmatter
  const frontmatter = `---\ntitle: ${title}\npage: ${pageName}\nsource: ${BASE_URL}${pageName}\nfetched: ${new Date().toISOString()}\n---\n\n`;
  
  return frontmatter + content.trim();
}

/**
 * Main function to fetch all documentation
 */
async function fetchAllDocs() {
  console.log('📚 Fetching Claude Code documentation...');
  
  // Ensure content directory exists
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const page of DOCS_PAGES) {
    try {
      process.stdout.write(`Fetching ${page}... `);
      
      const url = `${BASE_URL}${page}`;
      const html = await fetchPage(url);
      const markdown = extractMarkdown(html, page);
      
      const filePath = path.join(CONTENT_DIR, `${page}.md`);
      await fs.writeFile(filePath, markdown, 'utf8');
      
      console.log('✅');
      successCount++;
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log('❌');
      console.error(`  Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Complete! Fetched ${successCount} pages (${errorCount} errors)`);
}

// Run if called directly
if (require.main === module) {
  fetchAllDocs().catch(console.error);
}

module.exports = { fetchAllDocs, DOCS_PAGES };