import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function CssBeautifyMinify() {
  const [inputCss, setInputCss] = useState('');
  const [formattedCss, setFormattedCss] = useState('');
  const [message, setMessage] = useState('');

  const beautifyCss = () => {
    if (!inputCss.trim()) {
      setFormattedCss('');
      setMessage('');
      return;
    }

    try {
      let formatted = inputCss
        .replace(/\s*{\s*/g, ' {\n')
        .replace(/;\s*/g, ';\n')
        .replace(/}\s*/g, '\n}\n')
        .replace(/,\s*/g, ',\n')
        .replace(/\/\*[\s\S]*?\*\//g, (match) => '\n' + match + '\n')
        .replace(/^\s*\n/gm, '')
        .trim();

      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentSize = 2;
      
      const beautified = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        if (trimmed === '}' || trimmed.startsWith('}')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmed;

        if (trimmed.endsWith('{')) {
          indentLevel++;
        }

        return indentedLine;
      }).filter(line => line.trim() !== '').join('\n');

      const finalFormatted = beautified
        .replace(/\n\s*\n/g, '\n')
        .replace(/{\n\s*}/g, '{ }')
        .trim();

      setFormattedCss(finalFormatted);
      setMessage('✅ CSS beautified successfully');
    } catch (error) {
      setMessage(`❌ Error beautifying CSS: ${error.message}`);
      setFormattedCss('');
    }
  };

  const minifyCss = () => {
    if (!inputCss.trim()) {
      setFormattedCss('');
      setMessage('');
      return;
    }

    try {
      const minified = inputCss
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/;\s*}/g, '}')
        .replace(/\s*{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .replace(/,\s*/g, ',')
        .replace(/:\s*/g, ':')
        .replace(/\s*>\s*/g, '>')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*~\s*/g, '~')
        .replace(/\s*\|\s*/g, '|')
        .replace(/\s*\^\s*/g, '^')
        .replace(/\s*\$\s*/g, '$')
        .replace(/\s*\*\s*/g, '*')
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
        .trim();

      setFormattedCss(minified);
      setMessage('✅ CSS minified successfully');
    } catch (error) {
      setMessage(`❌ Error minifying CSS: ${error.message}`);
      setFormattedCss('');
    }
  };

  const validateCss = () => {
    if (!inputCss.trim()) {
      setMessage('');
      return;
    }

    try {
      const braceCount = (inputCss.match(/{/g) || []).length - (inputCss.match(/}/g) || []).length;
      const hasValidSyntax = !inputCss.match(/[{}];[\s]*[{}]/);
      const hasValidSelectors = !inputCss.match(/^\s*[{}]/);

      if (braceCount !== 0) {
        setMessage('⚠️ CSS has mismatched braces');
      } else if (!hasValidSyntax) {
        setMessage('⚠️ CSS may have syntax issues');
      } else if (!hasValidSelectors) {
        setMessage('⚠️ CSS may have invalid selectors');
      } else {
        setMessage('✅ CSS structure appears valid');
      }
    } catch (error) {
      setMessage(`❌ Error validating CSS: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputCss('');
    setFormattedCss('');
    setMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedCss) {
      try {
        await navigator.clipboard.writeText(formattedCss);
        setMessage('✅ Copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy to clipboard');
      }
    }
  };

  const sampleCss = `.container{width:100%;max-width:1200px;margin:0 auto;padding:0 20px}.header{background:#333;color:white;padding:1rem}.nav ul{list-style:none;display:flex;gap:1rem;margin:0;padding:0}.nav a{color:white;text-decoration:none}.nav a:hover{text-decoration:underline}.button{background:#007bff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer}.button:hover{background:#0056b3}@media(max-width:768px){.container{padding:0 10px}.nav ul{flex-direction:column}}`;

  const loadSample = () => {
    setInputCss(sampleCss);
    setMessage('Sample CSS loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSS Beautify/Minify</h1>
        <p className="text-muted-foreground">Format and minify CSS code for better readability and optimization</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input CSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputCss">Paste your CSS here:</Label>
                <textarea 
                  id="inputCss"
                  value={inputCss}
                  onChange={(e) => setInputCss(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='.selector { property: value; }'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={beautifyCss} className="flex-1">
                  Beautify CSS
                </Button>
                <Button onClick={minifyCss} variant="outline" className="flex-1">
                  Minify CSS
                </Button>
                <Button onClick={validateCss} variant="outline" className="flex-1">
                  Validate CSS
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

        {formattedCss && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted CSS</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedCss">Formatted result:</Label>
                <textarea 
                  id="formattedCss"
                  value={formattedCss}
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