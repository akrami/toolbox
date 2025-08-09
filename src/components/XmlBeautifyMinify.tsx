import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function XmlBeautifyMinify() {
  const [inputXml, setInputXml] = useState('');
  const [formattedXml, setFormattedXml] = useState('');
  const [message, setMessage] = useState('');

  const beautifyXml = () => {
    if (!inputXml.trim()) {
      setFormattedXml('');
      setMessage('');
      return;
    }

    try {
      let formatted = inputXml
        .replace(/></g, '>\n<')
        .replace(/^\s*\n/gm, '')
        .trim();

      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentSize = 2;
      
      const beautified = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        // Handle closing tags
        if (trimmed.startsWith('</') && !trimmed.includes('><')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmed;

        // Handle opening tags (but not self-closing or XML declarations)
        if (trimmed.startsWith('<') && 
            !trimmed.startsWith('</') && 
            !trimmed.startsWith('<?') && 
            !trimmed.startsWith('<!') && 
            !trimmed.endsWith('/>') &&
            !trimmed.includes('><')) {
          
          // Extract tag name to check if it's a self-closing HTML tag in XML context
          const tagMatch = trimmed.match(/<(\w+)/);
          if (tagMatch) {
            indentLevel++;
          }
        }

        return indentedLine;
      }).join('\n');

      // Clean up extra newlines and format attributes
      const finalFormatted = beautified
        .replace(/\n\s*\n/g, '\n')
        .replace(/(<\?xml[^>]*\?>)\n?/g, '$1\n')
        .replace(/(<!\[CDATA\[[\s\S]*?\]\]>)/g, (match) => {
          return match.replace(/\n/g, '\n' + ' '.repeat((indentLevel - 1) * indentSize));
        });

      setFormattedXml(finalFormatted);
      setMessage('✅ XML beautified successfully');
    } catch (error) {
      setMessage(`❌ Error beautifying XML: ${error.message}`);
      setFormattedXml('');
    }
  };

  const minifyXml = () => {
    if (!inputXml.trim()) {
      setFormattedXml('');
      setMessage('');
      return;
    }

    try {
      const minified = inputXml
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\s+([>])/g, '$1')
        .replace(/([<])\s+/g, '$1')
        .replace(/\s*=\s*/g, '=')
        .replace(/"\s+/g, '" ')
        .replace(/\s+"/g, ' "')
        .trim();

      setFormattedXml(minified);
      setMessage('✅ XML minified successfully');
    } catch (error) {
      setMessage(`❌ Error minifying XML: ${error.message}`);
      setFormattedXml('');
    }
  };

  const validateXml = () => {
    if (!inputXml.trim()) {
      setMessage('');
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, 'application/xml');
      const parserErrors = xmlDoc.querySelectorAll('parsererror');
      
      if (parserErrors.length > 0) {
        const errorText = parserErrors[0].textContent || 'Unknown XML parsing error';
        setMessage(`❌ XML parsing error: ${errorText}`);
      } else {
        // Additional checks for well-formed XML
        const openTags = (inputXml.match(/<[^/!?][^>]*[^/]>/g) || []).length;
        const closeTags = (inputXml.match(/<\/[^>]+>/g) || []).length;
        const selfClosingTags = (inputXml.match(/<[^>]*\/>/g) || []).length;
        
        // Check if XML declaration is present and properly formatted
        const hasValidDeclaration = !inputXml.includes('<?xml') || 
          inputXml.match(/^<\?xml\s+version\s*=\s*["'][^"']+["']/);

        if (!hasValidDeclaration) {
          setMessage('⚠️ XML declaration may be malformed');
        } else if (openTags !== closeTags) {
          setMessage('⚠️ XML may have mismatched opening/closing tags');
        } else {
          setMessage('✅ XML structure appears valid');
        }
      }
    } catch (error) {
      setMessage(`❌ Error validating XML: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputXml('');
    setFormattedXml('');
    setMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedXml) {
      try {
        await navigator.clipboard.writeText(formattedXml);
        setMessage('✅ Copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy to clipboard');
      }
    }
  };

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?><bookstore xmlns:fiction="http://example.com/fiction"><book id="1" category="fiction:novel"><title lang="en">Great Gatsby</title><author><name>F. Scott Fitzgerald</name><birth-year>1896</birth-year></author><price currency="USD">12.99</price><description><![CDATA[A classic American novel about the Jazz Age and the American Dream.]]></description><reviews><review rating="5"><text>Excellent book!</text><reviewer>John Doe</reviewer></review><review rating="4"><text>Very good read.</text><reviewer>Jane Smith</reviewer></review></reviews></book><book id="2" category="science"><title lang="en">Brief History of Time</title><author><name>Stephen Hawking</name><birth-year>1942</birth-year></author><price currency="USD">15.99</price><description><![CDATA[An accessible introduction to cosmology and theoretical physics.]]></description><reviews><review rating="5"><text>Mind-blowing!</text><reviewer>Alice Johnson</reviewer></review></reviews></book></bookstore>`;

  const loadSample = () => {
    setInputXml(sampleXml);
    setMessage('Sample XML loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">XML Beautify/Minify</h1>
        <p className="text-muted-foreground">Format and minify XML documents with proper structure and indentation</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input XML</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputXml">Paste your XML here:</Label>
                <textarea 
                  id="inputXml"
                  value={inputXml}
                  onChange={(e) => setInputXml(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='<?xml version="1.0"?><root><item>content</item></root>'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={beautifyXml} className="flex-1">
                  Beautify XML
                </Button>
                <Button onClick={minifyXml} variant="outline" className="flex-1">
                  Minify XML
                </Button>
                <Button onClick={validateXml} variant="outline" className="flex-1">
                  Validate XML
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

        {formattedXml && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted XML</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedXml">Formatted result:</Label>
                <textarea 
                  id="formattedXml"
                  value={formattedXml}
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