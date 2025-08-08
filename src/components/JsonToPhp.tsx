import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function JsonToPhp() {
  const [inputJson, setInputJson] = useState('');
  const [phpOutput, setPhpOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [syntaxStyle, setSyntaxStyle] = useState<'array' | 'bracket'>('array');
  const [includePhpTags, setIncludePhpTags] = useState(true);
  const [variableName, setVariableName] = useState('$data');

  const escapePhpString = (str: string, quote: "'" | '"' = "'"): string => {
    if (quote === "'") {
      return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
    } else {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t') + '"';
    }
  };

  const convertValueToPhp = (value: any, indent: number = 0, useBrackets: boolean = false): string => {
    const indentStr = '    '.repeat(indent);
    const nextIndentStr = '    '.repeat(indent + 1);

    if (value === null) {
      return 'null';
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'string') {
      // Use single quotes for simple strings, double quotes for strings with special characters
      if (value.includes('\n') || value.includes('\r') || value.includes('\t')) {
        return escapePhpString(value, '"');
      } else {
        return escapePhpString(value, "'");
      }
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return useBrackets ? '[]' : 'array()';
      }

      const isSequentialArray = value.every((_, index) => index === parseInt(String(index)));
      
      if (useBrackets) {
        const items = value.map((item, index) => {
          const convertedValue = convertValueToPhp(item, indent + 1, useBrackets);
          if (isSequentialArray) {
            return `${nextIndentStr}${convertedValue}`;
          } else {
            return `${nextIndentStr}${index} => ${convertedValue}`;
          }
        });
        
        return `[\n${items.join(',\n')}\n${indentStr}]`;
      } else {
        const items = value.map((item, index) => {
          const convertedValue = convertValueToPhp(item, indent + 1, useBrackets);
          if (isSequentialArray) {
            return `${nextIndentStr}${convertedValue}`;
          } else {
            return `${nextIndentStr}${index} => ${convertedValue}`;
          }
        });
        
        return `array(\n${items.join(',\n')}\n${indentStr})`;
      }
    }

    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value);
      
      if (entries.length === 0) {
        return useBrackets ? '[]' : 'array()';
      }

      if (useBrackets) {
        const items = entries.map(([key, val]) => {
          const convertedValue = convertValueToPhp(val, indent + 1, useBrackets);
          const escapedKey = escapePhpString(key);
          return `${nextIndentStr}${escapedKey} => ${convertedValue}`;
        });
        
        return `[\n${items.join(',\n')}\n${indentStr}]`;
      } else {
        const items = entries.map(([key, val]) => {
          const convertedValue = convertValueToPhp(val, indent + 1, useBrackets);
          const escapedKey = escapePhpString(key);
          return `${nextIndentStr}${escapedKey} => ${convertedValue}`;
        });
        
        return `array(\n${items.join(',\n')}\n${indentStr})`;
      }
    }

    return 'null';
  };

  const convertJsonToPhp = () => {
    try {
      if (!inputJson.trim()) {
        setPhpOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = JSON.parse(inputJson);
      const useBrackets = syntaxStyle === 'bracket';
      const phpArray = convertValueToPhp(parsed, 0, useBrackets);
      
      let result = '';
      
      if (includePhpTags) {
        result += '<?php\n\n';
      }
      
      result += `${variableName} = ${phpArray};`;
      
      if (includePhpTags) {
        result += '\n\n?>';
      }
      
      setPhpOutput(result);
      setIsValid(true);
      setErrorMessage('✅ Successfully converted JSON to PHP');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPhpOutput('');
    }
  };

  const clearAll = () => {
    setInputJson('');
    setPhpOutput('');
    setIsValid(true);
    setErrorMessage('');
  };

  const copyToClipboard = async () => {
    if (phpOutput) {
      try {
        await navigator.clipboard.writeText(phpOutput);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const downloadPhp = () => {
    if (phpOutput) {
      const blob = new Blob([phpOutput], { type: 'application/x-httpd-php;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'converted-data.php');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const loadSimpleExample = () => {
    const simpleExample = `{
  "name": "John Doe",
  "age": 30,
  "active": true,
  "skills": ["PHP", "JavaScript", "MySQL"]
}`;
    
    setInputJson(simpleExample);
  };

  const loadComplexExample = () => {
    const complexExample = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zipcode": "10001"
    },
    "skills": ["PHP", "JavaScript", "MySQL"],
    "active": true,
    "metadata": null
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "zipcode": "90210"
    },
    "skills": ["Python", "Django", "PostgreSQL"],
    "active": false,
    "metadata": {
      "notes": "Special characters: \\n\\t\\"quotes\\""
    }
  }
]`;
    
    setInputJson(complexExample);
  };

  const loadNestedExample = () => {
    const nestedExample = `{
  "config": {
    "database": {
      "host": "localhost",
      "port": 3306,
      "credentials": {
        "username": "admin",
        "password": "secret"
      }
    },
    "features": [
      {
        "name": "authentication",
        "enabled": true,
        "options": {
          "timeout": 3600,
          "methods": ["password", "oauth"]
        }
      },
      {
        "name": "logging",
        "enabled": false,
        "options": null
      }
    ]
  }
}`;
    
    setInputJson(nestedExample);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JSON to PHP</h1>
        <p className="text-muted-foreground">Convert JSON data to PHP array format with customizable options</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>JSON Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputJson">Paste your JSON here:</Label>
                <textarea 
                  id="inputJson"
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='{"name": "John", "age": 30, "skills": ["PHP", "JS"]}'
                />
              </div>
              
              {/* Configuration Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="syntaxStyle">Array Syntax:</Label>
                  <select 
                    id="syntaxStyle"
                    value={syntaxStyle}
                    onChange={(e) => setSyntaxStyle(e.target.value as 'array' | 'bracket')}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="array">array() syntax</option>
                    <option value="bracket">[] syntax</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variableName">Variable Name:</Label>
                  <input 
                    id="variableName"
                    type="text"
                    value={variableName}
                    onChange={(e) => setVariableName(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="$data"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    id="includePhpTags"
                    type="checkbox"
                    checked={includePhpTags}
                    onChange={(e) => setIncludePhpTags(e.target.checked)}
                    className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor="includePhpTags">Include PHP tags</Label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertJsonToPhp} className="flex-1">
                  Convert to PHP
                </Button>
                <Button onClick={loadSimpleExample} variant="outline">
                  Simple Example
                </Button>
                <Button onClick={loadComplexExample} variant="outline">
                  Complex Example
                </Button>
                <Button onClick={loadNestedExample} variant="outline">
                  Nested Example
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

        {phpOutput && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>PHP Output</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadPhp} variant="outline" size="sm">
                  Download PHP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="phpOutput">Converted PHP:</Label>
                <textarea 
                  id="phpOutput"
                  value={phpOutput}
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