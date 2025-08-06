import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LineSortDedupe() {
  const [inputText, setInputText] = useState('');

  const sortLines = () => {
    if (!inputText.trim()) return;
    
    const lines = inputText.split('\n');
    const sortedLines = lines.sort();
    setInputText(sortedLines.join('\n'));
  };

  const removeDuplicates = () => {
    if (!inputText.trim()) return;
    
    const lines = inputText.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    setInputText(uniqueLines.join('\n'));
  };

  const copyToClipboard = async () => {
    if (!inputText.trim()) return;
    
    try {
      await navigator.clipboard.writeText(inputText);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="textInput">Enter your lines here:</Label>
              <textarea 
                id="textInput"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Enter each line on a separate line..."
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={sortLines} variant="default">
                Sort Lines
              </Button>
              <Button onClick={removeDuplicates} variant="default">
                Remove Duplicates
              </Button>
              <Button onClick={copyToClipboard} variant="outline">
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}