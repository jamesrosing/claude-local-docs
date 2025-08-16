#!/usr/bin/env node
/**
 * Creates a searchable index of all documentation
 */

const fs = require('fs').promises;
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const INDEX_FILE = path.join(__dirname, '..', 'docs-index.json');

/**
 * Parse markdown frontmatter
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { metadata: {}, content };
  
  const metadata = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  return { metadata, content: contentWithoutFrontmatter };
}

/**
 * Extract text preview from markdown
 */
function extractPreview(content, maxLength = 300) {
  // Remove code blocks
  let preview = content.replace(/```[\s\S]*?```/g, '');
  
  // Remove links but keep text
  preview = preview.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove markdown formatting
  preview = preview
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
  
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }
  
  return preview;
}

/**
 * Build the search index
 */
async function buildIndex() {
  console.log('🔍 Building search index...');
  
  const index = [];
  
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    for (const file of mdFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf8');
      const { metadata, content: body } = parseFrontmatter(content);
      
      // Extract headings for better search
      const headings = [];
      const headingMatches = body.matchAll(/^#{1,3}\s(.+)$/gm);
      for (const match of headingMatches) {
        headings.push(match[1]);
      }
      
      index.push({
        id: file.replace('.md', ''),
        file: file,
        path: `/content/${file}`,
        fullPath: filePath,
        title: metadata.title || file.replace('.md', '').replace(/-/g, ' '),
        page: metadata.page || file.replace('.md', ''),
        source: metadata.source || '',
        preview: extractPreview(body),
        headings: headings,
        contentLength: body.length,
        lastModified: metadata.fetched || new Date().toISOString(),
        searchText: `${metadata.title || ''} ${headings.join(' ')} ${body}`.toLowerCase()
      });
    }
    
    // Sort by title
    index.sort((a, b) => a.title.localeCompare(b.title));
    
    // Save index
    await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
    
    console.log(`✅ Indexed ${index.length} documentation files`);
    console.log(`📄 Index saved to: ${INDEX_FILE}`);
    
    return index;
    
  } catch (error) {
    console.error('❌ Error building index:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  buildIndex().catch(console.error);
}

module.exports = { buildIndex };