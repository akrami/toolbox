import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function YamlToJson() {
  const [yamlInput, setYamlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Enhanced YAML parser for better array and object handling
  const parseYaml = (yamlStr: string): any => {
    const lines = yamlStr.split('\n');
    const result: any = {};
    const stack: Array<{ obj: any; indent: number; key?: string; isArray?: boolean }> = [{ obj: result, indent: -1 }];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Calculate indentation
      const indent = line.length - line.trimStart().length;
      
      // Pop from stack if we're at a lower or equal indentation level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      
      const current = stack[stack.length - 1];
      const currentObj = current.obj;
      
      if (trimmedLine.startsWith('- ')) {
        // Array item
        const value = trimmedLine.substring(2).trim();
        
        // Ensure current object is an array
        if (!Array.isArray(currentObj)) {
          // If we have a key context, set that key to be an array
          if (current.key && stack.length > 1) {
            const parent = stack[stack.length - 2].obj;
            parent[current.key] = [];
            current.obj = parent[current.key];
          }
        }
        
        if (value.includes(':')) {
          // This is an object item in the array
          const [key, ...valueParts] = value.split(':');
          const val = valueParts.join(':').trim();
          const cleanKey = key.trim().replace(/^["']|["']$/g, '');
          
          const newObj: any = {};
          if (Array.isArray(currentObj)) {
            currentObj.push(newObj);
          }
          
          if (!val || val === '') {
            // Nested object
            stack.push({ obj: newObj, indent, key: cleanKey });
          } else {
            // Key-value pair
            let parsedValue: any = val.replace(/^["']|["']$/g, '');
            
            // Parse value types
            if (parsedValue === 'null') {
              parsedValue = null;
            } else if (parsedValue === 'true') {
              parsedValue = true;
            } else if (parsedValue === 'false') {
              parsedValue = false;
            } else if (!isNaN(Number(parsedValue)) && parsedValue !== '') {
              parsedValue = Number(parsedValue);
            }
            
            newObj[cleanKey] = parsedValue;
          }
        } else {
          // Simple array item
          let parsedValue: any = value.replace(/^["']|["']$/g, '');
          
          // Parse value types
          if (parsedValue === 'null') {
            parsedValue = null;
          } else if (parsedValue === 'true') {
            parsedValue = true;
          } else if (parsedValue === 'false') {
            parsedValue = false;
          } else if (!isNaN(Number(parsedValue)) && parsedValue !== '') {
            parsedValue = Number(parsedValue);
          }
          
          if (Array.isArray(currentObj)) {
            currentObj.push(parsedValue);
          }
        }
      } else if (trimmedLine.includes(':')) {
        // Key-value pair
        const [key, ...valueParts] = trimmedLine.split(':');
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim().replace(/^["']|["']$/g, '');
        
        if (!value || value === '') {
          // This is a nested object or array indicator
          // Check if next non-empty line is an array item
          let isArrayNext = false;
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            if (!nextLine || nextLine.startsWith('#')) continue;
            if (nextLine.startsWith('- ')) {
              isArrayNext = true;
            }
            break;
          }
          
          if (isArrayNext) {
            currentObj[cleanKey] = [];
            stack.push({ obj: currentObj[cleanKey], indent, key: cleanKey, isArray: true });
          } else {
            currentObj[cleanKey] = {};
            stack.push({ obj: currentObj[cleanKey], indent, key: cleanKey });
          }
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Inline array notation
          try {
            currentObj[cleanKey] = JSON.parse(value);
          } catch {
            const arrayContent = value.slice(1, -1).trim();
            if (arrayContent) {
              currentObj[cleanKey] = arrayContent.split(',').map(item => {
                const trimmed = item.trim().replace(/^["']|["']$/g, '');
                if (trimmed === 'null') return null;
                if (trimmed === 'true') return true;
                if (trimmed === 'false') return false;
                if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
                return trimmed;
              });
            } else {
              currentObj[cleanKey] = [];
            }
          }
        } else if (value.startsWith('{') && value.endsWith('}')) {
          // Inline object notation
          try {
            currentObj[cleanKey] = JSON.parse(value);
          } catch {
            currentObj[cleanKey] = {};
          }
        } else {
          // Regular value
          let parsedValue: any = value.replace(/^["']|["']$/g, '');
          
          // Parse value types
          if (parsedValue === 'null') {
            parsedValue = null;
          } else if (parsedValue === 'true') {
            parsedValue = true;
          } else if (parsedValue === 'false') {
            parsedValue = false;
          } else if (!isNaN(Number(parsedValue)) && parsedValue !== '') {
            parsedValue = Number(parsedValue);
          }
          
          currentObj[cleanKey] = parsedValue;
        }
      }
    }
    
    return result;
  };

  const convertYamlToJson = () => {
    try {
      if (!yamlInput.trim()) {
        setJsonOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = parseYaml(yamlInput);
      const jsonString = JSON.stringify(parsed, null, 2);
      setJsonOutput(jsonString);
      setIsValid(true);
      setErrorMessage('✅ Successfully converted YAML to JSON');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setJsonOutput('');
    }
  };

  const minifyJson = () => {
    try {
      if (!yamlInput.trim()) {
        setJsonOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = parseYaml(yamlInput);
      const minified = JSON.stringify(parsed);
      setJsonOutput(minified);
      setIsValid(true);
      setErrorMessage('✅ Successfully converted YAML to JSON (Minified)');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setJsonOutput('');
    }
  };

  const clearAll = () => {
    setYamlInput('');
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

  const loadExample = () => {
    const exampleYaml = `version: 2.1
 
# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the test job"
 
# Orchestrate our job run sequence
workflows:
  build_and_test:
    jobs:
      - build
      - test`;
    
    setYamlInput(exampleYaml);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">YAML to JSON</h1>
        <p className="text-muted-foreground">Convert YAML format to JSON with validation</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>YAML Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yamlInput">Paste your YAML here:</Label>
                <textarea 
                  id="yamlInput"
                  value={yamlInput}
                  onChange={(e) => setYamlInput(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder="name: My App&#10;version: 1.0.0&#10;features:&#10;  - auth&#10;  - api"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={convertYamlToJson} className="flex-1">
                  Convert to JSON
                </Button>
                <Button onClick={minifyJson} variant="outline" className="flex-1">
                  Convert & Minify
                </Button>
                <Button onClick={loadExample} variant="outline">
                  Load Example
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
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
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