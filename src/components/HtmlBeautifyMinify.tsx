import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function HtmlBeautifyMinify() {
  const [inputHtml, setInputHtml] = useState('');
  const [formattedHtml, setFormattedHtml] = useState('');
  const [message, setMessage] = useState('');

  const beautifyHtml = () => {
    if (!inputHtml.trim()) {
      setFormattedHtml('');
      setMessage('');
      return;
    }

    try {
      let formatted = inputHtml
        .replace(/></g, '>\n<')
        .replace(/^\s*\n/gm, '')
        .trim();

      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentSize = 2;
      
      const beautified = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        if (trimmed.startsWith('</') && !trimmed.includes('><')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmed;

        if (trimmed.startsWith('<') && 
            !trimmed.startsWith('</') && 
            !trimmed.startsWith('<!') && 
            !trimmed.endsWith('/>') &&
            !trimmed.includes('><')) {
          const tagName = trimmed.match(/<(\w+)/)?.[1]?.toLowerCase();
          const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'];
          
          if (tagName && !selfClosingTags.includes(tagName)) {
            indentLevel++;
          }
        }

        return indentedLine;
      }).join('\n');

      setFormattedHtml(beautified);
      setMessage('✅ HTML beautified successfully');
    } catch (error) {
      setMessage(`❌ Error beautifying HTML: ${error.message}`);
      setFormattedHtml('');
    }
  };

  const minifyHtml = () => {
    if (!inputHtml.trim()) {
      setFormattedHtml('');
      setMessage('');
      return;
    }

    try {
      const minified = inputHtml
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\s+([>])/g, '$1')
        .replace(/([<])\s+/g, '$1');

      setFormattedHtml(minified);
      setMessage('✅ HTML minified successfully');
    } catch (error) {
      setMessage(`❌ Error minifying HTML: ${error.message}`);
      setFormattedHtml('');
    }
  };

  const validateHtml = () => {
    if (!inputHtml.trim()) {
      setMessage('');
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(inputHtml, 'text/html');
      const parserErrors = doc.querySelectorAll('parsererror');
      
      if (parserErrors.length > 0) {
        setMessage('⚠️ HTML may have syntax issues');
      } else {
        setMessage('✅ HTML structure appears valid');
      }
    } catch (error) {
      setMessage(`❌ Error validating HTML: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputHtml('');
    setFormattedHtml('');
    setMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedHtml) {
      try {
        await navigator.clipboard.writeText(formattedHtml);
        setMessage('✅ Copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy to clipboard');
      }
    }
  };

  const sampleHtml = `<html><head><title>Sample</title></head><body><div class="container"><h1>Hello World</h1><p>This is a <strong>sample</strong> HTML document.</p><ul><li>Item 1</li><li>Item 2</li></ul></div></body></html>`;

  const loadSample = () => {
    setInputHtml(sampleHtml);
    setMessage('Sample HTML loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HTML Beautify/Minify</h1>
        <p className="text-muted-foreground">Format and minify HTML code with proper indentation and structure</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input HTML</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputHtml">Paste your HTML here:</Label>
                <textarea 
                  id="inputHtml"
                  value={inputHtml}
                  onChange={(e) => setInputHtml(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='<div><h1>Hello World</h1><p>Sample HTML content</p></div>'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={beautifyHtml} className="flex-1">
                  Beautify HTML
                </Button>
                <Button onClick={minifyHtml} variant="outline" className="flex-1">
                  Minify HTML
                </Button>
                <Button onClick={validateHtml} variant="outline" className="flex-1">
                  Validate HTML
                </Button>
                <Button onClick={loadSample} variant="outline">
                  Load Sample
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {message && (
          <Card className={message.startsWith('✅') ? "border-green-200 bg-green-50" : message.startsWith('❌') ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
            <CardContent className="pt-6">
              <div className={`text-sm font-medium ${message.startsWith('✅') ? "text-green-700" : message.startsWith('❌') ? "text-red-700" : "text-yellow-700"}`}>
                {message}
              </div>
            </CardContent>
          </Card>
        )}

        {formattedHtml && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted HTML</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedHtml">Formatted result:</Label>
                <textarea 
                  id="formattedHtml"
                  value={formattedHtml}
                  readOnly
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}