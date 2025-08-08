import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function PhpToJson() {
  const [inputPhp, setInputPhp] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const parsePhpArray = (phpStr: string): any => {
    // Remove PHP opening/closing tags and whitespace
    let cleanPhp = phpStr.trim();
    cleanPhp = cleanPhp.replace(/^<\?php\s*/i, '');
    cleanPhp = cleanPhp.replace(/\?\>$/, '');
    cleanPhp = cleanPhp.trim();

    // Remove trailing semicolon if present
    if (cleanPhp.endsWith(';')) {
      cleanPhp = cleanPhp.slice(0, -1);
    }

    // Handle variable assignment (e.g., $array = ...)
    const variableMatch = cleanPhp.match(/^\$\w+\s*=\s*(.+)$/s);
    if (variableMatch) {
      cleanPhp = variableMatch[1].trim();
    }

    return parsePhpValue(cleanPhp);
  };

  const parsePhpValue = (str: string): any => {
    str = str.trim();

    // Handle arrays
    if (str.startsWith('array(') || str.startsWith('[')) {
      return parsePhpArrayStructure(str);
    }

    // Handle strings
    if ((str.startsWith('"') && str.endsWith('"')) || 
        (str.startsWith("'") && str.endsWith("'"))) {
      return parsePhpString(str);
    }

    // Handle numbers
    if (/^-?\d+(\.\d+)?$/.test(str)) {
      return parseFloat(str);
    }

    // Handle booleans
    if (str.toLowerCase() === 'true') return true;
    if (str.toLowerCase() === 'false') return false;

    // Handle null
    if (str.toLowerCase() === 'null') return null;

    // Handle constants or unquoted strings (treat as string)
    return str;
  };

  const parsePhpString = (str: string): string => {
    // Remove outer quotes
    const quote = str[0];
    let content = str.slice(1, -1);

    if (quote === '"') {
      // Handle double-quoted string escapes
      content = content
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    } else {
      // Single-quoted strings only escape single quotes and backslashes
      content = content
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
    }

    return content;
  };

  const parsePhpArrayStructure = (str: string): any => {
    str = str.trim();
    
    // Determine if it's array() syntax or [] syntax
    let isArraySyntax = false;
    let content = '';
    
    if (str.startsWith('array(')) {
      isArraySyntax = true;
      content = str.slice(6, -1); // Remove 'array(' and ')'
    } else if (str.startsWith('[')) {
      content = str.slice(1, -1); // Remove '[' and ']'
    } else {
      throw new Error('Invalid array format');
    }

    content = content.trim();
    if (!content) {
      return [];
    }

    const elements = parseArrayElements(content);
    
    // Determine if this should be an object or array
    let hasStringKeys = false;
    let hasNumericKeys = false;
    let maxNumericKey = -1;

    for (const element of elements) {
      if (element.key !== null) {
        if (typeof element.key === 'string') {
          hasStringKeys = true;
        } else if (typeof element.key === 'number') {
          hasNumericKeys = true;
          maxNumericKey = Math.max(maxNumericKey, element.key);
        }
      }
    }

    // If all elements have no keys or only numeric keys in sequence, make it an array
    if (!hasStringKeys) {
      const result: any[] = [];
      let nextIndex = 0;
      
      for (const element of elements) {
        if (element.key === null) {
          result[nextIndex] = element.value;
          nextIndex++;
        } else if (typeof element.key === 'number') {
          result[element.key] = element.value;
          nextIndex = Math.max(nextIndex, element.key + 1);
        }
      }
      
      return result;
    } else {
      // Create an object
      const result: any = {};
      let nextIndex = 0;
      
      for (const element of elements) {
        if (element.key === null) {
          result[nextIndex] = element.value;
          nextIndex++;
        } else {
          result[element.key] = element.value;
        }
      }
      
      return result;
    }
  };

  const parseArrayElements = (content: string): Array<{ key: any, value: any }> => {
    const elements: Array<{ key: any, value: any }> = [];
    let i = 0;
    
    while (i < content.length) {
      // Skip whitespace
      while (i < content.length && /\s/.test(content[i])) {
        i++;
      }
      
      if (i >= content.length) break;
      
      // Parse element (key => value or just value)
      const elementResult = parseArrayElement(content.substring(i));
      elements.push(elementResult.element);
      i += elementResult.consumed;
      
      // Skip whitespace
      while (i < content.length && /\s/.test(content[i])) {
        i++;
      }
      
      // Skip comma
      if (i < content.length && content[i] === ',') {
        i++;
      }
    }
    
    return elements;
  };

  const parseArrayElement = (str: string): { element: { key: any, value: any }, consumed: number } => {
    let i = 0;
    
    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) {
      i++;
    }
    
    // Find the arrow (=>) to determine if this has a key
    let arrowPos = -1;
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let j = i; j < str.length; j++) {
      const char = str[j];
      
      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === '(' || char === '[') {
          depth++;
        } else if (char === ')' || char === ']') {
          depth--;
        } else if (char === '=' && j + 1 < str.length && str[j + 1] === '>' && depth === 0) {
          arrowPos = j;
          break;
        } else if (char === ',' && depth === 0) {
          break;
        }
      } else {
        if (char === stringChar && (j === 0 || str[j - 1] !== '\\')) {
          inString = false;
        }
      }
    }
    
    if (arrowPos !== -1) {
      // Has key => value
      const keyStr = str.substring(i, arrowPos).trim();
      const key = parsePhpValue(keyStr);
      
      const valueStart = arrowPos + 2;
      const valueResult = parseValue(str.substring(valueStart));
      const value = valueResult.value;
      
      return {
        element: { key, value },
        consumed: valueStart + valueResult.consumed
      };
    } else {
      // Just value
      const valueResult = parseValue(str.substring(i));
      return {
        element: { key: null, value: valueResult.value },
        consumed: i + valueResult.consumed
      };
    }
  };

  const parseValue = (str: string): { value: any, consumed: number } => {
    let i = 0;
    
    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) {
      i++;
    }
    
    if (i >= str.length) {
      return { value: '', consumed: i };
    }
    
    const char = str[i];
    
    // Handle arrays
    if (char === '[' || (str.substring(i).startsWith('array('))) {
      let depth = 0;
      let j = i;
      let inString = false;
      let stringChar = '';
      
      while (j < str.length) {
        const c = str[j];
        
        if (!inString) {
          if (c === '"' || c === "'") {
            inString = true;
            stringChar = c;
          } else if (c === '(' || c === '[') {
            depth++;
          } else if (c === ')' || c === ']') {
            depth--;
            if (depth === 0) {
              j++;
              break;
            }
          }
        } else {
          if (c === stringChar && (j === 0 || str[j - 1] !== '\\')) {
            inString = false;
          }
        }
        j++;
      }
      
      const arrayStr = str.substring(i, j);
      const value = parsePhpValue(arrayStr);
      return { value, consumed: j };
    }
    
    // Handle strings
    if (char === '"' || char === "'") {
      let j = i + 1;
      while (j < str.length) {
        if (str[j] === char && str[j - 1] !== '\\') {
          j++;
          break;
        }
        j++;
      }
      
      const stringValue = parsePhpValue(str.substring(i, j));
      return { value: stringValue, consumed: j };
    }
    
    // Handle other values (numbers, booleans, null, constants)
    let j = i;
    let depth = 0;
    
    while (j < str.length) {
      const c = str[j];
      
      if (c === '(' || c === '[') {
        depth++;
      } else if (c === ')' || c === ']') {
        depth--;
      } else if ((c === ',' || c === ')' || c === ']') && depth === 0) {
        break;
      }
      
      j++;
    }
    
    const valueStr = str.substring(i, j).trim();
    const value = parsePhpValue(valueStr);
    return { value, consumed: j };
  };

  const convertPhpToJson = (shouldMinify = false) => {
    try {
      if (!inputPhp.trim()) {
        setJsonOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = parsePhpArray(inputPhp);
      const jsonString = shouldMinify 
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      
      setJsonOutput(jsonString);
      setIsValid(true);
      setErrorMessage('✅ Successfully converted PHP to JSON');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting PHP: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setJsonOutput('');
    }
  };

  const convertFormatted = () => convertPhpToJson(false);
  const convertMinified = () => convertPhpToJson(true);

  const clearAll = () => {
    setInputPhp('');
    setJsonOutput('');
    setIsValid(true);
    setErrorMessage('');
  };

  const copyToClipboard = async () => {
    if (jsonOutput) {
      try {
        await navigator.clipboard.writeText(jsonOutput);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const downloadJson = () => {
    if (jsonOutput) {
      const blob = new Blob([jsonOutput], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'converted-data.json');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const loadSimpleExample = () => {
    const simpleExample = `array(
    'name' => 'John Doe',
    'age' => 30,
    'active' => true,
    'skills' => array('PHP', 'JavaScript', 'MySQL')
)`;
    
    setInputPhp(simpleExample);
  };

  const loadComplexExample = () => {
    const complexExample = `<?php
$users = array(
    array(
        'id' => 1,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'age' => 30,
        'address' => array(
            'street' => '123 Main St',
            'city' => 'New York',
            'zipcode' => '10001'
        ),
        'skills' => array('PHP', 'JavaScript', 'MySQL'),
        'active' => true
    ),
    array(
        'id' => 2,
        'name' => 'Jane Smith',
        'email' => 'jane@example.com',
        'age' => 25,
        'address' => array(
            'street' => '456 Oak Ave',
            'city' => 'Los Angeles', 
            'zipcode' => '90210'
        ),
        'skills' => array('Python', 'Django', 'PostgreSQL'),
        'active' => false
    )
);
?>`;
    
    setInputPhp(complexExample);
  };

  const loadBracketExample = () => {
    const bracketExample = `[
    'user1' => [
        'name' => 'Alice',
        'data' => [1, 2, 3, 'test'],
        'settings' => [
            'theme' => 'dark',
            'notifications' => true
        ]
    ],
    'user2' => [
        'name' => 'Bob',
        'data' => [],
        'settings' => null
    ]
]`;
    
    setInputPhp(bracketExample);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PHP to JSON</h1>
        <p className="text-muted-foreground">Convert PHP arrays to JSON format with support for both array() and [] syntax</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PHP Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputPhp">Paste your PHP array here:</Label>
                <textarea 
                  id="inputPhp"
                  value={inputPhp}
                  onChange={(e) => setInputPhp(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder="array('key' => 'value', 'number' => 123)"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={convertFormatted} className="flex-1">
                  Convert to JSON
                </Button>
                <Button onClick={convertMinified} variant="outline" className="flex-1">
                  Convert & Minify
                </Button>
                <Button onClick={loadSimpleExample} variant="outline">
                  Simple Example
                </Button>
                <Button onClick={loadComplexExample} variant="outline">
                  Complex Example
                </Button>
                <Button onClick={loadBracketExample} variant="outline">
                  Bracket Syntax
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {errorMessage && (
          <Card className={isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="pt-6">
              <div className={`text-sm font-medium ${isValid ? "text-green-700" : "text-red-700"}`}>
                {errorMessage}
              </div>
            </CardContent>
          </Card>
        )}

        {jsonOutput && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>JSON Output</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadJson} variant="outline" size="sm">
                  Download JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="jsonOutput">Converted JSON:</Label>
                <textarea 
                  id="jsonOutput"
                  value={jsonOutput}
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