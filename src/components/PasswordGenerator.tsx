import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  specialChars: boolean;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    specialChars: false,
  });
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const generatePassword = () => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.specialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      alert('Please select at least one character type');
      return '';
    }

    let newPassword = '';
    for (let i = 0; i < options.length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return newPassword;
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = password;
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

  const updateOptions = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // Generate initial password on component mount
  useEffect(() => {
    handleGeneratePassword();
  }, []);

  // Regenerate password when options change
  useEffect(() => {
    if (password) { // Only regenerate if we already have a password
      handleGeneratePassword();
    }
  }, [options]);

  return (
    <div className="space-y-6">
      {/* Generated Password Display */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea 
              value={password}
              readOnly 
              rows={4}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              placeholder="Generated password will appear here..."
            />
            <div className="flex gap-2">
              <Button onClick={handleCopyToClipboard}>
                {copyButtonText}
              </Button>
              <Button variant="outline" onClick={handleGeneratePassword}>
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Options */}
      <Card>
        <CardHeader>
          <CardTitle>Password Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordLength">
                  Number of Characters: {options.length}
                </Label>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateOptions('length', 32)}
                    className="h-6 px-2 text-xs"
                  >
                    32
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateOptions('length', 64)}
                    className="h-6 px-2 text-xs"
                  >
                    64
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateOptions('length', 128)}
                    className="h-6 px-2 text-xs"
                  >
                    128
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateOptions('length', 256)}
                    className="h-6 px-2 text-xs"
                  >
                    256
                  </Button>
                </div>
              </div>
              <input 
                id="passwordLength"
                type="range" 
                min="8" 
                max="256" 
                value={options.length}
                onChange={(e) => updateOptions('length', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* Character Types */}
            <div className="space-y-3">
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
                  id="specialChars" 
                  checked={options.specialChars}
                  onChange={(e) => updateOptions('specialChars', (e.target as HTMLInputElement).checked)}
                />
                <Label htmlFor="specialChars">
                  Special Characters (!@#$%^&*)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}