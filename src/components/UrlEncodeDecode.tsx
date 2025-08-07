import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function UrlEncodeDecode() {
  const [normalText, setNormalText] = useState('');
  const [encodedText, setEncodedText] = useState('');

  const encodeUrl = () => {
    try {
      const encoded = encodeURIComponent(normalText);
      setEncodedText(encoded);
    } catch (error) {
      setEncodedText('Error: Unable to encode text');
    }
  };

  const decodeUrl = () => {
    try {
      const decoded = decodeURIComponent(encodedText);
      setNormalText(decoded);
    } catch (error) {
      setNormalText('Error: Invalid URL encoded string');
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
            <Button onClick={encodeUrl} className="w-full">
              Encode to URL
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL Encoded Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encodedText">Enter URL encoded text to decode:</Label>
              <textarea 
                id="encodedText"
                value={encodedText}
                onChange={(e) => setEncodedText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Paste your URL encoded text here..."
              />
            </div>
            <Button onClick={decodeUrl} className="w-full">
              Decode from URL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}