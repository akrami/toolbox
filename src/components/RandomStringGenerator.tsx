import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface StringGeneratorOptions {
  count: number;
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  special: boolean;
  delimiter: 'newline' | 'space' | 'nothing';
}

export default function RandomStringGenerator() {
  const [generatedStrings, setGeneratedStrings] = useState('');
  const [options, setOptions] = useState<StringGeneratorOptions>({
    count: 1,
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: false,
    delimiter: 'newline',
  });
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const generateRandomString = (length: number) => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.special) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      return '';
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return result;
  };

  const handleGenerateStrings = () => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.special) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      alert('Please select at least one character group');
      return;
    }

    const strings = [];
    for (let i = 0; i < options.count; i++) {
      strings.push(generateRandomString(options.length));
    }

    let delimiter = '';
    switch (options.delimiter) {
      case 'newline':
        delimiter = '\n';
        break;
      case 'space':
        delimiter = ' ';
        break;
      case 'nothing':
        delimiter = '';
        break;
    }

    setGeneratedStrings(strings.join(delimiter));
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedStrings);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = generatedStrings;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2000);
    }
  };

  const updateOptions = <K extends keyof StringGeneratorOptions>(
    key: K, 
    value: StringGeneratorOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const delimiterLabels = {
    newline: 'New Line',
    space: 'Space',
    nothing: 'Nothing'
  };

  return (
    <div className="space-y-6">
      {/* Configuration Options */}
      <Card>
        <CardHeader>
          <CardTitle>String Generation Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Number of strings */}
            <div className="space-y-2">
              <Label htmlFor="stringCount">
                Number of strings to generate: {options.count}
              </Label>
              <Input
                id="stringCount"
                type="number"
                min="1"
                max="1000"
                value={options.count}
                onChange={(e) => updateOptions('count', Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                className="w-full"
              />
            </div>

            {/* Length of string */}
            <div className="space-y-2">
              <Label htmlFor="stringLength">
                Length of each string: {options.length}
              </Label>
              <Input
                id="stringLength"
                type="number"
                min="8"
                max="64"
                value={options.length}
                onChange={(e) => updateOptions('length', Math.max(8, Math.min(64, parseInt(e.target.value) || 8)))}
                className="w-full"
              />
            </div>

            {/* Character Groups */}
            <div className="space-y-3">
              <Label>Character Groups</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="uppercase" 
                  checked={options.uppercase}
                  onChange={(e) => updateOptions('uppercase', (e.target as HTMLInputElement).checked)}
                />
                <Label htmlFor="uppercase">
                  Uppercase Letters (A-Z)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lowercase" 
                  checked={options.lowercase}
                  onChange={(e) => updateOptions('lowercase', (e.target as HTMLInputElement).checked)}
                />
                <Label htmlFor="lowercase">
                  Lowercase Letters (a-z)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="numbers" 
                  checked={options.numbers}
                  onChange={(e) => updateOptions('numbers', (e.target as HTMLInputElement).checked)}
                />
                <Label htmlFor="numbers">
                  Numbers (0-9)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="special" 
                  checked={options.special}
                  onChange={(e) => updateOptions('special', (e.target as HTMLInputElement).checked)}
                />
                <Label htmlFor="special">
                  Special Characters (!@#$%^&*)
                </Label>
              </div>
            </div>

            {/* Delimiter */}
            <div className="space-y-2">
              <Label>Delimiter</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {delimiterLabels[options.delimiter]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem 
                    onClick={() => updateOptions('delimiter', 'newline')}
                  >
                    New Line
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateOptions('delimiter', 'space')}
                  >
                    Space
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateOptions('delimiter', 'nothing')}
                  >
                    Nothing
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Generate Button */}
            <Button onClick={handleGenerateStrings} className="w-full">
              Generate Strings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Strings Display */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Strings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea 
              value={generatedStrings}
              readOnly 
              rows={8}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-vertical"
              placeholder="Generated strings will appear here..."
            />
            <div className="flex gap-2">
              <Button onClick={handleCopyToClipboard} disabled={!generatedStrings}>
                {copyButtonText}
              </Button>
              <Button variant="outline" onClick={handleGenerateStrings}>
                Generate Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}