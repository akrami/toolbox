import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Base64EncodeDecode() {
  const [normalText, setNormalText] = useState('');
  const [encodedText, setEncodedText] = useState('');

  const encodeToBase64 = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(normalText)));
      setEncodedText(encoded);
    } catch (error) {
      setEncodedText('Error: Unable to encode text');
    }
  };

  const decodeFromBase64 = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(encodedText)));
      setNormalText(decoded);
    } catch (error) {
      setNormalText('Error: Invalid Base64 string');
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
            <Button onClick={encodeToBase64} className="w-full">
              Encode to Base64
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Base64 Encoded Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encodedText">Enter Base64 to decode:</Label>
              <textarea 
                id="encodedText"
                value={encodedText}
                onChange={(e) => setEncodedText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Paste your Base64 encoded text here..."
              />
            </div>
            <Button onClick={decodeFromBase64} className="w-full">
              Decode from Base64
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}