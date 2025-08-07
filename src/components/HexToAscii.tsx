import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function HexToAscii() {
  const [hexText, setHexText] = useState('');
  const [asciiText, setAsciiText] = useState('');

  const hexToAscii = () => {
    try {
      // Remove spaces and convert to lowercase
      const cleanHex = hexText.replace(/\s+/g, '').toLowerCase();
      
      // Validate hex string (only contains 0-9 and a-f)
      if (!/^[0-9a-f]*$/i.test(cleanHex)) {
        setAsciiText('Error: Invalid hex string. Only 0-9 and A-F characters allowed.');
        return;
      }
      
      // Hex string must have even length
      if (cleanHex.length % 2 !== 0) {
        setAsciiText('Error: Hex string must have even number of characters.');
        return;
      }
      
      let result = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        const hexByte = cleanHex.substr(i, 2);
        const charCode = parseInt(hexByte, 16);
        result += String.fromCharCode(charCode);
      }
      
      setAsciiText(result);
    } catch (error) {
      setAsciiText('Error: Unable to convert hex to ASCII');
    }
  };

  const asciiToHex = () => {
    try {
      let result = '';
      for (let i = 0; i < asciiText.length; i++) {
        const hex = asciiText.charCodeAt(i).toString(16).padStart(2, '0');
        result += hex;
      }
      setHexText(result.toUpperCase());
    } catch (error) {
      setHexText('Error: Unable to convert ASCII to hex');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hex Input</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hexText">Enter hex string to convert:</Label>
              <textarea 
                id="hexText"
                value={hexText}
                onChange={(e) => setHexText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Enter hex string (e.g., 48656C6C6F20576F726C64)"
              />
            </div>
            <Button onClick={hexToAscii} className="w-full">
              Convert Hex to ASCII
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ASCII Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asciiText">ASCII text:</Label>
              <textarea 
                id="asciiText"
                value={asciiText}
                onChange={(e) => setAsciiText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="ASCII output will appear here..."
              />
            </div>
            <Button onClick={asciiToHex} className="w-full">
              Convert ASCII to Hex
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}