import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function BackslashEscape() {
  const [normalText, setNormalText] = useState('');
  const [encodedText, setEncodedText] = useState('');

  const encodeText = () => {
    try {
      const encoded = normalText
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/[\b]/g, '\\b')
        .replace(/\f/g, '\\f')
        .replace(/\v/g, '\\v')
        .replace(/\0/g, '\\0');
      setEncodedText(encoded);
    } catch (error) {
      setEncodedText('Error: Unable to encode text');
    }
  };

  const decodeText = () => {
    try {
      const decoded = encodedText
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\b/g, '\b')
        .replace(/\\f/g, '\f')
        .replace(/\\v/g, '\v')
        .replace(/\\0/g, '\0')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      setNormalText(decoded);
    } catch (error) {
      setNormalText('Error: Unable to decode text');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Normal Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="normalText">Enter text to encode:</Label>
              <textarea 
                id="normalText"
                value={normalText}
                onChange={(e) => setNormalText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Type or paste your text here..."
              />
            </div>
            <Button onClick={encodeText} className="w-full">
              Encode with Backslash Escapes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backslash Escaped Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encodedText">Enter backslash escaped text to decode:</Label>
              <textarea 
                id="encodedText"
                value={encodedText}
                onChange={(e) => setEncodedText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Paste your backslash escaped text here..."
              />
            </div>
            <Button onClick={decodeText} className="w-full">
              Decode Backslash Escapes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}