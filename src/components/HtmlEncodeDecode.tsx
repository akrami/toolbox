import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function HtmlEncodeDecode() {
  const [normalText, setNormalText] = useState('');
  const [encodedText, setEncodedText] = useState('');

  const encodeHtml = () => {
    try {
      const encoded = normalText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      setEncodedText(encoded);
    } catch (error) {
      setEncodedText('Error: Unable to encode text');
    }
  };

  const decodeHtml = () => {
    try {
      const decoded = encodedText
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
      setNormalText(decoded);
    } catch (error) {
      setNormalText('Error: Invalid HTML encoded string');
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
            <Button onClick={encodeHtml} className="w-full">
              Encode to HTML Entities
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTML Encoded Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encodedText">Enter HTML encoded text to decode:</Label>
              <textarea 
                id="encodedText"
                value={encodedText}
                onChange={(e) => setEncodedText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Paste your HTML encoded text here..."
              />
            </div>
            <Button onClick={decodeHtml} className="w-full">
              Decode from HTML Entities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}