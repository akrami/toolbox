import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LessBeautifyMinify() {
  const [inputLess, setInputLess] = useState('');
  const [formattedLess, setFormattedLess] = useState('');
  const [message, setMessage] = useState('');

  const beautifyLess = () => {
    if (!inputLess.trim()) {
      setFormattedLess('');
      setMessage('');
      return;
    }

    try {
      let formatted = inputLess
        .replace(/\s*{\s*/g, ' {\n')
        .replace(/;\s*/g, ';\n')
        .replace(/}\s*/g, '\n}\n')
        .replace(/,\s*/g, ',\n')
        .replace(/\/\*[\s\S]*?\*\//g, (match) => '\n' + match + '\n')
        .replace(/\/\/.*$/gm, (match) => match)
        .replace(/&\s*/g, '&\n')
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

        // Handle nested selectors and mixins
        let currentIndent = indentLevel;
        if (trimmed.startsWith('&') || trimmed.startsWith('.') && trimmed.includes('(')) {
          // Keep current indentation for pseudo selectors and mixins
        }

        const indentedLine = ' '.repeat(currentIndent * indentSize) + trimmed;

        if (trimmed.endsWith('{')) {
          indentLevel++;
        }

        return indentedLine;
      }).filter(line => line.trim() !== '').join('\n');

      const finalFormatted = beautified
        .replace(/\n\s*\n/g, '\n')
        .replace(/{\n\s*}/g, '{ }')
        .trim();

      setFormattedLess(finalFormatted);
      setMessage('✅ LESS beautified successfully');
    } catch (error) {
      setMessage(`❌ Error beautifying LESS: ${error.message}`);
      setFormattedLess('');
    }
  };

  const minifyLess = () => {
    if (!inputLess.trim()) {
      setFormattedLess('');
      setMessage('');
      return;
    }

    try {
      const minified = inputLess
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
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
        .replace(/\s*&\s*/g, '&')
        .replace(/\s*@\s*/g, '@')
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
        .trim();

      setFormattedLess(minified);
      setMessage('✅ LESS minified successfully');
    } catch (error) {
      setMessage(`❌ Error minifying LESS: ${error.message}`);
      setFormattedLess('');
    }
  };

  const validateLess = () => {
    if (!inputLess.trim()) {
      setMessage('');
      return;
    }

    try {
      const braceCount = (inputLess.match(/{/g) || []).length - (inputLess.match(/}/g) || []).length;
      const parenCount = (inputLess.match(/\(/g) || []).length - (inputLess.match(/\)/g) || []).length;
      const hasValidSyntax = !inputLess.match(/[{}];[\s]*[{}]/);
      const hasValidSelectors = !inputLess.match(/^\s*[{}]/);
      const hasValidVariables = !inputLess.match(/@[^a-zA-Z-]/);

      if (braceCount !== 0) {
        setMessage('⚠️ LESS has mismatched braces');
      } else if (parenCount !== 0) {
        setMessage('⚠️ LESS has mismatched parentheses');
      } else if (!hasValidSyntax) {
        setMessage('⚠️ LESS may have syntax issues');
      } else if (!hasValidSelectors) {
        setMessage('⚠️ LESS may have invalid selectors');
      } else if (!hasValidVariables) {
        setMessage('⚠️ LESS may have invalid variable syntax');
      } else {
        setMessage('✅ LESS structure appears valid');
      }
    } catch (error) {
      setMessage(`❌ Error validating LESS: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputLess('');
    setFormattedLess('');
    setMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedLess) {
      try {
        await navigator.clipboard.writeText(formattedLess);
        setMessage('✅ Copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy to clipboard');
      }
    }
  };

  const sampleLess = `@primary-color: #007bff;@secondary-color: #6c757d;@border-radius: 4px;@padding: 1rem;.mixin-button(@bg-color) {background: @bg-color;border: none;border-radius: @border-radius;padding: @padding;cursor: pointer;&:hover {background: darken(@bg-color, 10%);}}@media-tablet: ~"(max-width: 768px)";.container{width:100%;max-width:1200px;margin:0 auto;padding:0 20px;.header{background:@primary-color;color:white;padding:@padding;&.large{padding:@padding * 1.5;}.nav{ul{list-style:none;display:flex;gap:1rem;margin:0;padding:0;@media @media-tablet{flex-direction:column;}}a{color:white;text-decoration:none;&:hover{text-decoration:underline;}}}}.button{.mixin-button(@primary-color);&.secondary{.mixin-button(@secondary-color);}}}`;

  const loadSample = () => {
    setInputLess(sampleLess);
    setMessage('Sample LESS loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LESS Beautify/Minify</h1>
        <p className="text-muted-foreground">Format and minify LESS stylesheets with proper indentation and structure</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input LESS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputLess">Paste your LESS here:</Label>
                <textarea 
                  id="inputLess"
                  value={inputLess}
                  onChange={(e) => setInputLess(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='@color: #333; .selector { color: @color; &:hover { color: darken(@color, 10%); } }'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={beautifyLess} className="flex-1">
                  Beautify LESS
                </Button>
                <Button onClick={minifyLess} variant="outline" className="flex-1">
                  Minify LESS
                </Button>
                <Button onClick={validateLess} variant="outline" className="flex-1">
                  Validate LESS
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

        {formattedLess && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted LESS</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedLess">Formatted result:</Label>
                <textarea 
                  id="formattedLess"
                  value={formattedLess}
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