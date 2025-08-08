import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function JsonFormatValidate() {
  const [inputJson, setInputJson] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const formatJson = () => {
    try {
      if (!inputJson.trim()) {
        setFormattedJson('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
      setIsValid(true);
      setErrorMessage('✅ Valid JSON');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Invalid JSON: ${error.message}`);
      setFormattedJson('');
    }
  };

  const minifyJson = () => {
    try {
      if (!inputJson.trim()) {
        setFormattedJson('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setFormattedJson(minified);
      setIsValid(true);
      setErrorMessage('✅ Valid JSON (Minified)');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Invalid JSON: ${error.message}`);
      setFormattedJson('');
    }
  };

  const validateOnly = () => {
    try {
      if (!inputJson.trim()) {
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      JSON.parse(inputJson);
      setIsValid(true);
      setErrorMessage('✅ Valid JSON');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Invalid JSON: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputJson('');
    setFormattedJson('');
    setIsValid(true);
    setErrorMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedJson) {
      try {
        await navigator.clipboard.writeText(formattedJson);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JSON Format/Validate</h1>
        <p className="text-muted-foreground">Format, validate, and minify JSON data with syntax highlighting</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input JSON</CardTitle>
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
                  placeholder='{"name": "example", "data": [1, 2, 3]}'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={formatJson} className="flex-1">
                  Format & Validate
                </Button>
                <Button onClick={minifyJson} variant="outline" className="flex-1">
                  Minify
                </Button>
                <Button onClick={validateOnly} variant="outline" className="flex-1">
                  Validate Only
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

        {formattedJson && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted JSON</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedJson">Formatted result:</Label>
                <textarea 
                  id="formattedJson"
                  value={formattedJson}
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