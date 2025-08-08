import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function CsvToJson() {
  const [inputCsv, setInputCsv] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current.trim());
    return result;
  };

  const parseValue = (value: string): any => {
    if (value === '') {
      return null;
    }

    // Try to parse as number
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }

    // Try to parse as null
    if (value.toLowerCase() === 'null') {
      return null;
    }

    // Try to parse as JSON (for arrays/objects)
    if ((value.startsWith('[') && value.endsWith(']')) || 
        (value.startsWith('{') && value.endsWith('}'))) {
      try {
        return JSON.parse(value);
      } catch {
        // If JSON parsing fails, return as string
        return value;
      }
    }

    return value;
  };

  const unflattenObject = (obj: Record<string, any>): any => {
    const result: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const keys = key.split('.');
        let current = result;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!(k in current)) {
            current[k] = {};
          }
          current = current[k];
        }
        
        const finalKey = keys[keys.length - 1];
        current[finalKey] = obj[key];
      }
    }
    
    return result;
  };

  const convertCsvToJson = (shouldMinify = false) => {
    try {
      if (!inputCsv.trim()) {
        setJsonOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const lines = inputCsv.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        setJsonOutput('[]');
        setIsValid(true);
        setErrorMessage('✅ Successfully converted CSV to JSON (empty result)');
        return;
      }

      // Parse header row
      const headers = parseCsvLine(lines[0]).map(h => h.replace(/^["']|["']$/g, ''));
      
      if (headers.length === 0) {
        throw new Error('No headers found in CSV');
      }

      const data: any[] = [];

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        const rowData: Record<string, any> = {};

        for (let j = 0; j < headers.length; j++) {
          const value = j < row.length ? row[j].replace(/^["']|["']$/g, '') : '';
          rowData[headers[j]] = parseValue(value);
        }

        // Check if any header contains dots (flattened structure)
        const shouldUnflatten = headers.some(header => header.includes('.'));
        
        if (shouldUnflatten) {
          data.push(unflattenObject(rowData));
        } else {
          data.push(rowData);
        }
      }

      const jsonString = shouldMinify 
        ? JSON.stringify(data)
        : JSON.stringify(data, null, 2);
      
      setJsonOutput(jsonString);
      setIsValid(true);
      setErrorMessage(`✅ Successfully converted CSV to JSON (${data.length} records)`);
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setJsonOutput('');
    }
  };

  const convertFormatted = () => convertCsvToJson(false);
  const convertMinified = () => convertCsvToJson(true);

  const clearAll = () => {
    setInputCsv('');
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

  const loadExample = () => {
    const exampleCsv = `id,name,email,age,address.street,address.city,address.zipcode,skills
1,John Doe,john@example.com,30,"123 Main St","New York",10001,"[""JavaScript"", ""React"", ""Node.js""]"
2,Jane Smith,jane@example.com,25,"456 Oak Ave","Los Angeles",90210,"[""Python"", ""Django"", ""PostgreSQL""]"
3,Bob Johnson,bob@example.com,35,"789 Pine Rd","Chicago",60601,"[""Java"", ""Spring"", ""MySQL""]"`;
    
    setInputCsv(exampleCsv);
  };

  const loadSimpleExample = () => {
    const simpleExample = `name,age,city,active
Alice,25,New York,true
Bob,30,Los Angeles,false
Carol,28,Chicago,true`;
    
    setInputCsv(simpleExample);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSV to JSON</h1>
        <p className="text-muted-foreground">Convert CSV data to JSON format with automatic type detection and unflattening</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>CSV Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputCsv">Paste your CSV here:</Label>
                <textarea 
                  id="inputCsv"
                  value={inputCsv}
                  onChange={(e) => setInputCsv(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder="name,age,city&#10;Alice,25,New York&#10;Bob,30,Los Angeles"
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
                <Button onClick={loadExample} variant="outline">
                  Complex Example
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