import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface BaseConfig {
  name: string;
  base: number;
  prefix: string;
  description: string;
  validChars: string;
}

const BASE_CONFIGS: BaseConfig[] = [
  {
    name: 'Binary',
    base: 2,
    prefix: '0b',
    description: 'Base 2 (0-1)',
    validChars: '01'
  },
  {
    name: 'Octal',
    base: 8,
    prefix: '0o',
    description: 'Base 8 (0-7)',
    validChars: '01234567'
  },
  {
    name: 'Decimal',
    base: 10,
    prefix: '',
    description: 'Base 10 (0-9)',
    validChars: '0123456789'
  },
  {
    name: 'Hexadecimal',
    base: 16,
    prefix: '0x',
    description: 'Base 16 (0-9, A-F)',
    validChars: '0123456789ABCDEFabcdef'
  }
];

const CUSTOM_BASES = [3, 4, 5, 6, 7, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

export default function NumberBaseConverter() {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState(10);
  const [results, setResults] = useState<Record<number, string>>({});
  const [customBase, setCustomBase] = useState(5);
  const [showCustom, setShowCustom] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  const getValidCharsForBase = (base: number): string => {
    const baseConfig = BASE_CONFIGS.find(config => config.base === base);
    if (baseConfig) {
      return baseConfig.validChars;
    }
    
    // For custom bases
    let chars = '0123456789';
    if (base > 10) {
      chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base - 10);
    }
    return chars;
  };

  const isValidInput = (value: string, base: number): boolean => {
    if (!value.trim()) return true;
    
    const cleanValue = value.replace(/^0[box]/i, '').toUpperCase();
    const validChars = getValidCharsForBase(base);
    
    return cleanValue.split('').every(char => validChars.includes(char));
  };

  const parseInput = (value: string, fromBase: number): number | null => {
    if (!value.trim()) return null;
    
    let cleanValue = value.trim();
    
    // Remove prefixes
    cleanValue = cleanValue.replace(/^0b/i, '');
    cleanValue = cleanValue.replace(/^0o/i, '');
    cleanValue = cleanValue.replace(/^0x/i, '');
    
    try {
      const result = parseInt(cleanValue, fromBase);
      if (isNaN(result)) return null;
      return result;
    } catch {
      return null;
    }
  };

  const convertToBase = (decimal: number, toBase: number): string => {
    if (decimal === 0) return '0';
    
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    let num = Math.abs(decimal);
    
    while (num > 0) {
      result = digits[num % toBase] + result;
      num = Math.floor(num / toBase);
    }
    
    return decimal < 0 ? '-' + result : result;
  };

  const formatWithPrefix = (value: string, base: number): string => {
    const baseConfig = BASE_CONFIGS.find(config => config.base === base);
    if (baseConfig && baseConfig.prefix && value !== '0') {
      return baseConfig.prefix + value;
    }
    return value;
  };

  const convertNumber = () => {
    if (!inputValue.trim()) {
      setResults({});
      setErrorMessage('');
      setIsValid(true);
      return;
    }

    if (!isValidInput(inputValue, inputBase)) {
      setErrorMessage(`❌ Invalid input for base ${inputBase}. Valid characters: ${getValidCharsForBase(inputBase)}`);
      setIsValid(false);
      setResults({});
      return;
    }

    const decimal = parseInput(inputValue, inputBase);
    if (decimal === null) {
      setErrorMessage('❌ Unable to parse the input number');
      setIsValid(false);
      setResults({});
      return;
    }

    const newResults: Record<number, string> = {};
    
    // Convert to standard bases
    BASE_CONFIGS.forEach(config => {
      if (config.base !== inputBase) {
        const converted = convertToBase(decimal, config.base);
        newResults[config.base] = formatWithPrefix(converted, config.base);
      }
    });

    // Add custom base if enabled
    if (showCustom && customBase !== inputBase) {
      newResults[customBase] = convertToBase(decimal, customBase);
    }

    setResults(newResults);
    setErrorMessage(`✅ Successfully converted from base ${inputBase} (decimal value: ${decimal})`);
    setIsValid(true);
  };

  // Auto-convert on input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convertNumber();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, inputBase, customBase, showCustom]);

  const clearAll = () => {
    setInputValue('');
    setResults({});
    setErrorMessage('');
    setIsValid(true);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const loadExample = (base: number, value: string) => {
    setInputBase(base);
    setInputValue(value);
  };

  const swapBases = (targetBase: number) => {
    if (results[targetBase]) {
      const newInput = results[targetBase].replace(/^0[box]/i, '');
      setInputValue(newInput);
      setInputBase(targetBase);
    }
  };

  const getBaseName = (base: number): string => {
    const config = BASE_CONFIGS.find(c => c.base === base);
    return config ? config.name : `Base ${base}`;
  };

  const getBitRepresentation = (decimal: number): string => {
    if (decimal < 0) return 'N/A (negative)';
    if (decimal > Number.MAX_SAFE_INTEGER) return 'N/A (too large)';
    
    const binary = decimal.toString(2);
    const bytes = Math.ceil(binary.length / 8);
    const padded = binary.padStart(bytes * 8, '0');
    
    // Group by 8 bits (bytes)
    const grouped = padded.match(/.{1,8}/g)?.join(' ') || padded;
    return `${grouped} (${bytes} byte${bytes !== 1 ? 's' : ''})`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Number Base Converter</h1>
        <p className="text-muted-foreground">Convert numbers between different bases (binary, octal, decimal, hexadecimal, and custom bases)</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inputValue">Number:</Label>
                  <input 
                    id="inputValue"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                    placeholder="Enter a number..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inputBase">Input Base:</Label>
                  <select 
                    id="inputBase"
                    value={inputBase}
                    onChange={(e) => setInputBase(parseInt(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {BASE_CONFIGS.map(config => (
                      <option key={config.base} value={config.base}>
                        {config.name} ({config.description})
                      </option>
                    ))}
                    {CUSTOM_BASES.map(base => (
                      <option key={base} value={base}>
                        Base {base}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input 
                    id="showCustom"
                    type="checkbox"
                    checked={showCustom}
                    onChange={(e) => setShowCustom(e.target.checked)}
                    className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <Label htmlFor="showCustom">Show custom base</Label>
                </div>
                
                {showCustom && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="customBase">Base:</Label>
                    <select 
                      id="customBase"
                      value={customBase}
                      onChange={(e) => setCustomBase(parseInt(e.target.value))}
                      className="flex h-8 w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    >
                      {CUSTOM_BASES.map(base => (
                        <option key={base} value={base}>{base}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertNumber}>
                  Convert
                </Button>
                <Button onClick={() => loadExample(2, '1010101')} variant="outline" size="sm">
                  Binary Example
                </Button>
                <Button onClick={() => loadExample(16, 'DEADBEEF')} variant="outline" size="sm">
                  Hex Example
                </Button>
                <Button onClick={() => loadExample(10, '42')} variant="outline" size="sm">
                  Decimal Example
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

        {Object.keys(results).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conversion Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {BASE_CONFIGS.map(config => {
                  if (results[config.base]) {
                    return (
                      <div key={config.base} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex-1">
                          <div className="font-medium">{config.name} ({config.description})</div>
                          <div className="font-mono text-sm text-muted-foreground mt-1">
                            {results[config.base]}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => copyToClipboard(results[config.base])}
                            variant="outline"
                            size="sm"
                          >
                            Copy
                          </Button>
                          <Button
                            onClick={() => swapBases(config.base)}
                            variant="outline"
                            size="sm"
                          >
                            Use as Input
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                
                {showCustom && results[customBase] && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">Base {customBase}</div>
                      <div className="font-mono text-sm text-muted-foreground mt-1">
                        {results[customBase]}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => copyToClipboard(results[customBase])}
                        variant="outline"
                        size="sm"
                      >
                        Copy
                      </Button>
                      <Button
                        onClick={() => swapBases(customBase)}
                        variant="outline"
                        size="sm"
                      >
                        Use as Input
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {inputValue && isValid && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Bit Representation:</h4>
                  <div className="font-mono text-xs text-blue-800">
                    {getBitRepresentation(parseInput(inputValue, inputBase) || 0)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}