import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function JsBeautifyMinify() {
  const [inputJs, setInputJs] = useState('');
  const [formattedJs, setFormattedJs] = useState('');
  const [message, setMessage] = useState('');

  const beautifyJs = () => {
    if (!inputJs.trim()) {
      setFormattedJs('');
      setMessage('');
      return;
    }

    try {
      let formatted = inputJs
        .replace(/;/g, ';\n')
        .replace(/{/g, ' {\n')
        .replace(/}/g, '\n}\n')
        .replace(/,/g, ',\n')
        .replace(/\bif\s*\(/g, 'if (')
        .replace(/\bfor\s*\(/g, 'for (')
        .replace(/\bwhile\s*\(/g, 'while (')
        .replace(/\bfunction\s*\(/g, 'function (')
        .replace(/\)\s*{/g, ') {')
        .replace(/}\s*else\s*{/g, '} else {')
        .replace(/}\s*catch\s*\(/g, '} catch (')
        .replace(/}\s*finally\s*{/g, '} finally {')
        .replace(/\/\/.*$/gm, (match) => match)
        .replace(/\/\*[\s\S]*?\*\//g, (match) => '\n' + match + '\n');

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

        if (trimmed.includes('case ') || trimmed.includes('default:')) {
          return ' '.repeat((indentLevel - 1) * indentSize) + trimmed;
        }

        return indentedLine;
      }).filter(line => line.trim() !== '').join('\n');

      const finalFormatted = beautified
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/;\n\s*}/g, ';\n}')
        .replace(/{\n\s*}/g, '{}')
        .trim();

      setFormattedJs(finalFormatted);
      setMessage('✅ JavaScript beautified successfully');
    } catch (error) {
      setMessage(`❌ Error beautifying JavaScript: ${error.message}`);
      setFormattedJs('');
    }
  };

  const minifyJs = () => {
    if (!inputJs.trim()) {
      setFormattedJs('');
      setMessage('');
      return;
    }

    try {
      const minified = inputJs
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/\s+/g, ' ')
        .replace(/;\s*}/g, ';}')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/;\s*/g, ';')
        .replace(/,\s*/g, ',')
        .replace(/:\s*/g, ':')
        .replace(/\s*=\s*/g, '=')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*-\s*/g, '-')
        .replace(/\s*\*\s*/g, '*')
        .replace(/\s*\/\s*/g, '/')
        .replace(/\s*%\s*/g, '%')
        .replace(/\s*<\s*/g, '<')
        .replace(/\s*>\s*/g, '>')
        .replace(/\s*<=\s*/g, '<=')
        .replace(/\s*>=\s*/g, '>=')
        .replace(/\s*==\s*/g, '==')
        .replace(/\s*!=\s*/g, '!=')
        .replace(/\s*===\s*/g, '===')
        .replace(/\s*!==\s*/g, '!==')
        .replace(/\s*&&\s*/g, '&&')
        .replace(/\s*\|\|\s*/g, '||')
        .replace(/\s*\?\s*/g, '?')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*\[\s*/g, '[')
        .replace(/\s*\]\s*/g, ']')
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
        .trim();

      setFormattedJs(minified);
      setMessage('✅ JavaScript minified successfully');
    } catch (error) {
      setMessage(`❌ Error minifying JavaScript: ${error.message}`);
      setFormattedJs('');
    }
  };

  const validateJs = () => {
    if (!inputJs.trim()) {
      setMessage('');
      return;
    }

    try {
      // Basic syntax validation
      new Function(inputJs);
      
      // Check for common issues
      const braceCount = (inputJs.match(/{/g) || []).length - (inputJs.match(/}/g) || []).length;
      const parenCount = (inputJs.match(/\(/g) || []).length - (inputJs.match(/\)/g) || []).length;
      const bracketCount = (inputJs.match(/\[/g) || []).length - (inputJs.match(/\]/g) || []).length;

      if (braceCount !== 0) {
        setMessage('⚠️ JavaScript has mismatched braces {}');
      } else if (parenCount !== 0) {
        setMessage('⚠️ JavaScript has mismatched parentheses ()');
      } else if (bracketCount !== 0) {
        setMessage('⚠️ JavaScript has mismatched brackets []');
      } else {
        setMessage('✅ JavaScript syntax appears valid');
      }
    } catch (error) {
      setMessage(`❌ JavaScript syntax error: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputJs('');
    setFormattedJs('');
    setMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedJs) {
      try {
        await navigator.clipboard.writeText(formattedJs);
        setMessage('✅ Copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy to clipboard');
      }
    }
  };

  const sampleJs = `function calculateTotal(items){let total=0;for(let i=0;i<items.length;i++){if(items[i].price>0){total+=items[i].price*items[i].quantity;}}return total;}const cart={items:[{name:"Product 1",price:29.99,quantity:2},{name:"Product 2",price:15.50,quantity:1}],addItem:function(item){this.items.push(item);},getTotal:function(){return calculateTotal(this.items);}};document.addEventListener('DOMContentLoaded',function(){const totalElement=document.getElementById('total');if(totalElement){totalElement.textContent='$'+cart.getTotal().toFixed(2);}});`;

  const loadSample = () => {
    setInputJs(sampleJs);
    setMessage('Sample JavaScript loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JS Beautify/Minify</h1>
        <p className="text-muted-foreground">Format and minify JavaScript code with proper structure and optimization</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input JavaScript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputJs">Paste your JavaScript here:</Label>
                <textarea 
                  id="inputJs"
                  value={inputJs}
                  onChange={(e) => setInputJs(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='function example() { return "Hello World"; }'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={beautifyJs} className="flex-1">
                  Beautify JS
                </Button>
                <Button onClick={minifyJs} variant="outline" className="flex-1">
                  Minify JS
                </Button>
                <Button onClick={validateJs} variant="outline" className="flex-1">
                  Validate JS
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

        {formattedJs && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted JavaScript</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedJs">Formatted result:</Label>
                <textarea 
                  id="formattedJs"
                  value={formattedJs}
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