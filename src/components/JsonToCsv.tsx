import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function JsonToCsv() {
  const [inputJson, setInputJson] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const flattenObject = (obj: any, prefix: string = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value);
        } else {
          flattened[newKey] = value;
        }
      }
    }
    
    return flattened;
  };

  const convertJsonToCsv = () => {
    try {
      if (!inputJson.trim()) {
        setCsvOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = JSON.parse(inputJson);
      let data: any[] = [];

      // Handle different JSON structures
      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's a single object, wrap it in an array
        data = [parsed];
      } else {
        throw new Error('JSON must be an array of objects or a single object');
      }

      if (data.length === 0) {
        setCsvOutput('');
        setIsValid(true);
        setErrorMessage('✅ Successfully converted JSON to CSV (empty result)');
        return;
      }

      // Flatten all objects and collect all possible keys
      const flattenedData = data.map(item => flattenObject(item));
      const allKeys = new Set<string>();
      flattenedData.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      const headers = Array.from(allKeys).sort();
      
      // Create CSV content
      const csvRows: string[] = [];
      
      // Add header row
      csvRows.push(headers.map(header => escapeCSV(header)).join(','));
      
      // Add data rows
      flattenedData.forEach(item => {
        const row = headers.map(header => escapeCSV(item[header] || ''));
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      setCsvOutput(csvContent);
      setIsValid(true);
      setErrorMessage(`✅ Successfully converted JSON to CSV (${data.length} rows, ${headers.length} columns)`);
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCsvOutput('');
    }
  };

  const clearAll = () => {
    setInputJson('');
    setCsvOutput('');
    setIsValid(true);
    setErrorMessage('');
  };

  const copyToClipboard = async () => {
    if (csvOutput) {
      try {
        await navigator.clipboard.writeText(csvOutput);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const downloadCsv = () => {
    if (csvOutput) {
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'converted-data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const loadExample = () => {
    const exampleJson = `[
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
    "skills": ["JavaScript", "React", "Node.js"]
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
    "skills": ["Python", "Django", "PostgreSQL"]
  }
]`;
    
    setInputJson(exampleJson);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JSON to CSV</h1>
        <p className="text-muted-foreground">Convert JSON data to CSV format with automatic flattening</p>
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
                  placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={convertJsonToCsv} className="flex-1">
                  Convert to CSV
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

        {csvOutput && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>CSV Output</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadCsv} variant="outline" size="sm">
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="csvOutput">Converted CSV:</Label>
                <textarea 
                  id="csvOutput"
                  value={csvOutput}
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