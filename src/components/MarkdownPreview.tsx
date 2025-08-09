import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function MarkdownPreview() {
  const [inputMarkdown, setInputMarkdown] = useState('');
  const [message, setMessage] = useState('');

  const parseMarkdown = (markdown: string): string => {
    if (!markdown.trim()) return '';

    // Split into lines for easier processing
    const lines = markdown.split('\n');
    let html = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check for table
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\|?[\s\-\|:]+\|?$/)) {
        // Parse table
        const tableLines = [line];
        const separatorLine = lines[i + 1];
        tableLines.push(separatorLine);
        i += 2;

        // Get remaining table rows
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        // Convert to HTML table
        let tableHtml = '<table>';
        
        // Header row
        const headerCells = tableLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
        tableHtml += '<thead><tr>';
        headerCells.forEach(cell => {
          tableHtml += `<th>${cell}</th>`;
        });
        tableHtml += '</tr></thead>';

        // Body rows
        if (tableLines.length > 2) {
          tableHtml += '<tbody>';
          for (let j = 2; j < tableLines.length; j++) {
            const rowCells = tableLines[j].split('|').map(cell => cell.trim()).filter(cell => cell);
            if (rowCells.length > 0) {
              tableHtml += '<tr>';
              rowCells.forEach(cell => {
                tableHtml += `<td>${cell}</td>`;
              });
              tableHtml += '</tr>';
            }
          }
          tableHtml += '</tbody>';
        }

        tableHtml += '</table>';
        html += tableHtml + '\n';
        continue;
      }

      // Regular line processing
      html += line + '\n';
      i++;
    }

    // Now process the HTML with other markdown rules
    html = html
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      
      // Code blocks (before inline code)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      
      // Horizontal rule
      .replace(/^---$/gm, '<hr>')
      .replace(/^\*\*\*$/gm, '<hr>')
      
      // Unordered lists
      .replace(/^[\*\-\+] (.*$)/gm, '<li>$1</li>')
      
      // Ordered lists
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      
      // Line breaks
      .replace(/\n/g, '<br>');

    // Wrap consecutive list items in ul/ol tags
    html = html
      .replace(/(<li>.*?<\/li>)(<br>(<li>.*?<\/li>))*(<br>)*/g, (match) => {
        const items = match.replace(/<br>/g, '');
        return `<ul>${items}</ul>`;
      });

    // Wrap consecutive blockquotes
    html = html
      .replace(/(<blockquote>.*?<\/blockquote>)(<br>(<blockquote>.*?<\/blockquote>))*(<br>)*/g, (match) => {
        const quotes = match.replace(/<br>/g, '').replace(/<blockquote>/g, '<p>').replace(/<\/blockquote>/g, '</p>');
        return `<blockquote>${quotes}</blockquote>`;
      });

    return html;
  };

  const renderedHtml = useMemo(() => {
    try {
      const html = parseMarkdown(inputMarkdown);
      if (html && inputMarkdown.trim()) {
        setMessage('✅ Markdown rendered successfully');
      } else if (!inputMarkdown.trim()) {
        setMessage('');
      }
      return html;
    } catch (error) {
      setMessage(`❌ Error rendering Markdown: ${error.message}`);
      return '';
    }
  }, [inputMarkdown]);

  const copyMarkdown = async () => {
    if (inputMarkdown) {
      try {
        await navigator.clipboard.writeText(inputMarkdown);
        setMessage('✅ Markdown copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy markdown to clipboard');
      }
    }
  };

  const copyHtml = async () => {
    if (renderedHtml) {
      try {
        await navigator.clipboard.writeText(renderedHtml);
        setMessage('✅ HTML copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy HTML to clipboard');
      }
    }
  };

  const clearAll = () => {
    setInputMarkdown('');
    setMessage('');
  };

  const sampleMarkdown = `# Markdown Preview Example

This is a **comprehensive** example of *Markdown* formatting.

## Headers

### This is a level 3 header

## Text Formatting

- **Bold text** using double asterisks
- *Italic text* using single asterisks
- ***Bold and italic*** using triple asterisks
- __Bold using underscores__
- _Italic using underscores_
- ~~Strikethrough text~~
- \`Inline code\` with backticks

## Code Blocks

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Links and Images

- [Visit GitHub](https://github.com)
- [OpenAI](https://openai.com)

![Sample Image](https://via.placeholder.com/300x200.png?text=Sample+Image)

## Lists

### Unordered List
- First item
- Second item
- Third item
  - Nested item
  - Another nested item

### Ordered List
1. First step
2. Second step
3. Third step

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
> 
> And even multiple paragraphs.

## Horizontal Rules

---

## Tables (Basic Support)

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

---

*End of example*`;

  const loadSample = () => {
    setInputMarkdown(sampleMarkdown);
    setMessage('Sample Markdown loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Markdown Preview</h1>
        <p className="text-muted-foreground">Preview and format Markdown content with live rendering</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Markdown Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inputMarkdown">Enter your Markdown:</Label>
                  <textarea 
                    id="inputMarkdown"
                    value={inputMarkdown}
                    onChange={(e) => setInputMarkdown(e.target.value)}
                    rows={20}
                    className="flex min-h-[500px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                    placeholder='# Your Markdown Here&#10;&#10;Type your **markdown** content here...'
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={copyMarkdown} variant="outline" className="flex-1">
                    Copy Markdown
                  </Button>
                  <Button onClick={loadSample} variant="outline" className="flex-1">
                    Load Sample
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Preview</CardTitle>
              <Button onClick={copyHtml} variant="outline" size="sm">
                Copy HTML
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Rendered output:</Label>
                <div 
                  className="min-h-[500px] w-full rounded-md border border-input bg-muted px-4 py-3 text-sm prose prose-sm max-w-none"
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderedHtml || '<p class="text-muted-foreground italic">Preview will appear here...</p>' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {message && (
          <Card className={message.startsWith('✅') ? "border-green-200 bg-green-50" : message.startsWith('❌') ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
            <CardContent className="pt-6">
              <div className={`text-sm font-medium ${message.startsWith('✅') ? "text-green-700" : message.startsWith('❌') ? "text-red-700" : "text-yellow-700"}`}>
                {message}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx>{`
        .prose h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem 0; }
        .prose h2 { font-size: 1.25rem; font-weight: bold; margin: 1rem 0 0.5rem 0; }
        .prose h3 { font-size: 1.125rem; font-weight: bold; margin: 1rem 0 0.5rem 0; }
        .prose p { margin: 0.5rem 0; }
        .prose ul, .prose ol { margin: 0.5rem 0; padding-left: 1.5rem; }
        .prose li { margin: 0.25rem 0; }
        .prose blockquote { 
          border-left: 4px solid #e5e7eb; 
          padding-left: 1rem; 
          margin: 1rem 0; 
          font-style: italic;
          background-color: #f9fafb;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
        }
        .prose code { 
          background-color: #f1f5f9; 
          padding: 0.125rem 0.25rem; 
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }
        .prose pre { 
          background-color: #1e293b; 
          color: #e2e8f0;
          padding: 1rem; 
          border-radius: 0.5rem; 
          overflow-x: auto;
          margin: 1rem 0;
        }
        .prose pre code { 
          background-color: transparent; 
          padding: 0;
        }
        .prose a { 
          color: #2563eb; 
          text-decoration: underline;
        }
        .prose a:hover { 
          color: #1d4ed8; 
        }
        .prose hr { 
          border: none; 
          border-top: 1px solid #e5e7eb; 
          margin: 1.5rem 0; 
        }
        .prose img {
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .prose del {
          text-decoration: line-through;
          opacity: 0.7;
        }
        .prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          overflow: hidden;
        }
        .prose thead {
          background-color: #f9fafb;
        }
        .prose th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
        }
        .prose th:last-child {
          border-right: none;
        }
        .prose td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
        }
        .prose td:last-child {
          border-right: none;
        }
        .prose tbody tr:last-child td {
          border-bottom: none;
        }
        .prose tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .prose tbody tr:hover {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
}