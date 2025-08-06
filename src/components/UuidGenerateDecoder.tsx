import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UuidProperties {
  version: string;
  variant: string;
  standardFormat: string;
  integerValue: string;
  contents: {
    timeLow: string;
    timeMid: string;
    timeHiAndVersion: string;
    clockSeqHiAndReserved: string;
    clockSeqLow: string;
    node: string;
  };
}

export default function UuidGenerateDecoder() {
  const [generatedUuid, setGeneratedUuid] = useState('');
  const [inputUuid, setInputUuid] = useState('');
  const [decodedProperties, setDecodedProperties] = useState<UuidProperties | null>(null);
  const [decodeError, setDecodeError] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const generateUuidV4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleGenerateUuid = () => {
    const newUuid = generateUuidV4();
    setGeneratedUuid(newUuid);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUuid);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = generatedUuid;
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

  const validateUuid = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const decodeUuid = (uuid: string): UuidProperties | null => {
    if (!validateUuid(uuid)) {
      return null;
    }

    const cleanUuid = uuid.replace(/-/g, '').toLowerCase();
    
    const version = parseInt(cleanUuid[12], 16);
    const variantBits = parseInt(cleanUuid[16], 16);
    
    let variant = '';
    if (variantBits < 8) {
      variant = 'Reserved (NCS backward compatibility)';
    } else if (variantBits < 12) {
      variant = 'RFC 4122';
    } else if (variantBits < 14) {
      variant = 'Reserved (Microsoft backward compatibility)';
    } else {
      variant = 'Reserved (future use)';
    }

    const integerValue = BigInt('0x' + cleanUuid).toString();

    return {
      version: `Version ${version}`,
      variant,
      standardFormat: uuid.toLowerCase(),
      integerValue,
      contents: {
        timeLow: cleanUuid.substring(0, 8),
        timeMid: cleanUuid.substring(8, 12),
        timeHiAndVersion: cleanUuid.substring(12, 16),
        clockSeqHiAndReserved: cleanUuid.substring(16, 18),
        clockSeqLow: cleanUuid.substring(18, 20),
        node: cleanUuid.substring(20, 32)
      }
    };
  };

  const handleDecodeUuid = () => {
    setDecodeError('');
    setDecodedProperties(null);

    if (!inputUuid.trim()) {
      setDecodeError('Please enter a UUID to decode');
      return;
    }

    const properties = decodeUuid(inputUuid.trim());
    if (!properties) {
      setDecodeError('Invalid UUID format. Please enter a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)');
      return;
    }

    setDecodedProperties(properties);
  };

  useEffect(() => {
    handleGenerateUuid();
  }, []);

  return (
    <div className="space-y-8">
      {/* UUID Generator Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate UUID v4</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="generated-uuid">Generated UUID</Label>
              <Input
                id="generated-uuid"
                value={generatedUuid}
                readOnly
                className="font-mono"
                placeholder="Generated UUID will appear here..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyToClipboard}>
                {copyButtonText}
              </Button>
              <Button variant="outline" onClick={handleGenerateUuid}>
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UUID Decoder Section */}
      <Card>
        <CardHeader>
          <CardTitle>Decode UUID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uuid-input">UUID to Decode</Label>
              <Input
                id="uuid-input"
                value={inputUuid}
                onChange={(e) => setInputUuid(e.target.value)}
                className="font-mono"
                placeholder="Enter UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
              />
            </div>
            <Button onClick={handleDecodeUuid} className="w-full">
              Decode UUID
            </Button>
            
            {decodeError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {decodeError}
              </div>
            )}
            
            {decodedProperties && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">UUID Properties</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Version</Label>
                      <Input value={decodedProperties.version} readOnly className="font-mono" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="font-medium">Variant</Label>
                      <Input value={decodedProperties.variant} readOnly className="font-mono" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-medium">Standard Format</Label>
                    <Input value={decodedProperties.standardFormat} readOnly className="font-mono" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-medium">Integer Value</Label>
                    <textarea 
                      value={decodedProperties.integerValue}
                      readOnly 
                      rows={2}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-medium">Contents (Hexadecimal Parts)</Label>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Time Low</Label>
                          <Input value={decodedProperties.contents.timeLow} readOnly className="font-mono text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Time Mid</Label>
                          <Input value={decodedProperties.contents.timeMid} readOnly className="font-mono text-sm" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Time Hi and Version</Label>
                          <Input value={decodedProperties.contents.timeHiAndVersion} readOnly className="font-mono text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Clock Seq Hi and Reserved</Label>
                          <Input value={decodedProperties.contents.clockSeqHiAndReserved} readOnly className="font-mono text-sm" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Clock Seq Low</Label>
                          <Input value={decodedProperties.contents.clockSeqLow} readOnly className="font-mono text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Node</Label>
                          <Input value={decodedProperties.contents.node} readOnly className="font-mono text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}