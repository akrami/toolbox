import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ScssBeautifyMinify() {
  const [inputScss, setInputScss] = useState('');
  const [formattedScss, setFormattedScss] = useState('');
  const [message, setMessage] = useState('');

  const beautifyScss = () => {
    if (!inputScss.trim()) {
      setFormattedScss('');
      setMessage('');
      return;
    }

    try {
      let formatted = inputScss
        .replace(/\s*{\s*/g, ' {\n')
        .replace(/;\s*/g, ';\n')
        .replace(/}\s*/g, '\n}\n')
        .replace(/,\s*/g, ',\n')
        .replace(/\/\*[\s\S]*?\*\//g, (match) => '\n' + match + '\n')
        .replace(/\/\/.*$/gm, (match) => match)
        .replace(/@import\s+/g, '@import ')
        .replace(/@include\s+/g, '@include ')
        .replace(/@extend\s+/g, '@extend ')
        .replace(/@mixin\s+/g, '@mixin ')
        .replace(/@function\s+/g, '@function ')
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

        // Handle SCSS specific directives
        let currentIndent = indentLevel;
        if (trimmed.startsWith('@import') || 
            trimmed.startsWith('@use') || 
            trimmed.startsWith('@forward')) {
          currentIndent = 0;
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
        .replace(/(@import[^;]*);/g, '$1;\n')
        .trim();

      setFormattedScss(finalFormatted);
      setMessage('✅ SCSS beautified successfully');
    } catch (error) {
      setMessage(`❌ Error beautifying SCSS: ${error.message}`);
      setFormattedScss('');
    }
  };

  const minifyScss = () => {
    if (!inputScss.trim()) {
      setFormattedScss('');
      setMessage('');
      return;
    }

    try {
      const minified = inputScss
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
        .replace(/\s*%\s*/g, '%')
        .replace(/\s*#\s*/g, '#')
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
        .trim();

      setFormattedScss(minified);
      setMessage('✅ SCSS minified successfully');
    } catch (error) {
      setMessage(`❌ Error minifying SCSS: ${error.message}`);
      setFormattedScss('');
    }
  };

  const validateScss = () => {
    if (!inputScss.trim()) {
      setMessage('');
      return;
    }

    try {
      const braceCount = (inputScss.match(/{/g) || []).length - (inputScss.match(/}/g) || []).length;
      const parenCount = (inputScss.match(/\(/g) || []).length - (inputScss.match(/\)/g) || []).length;
      const hasValidSyntax = !inputScss.match(/[{}];[\s]*[{}]/);
      const hasValidSelectors = !inputScss.match(/^\s*[{}]/);
      const hasValidVariables = !inputScss.match(/\$[^a-zA-Z-]/);
      const hasValidMixins = !inputScss.match(/@mixin\s*[^a-zA-Z]/);

      if (braceCount !== 0) {
        setMessage('⚠️ SCSS has mismatched braces');
      } else if (parenCount !== 0) {
        setMessage('⚠️ SCSS has mismatched parentheses');
      } else if (!hasValidSyntax) {
        setMessage('⚠️ SCSS may have syntax issues');
      } else if (!hasValidSelectors) {
        setMessage('⚠️ SCSS may have invalid selectors');
      } else if (!hasValidVariables) {
        setMessage('⚠️ SCSS may have invalid variable syntax');
      } else if (!hasValidMixins) {
        setMessage('⚠️ SCSS may have invalid mixin syntax');
      } else {
        setMessage('✅ SCSS structure appears valid');
      }
    } catch (error) {
      setMessage(`❌ Error validating SCSS: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputScss('');
    setFormattedScss('');
    setMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedScss) {
      try {
        await navigator.clipboard.writeText(formattedScss);
        setMessage('✅ Copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy to clipboard');
      }
    }
  };

  const sampleScss = `$primary-color: #007bff;$secondary-color: #6c757d;$border-radius: 4px;$padding: 1rem;@mixin button-style($bg-color) {background: $bg-color;border: none;border-radius: $border-radius;padding: $padding;cursor: pointer;transition: background-color 0.3s ease;&:hover {background: darken($bg-color, 10%);}&:active {background: darken($bg-color, 20%);}}%shared-properties {font-family: 'Arial', sans-serif;line-height: 1.5;}@function calculate-rem($px) {@return $px / 16px * 1rem;}@media (max-width: 768px) {.mobile-only {display: block;}}.container{@extend %shared-properties;width:100%;max-width:1200px;margin:0 auto;padding:0 calculate-rem(20px);.header{background:$primary-color;color:white;padding:$padding;&.large{padding:$padding * 1.5;}.nav{ul{list-style:none;display:flex;gap:calculate-rem(16px);margin:0;padding:0;@media (max-width: 768px){flex-direction:column;}}a{color:white;text-decoration:none;&:hover{text-decoration:underline;}}}}.button{@include button-style($primary-color);&.secondary{@include button-style($secondary-color);}}}`;

  const loadSample = () => {
    setInputScss(sampleScss);
    setMessage('Sample SCSS loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SCSS Beautify/Minify</h1>
        <p className="text-muted-foreground">Format and minify SCSS stylesheets with proper indentation and structure</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input SCSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputScss">Paste your SCSS here:</Label>
                <textarea 
                  id="inputScss"
                  value={inputScss}
                  onChange={(e) => setInputScss(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='$color: #333; .selector { color: $color; &:hover { color: darken($color, 10%); } }'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={beautifyScss} className="flex-1">
                  Beautify SCSS
                </Button>
                <Button onClick={minifyScss} variant="outline" className="flex-1">
                  Minify SCSS
                </Button>
                <Button onClick={validateScss} variant="outline" className="flex-1">
                  Validate SCSS
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

        {formattedScss && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted SCSS</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedScss">Formatted result:</Label>
                <textarea 
                  id="formattedScss"
                  value={formattedScss}
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