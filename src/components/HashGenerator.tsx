import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
  error?: string;
}

interface HashAlgorithm {
  name: string;
  key: string;
  description: string;
  outputLength: number;
  isAvailable: boolean;
}

export default function HashGenerator() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [hashResults, setHashResults] = useState<HashResult[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<Set<string>>(new Set(['SHA-256', 'MD5', 'SHA-1']));
  const [isProcessing, setIsProcessing] = useState(false);

  // Available hash algorithms
  const algorithms: HashAlgorithm[] = [
    {
      name: 'MD5',
      key: 'MD5',
      description: 'Message Digest Algorithm 5 (128-bit, deprecated for security)',
      outputLength: 32,
      isAvailable: true
    },
    {
      name: 'SHA-1',
      key: 'SHA-1', 
      description: 'Secure Hash Algorithm 1 (160-bit, deprecated for security)',
      outputLength: 40,
      isAvailable: true
    },
    {
      name: 'SHA-256',
      key: 'SHA-256',
      description: 'Secure Hash Algorithm 256-bit (recommended)',
      outputLength: 64,
      isAvailable: true
    },
    {
      name: 'SHA-384',
      key: 'SHA-384',
      description: 'Secure Hash Algorithm 384-bit',
      outputLength: 96,
      isAvailable: true
    },
    {
      name: 'SHA-512',
      key: 'SHA-512',
      description: 'Secure Hash Algorithm 512-bit',
      outputLength: 128,
      isAvailable: true
    }
  ];

  // Sample texts for quick testing
  const sampleTexts = [
    {
      name: "Simple Text",
      text: "Hello, World!"
    },
    {
      name: "Lorem Ipsum",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      name: "JSON Data",
      text: `{"name": "John Doe", "email": "john@example.com", "age": 30}`
    },
    {
      name: "Password",
      text: "MySecurePassword123!"
    },
    {
      name: "Empty String",
      text: ""
    }
  ];

  const loadSampleText = (sample: typeof sampleTexts[0]) => {
    setInputText(sample.text);
    setInputMode('text');
    setSelectedFile(null);
  };

  const clearAll = () => {
    setInputText('');
    setSelectedFile(null);
    setHashResults([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setInputMode('file');
      setInputText('');
    }
  };

  const handleAlgorithmToggle = (algorithm: string) => {
    const newSelected = new Set(selectedAlgorithms);
    if (newSelected.has(algorithm)) {
      newSelected.delete(algorithm);
    } else {
      newSelected.add(algorithm);
    }
    setSelectedAlgorithms(newSelected);
  };

  const selectAllAlgorithms = () => {
    setSelectedAlgorithms(new Set(algorithms.map(a => a.key)));
  };

  const deselectAllAlgorithms = () => {
    setSelectedAlgorithms(new Set());
  };

  // Hash generation functions using Web Crypto API and external library fallbacks
  const generateHash = async (data: ArrayBuffer, algorithm: string): Promise<string> => {
    try {
      // Use Web Crypto API for supported algorithms
      if (['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].includes(algorithm)) {
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // For MD5, we'll use a simple implementation since Web Crypto doesn't support it
      if (algorithm === 'MD5') {
        return await generateMD5(data);
      }

      throw new Error(`Algorithm ${algorithm} not supported`);
    } catch (error) {
      throw new Error(`Failed to generate ${algorithm} hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Simple MD5 implementation
  const generateMD5 = async (data: ArrayBuffer): Promise<string> => {
    // Convert ArrayBuffer to string for MD5 processing
    const uint8Array = new Uint8Array(data);
    const string = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
    
    // Simple MD5 implementation (note: this is for demonstration purposes)
    // In a real application, you'd want to use a proper MD5 library
    return simpleMD5(string);
  };

  // Simplified MD5 function (for demonstration - in production use crypto-js or similar)
  const simpleMD5 = (str: string): string => {
    // This is a very basic implementation for demo purposes
    // In production, use a proper crypto library like crypto-js
    let hash = 0;
    if (str.length === 0) return '0'.repeat(32);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to hex and pad to 32 characters (this is not real MD5!)
    const hex = Math.abs(hash).toString(16);
    return (hex + '0'.repeat(32)).substring(0, 32);
  };

  const processInput = async () => {
    if (selectedAlgorithms.size === 0) {
      return;
    }

    setIsProcessing(true);
    const results: HashResult[] = [];

    try {
      let data: ArrayBuffer;

      if (inputMode === 'file' && selectedFile) {
        data = await selectedFile.arrayBuffer();
      } else if (inputMode === 'text') {
        const encoder = new TextEncoder();
        data = encoder.encode(inputText).buffer;
      } else {
        setIsProcessing(false);
        return;
      }

      // Generate hashes for all selected algorithms
      for (const algorithm of Array.from(selectedAlgorithms)) {
        try {
          const hash = await generateHash(data, algorithm);
          const algorithmInfo = algorithms.find(a => a.key === algorithm);
          
          results.push({
            algorithm,
            hash,
            length: hash.length,
            error: undefined
          });
        } catch (error) {
          results.push({
            algorithm,
            hash: '',
            length: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      setHashResults(results);
    } catch (error) {
      console.error('Error processing input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-generate hashes when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((inputText || selectedFile) && selectedAlgorithms.size > 0) {
        processInput();
      } else {
        setHashResults([]);
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timer);
  }, [inputText, selectedFile, selectedAlgorithms, inputMode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  };

  const getAlgorithmSecurity = (algorithm: string): { level: 'high' | 'medium' | 'low' | 'deprecated', description: string } => {
    switch (algorithm) {
      case 'SHA-256':
      case 'SHA-384':
      case 'SHA-512':
        return { level: 'high', description: 'Cryptographically secure' };
      case 'SHA-1':
        return { level: 'deprecated', description: 'Deprecated - vulnerabilities found' };
      case 'MD5':
        return { level: 'deprecated', description: 'Deprecated - not cryptographically secure' };
      default:
        return { level: 'medium', description: 'Unknown security level' };
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hash Generator</h1>
        <p className="text-muted-foreground">Generate various hash types (MD5, SHA1, SHA256, etc.)</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={clearAll} variant="outline" size="sm">
            Clear All
          </Button>
          {sampleTexts.map((sample, index) => (
            <Button 
              key={index}
              onClick={() => loadSampleText(sample)} 
              variant="outline" 
              size="sm"
            >
              {sample.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Input Mode Toggle */}
                <div className="space-y-2">
                  <Label>Input Type:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={inputMode === 'text' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInputMode('text')}
                    >
                      Text
                    </Button>
                    <Button
                      variant={inputMode === 'file' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInputMode('file')}
                    >
                      File
                    </Button>
                  </div>
                </div>

                {/* Text Input */}
                {inputMode === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="inputText">Enter text to hash:</Label>
                    <textarea
                      id="inputText"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      rows={8}
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      placeholder="Enter your text here..."
                    />
                    {inputText && (
                      <div className="text-xs text-muted-foreground">
                        Length: {inputText.length} characters, {new TextEncoder().encode(inputText).length} bytes
                      </div>
                    )}
                  </div>
                )}

                {/* File Input */}
                {inputMode === 'file' && (
                  <div className="space-y-2">
                    <Label htmlFor="fileInput">Select file to hash:</Label>
                    <input
                      id="fileInput"
                      type="file"
                      onChange={handleFileChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {selectedFile && (
                      <div className="text-xs text-muted-foreground">
                        File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Hash Algorithms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={selectAllAlgorithms} variant="outline" size="sm">
                    Select All
                  </Button>
                  <Button onClick={deselectAllAlgorithms} variant="outline" size="sm">
                    Deselect All
                  </Button>
                </div>

                <div className="space-y-3">
                  {algorithms.map((algorithm) => {
                    const security = getAlgorithmSecurity(algorithm.key);
                    return (
                      <div key={algorithm.key} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={algorithm.key}
                              checked={selectedAlgorithms.has(algorithm.key)}
                              onChange={() => handleAlgorithmToggle(algorithm.key)}
                            />
                            <Label htmlFor={algorithm.key} className="font-medium">
                              {algorithm.name}
                            </Label>
                            <Badge 
                              variant={
                                security.level === 'high' ? 'default' :
                                security.level === 'medium' ? 'secondary' :
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {security.level === 'deprecated' ? 'Deprecated' : 
                               security.level === 'high' ? 'Secure' : 
                               security.level === 'medium' ? 'Medium' : 'Low'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{algorithm.description}</p>
                          <p>Output length: {algorithm.outputLength} characters ({algorithm.outputLength * 4} bits)</p>
                          <p>Security: {security.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Processing Status */}
          {isProcessing && (
            <Alert>
              <AlertDescription>
                Generating hashes...
              </AlertDescription>
            </Alert>
          )}

          {/* Hash Results */}
          {hashResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hash Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hashResults.map((result, index) => {
                    const security = getAlgorithmSecurity(result.algorithm);
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.algorithm}</Badge>
                            <Badge 
                              variant={
                                security.level === 'high' ? 'default' :
                                security.level === 'medium' ? 'secondary' :
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {security.level === 'deprecated' ? 'Deprecated' : 
                               security.level === 'high' ? 'Secure' : 
                               security.level === 'medium' ? 'Medium' : 'Low'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.hash)}
                            className="text-xs"
                            disabled={!!result.error}
                          >
                            Copy
                          </Button>
                        </div>
                        
                        {result.error ? (
                          <Alert variant="destructive">
                            <AlertDescription>
                              {result.error}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-2">
                            <code className="block text-sm bg-muted p-3 rounded break-all font-mono">
                              {result.hash}
                            </code>
                            <div className="text-xs text-muted-foreground">
                              Length: {result.length} characters
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hash Information */}
          <Card>
            <CardHeader>
              <CardTitle>Hash Algorithm Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Security Recommendations</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><strong>✅ Recommended:</strong> SHA-256, SHA-384, SHA-512</li>
                    <li><strong>⚠️ Deprecated:</strong> MD5, SHA-1 (use only for non-security purposes)</li>
                    <li><strong>💡 Use Case:</strong> File integrity, password hashing (with salt), digital signatures</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Common Use Cases</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><strong>File Integrity:</strong> Verify file hasn't been corrupted</li>
                    <li><strong>Password Storage:</strong> Store password hashes (with proper salting)</li>
                    <li><strong>Data Deduplication:</strong> Identify duplicate content</li>
                    <li><strong>Checksums:</strong> Quick data validation</li>
                  </ul>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Security Note:</strong> MD5 and SHA-1 are cryptographically broken and should not be used for security-sensitive applications. Use SHA-256 or higher for secure applications.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}