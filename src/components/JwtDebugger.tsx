import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface JwtPayload {
  [key: string]: any;
}

interface DecodedJwt {
  header: any;
  payload: JwtPayload;
  signature: string;
  isValid: boolean;
  error?: string;
}

interface VerificationResult {
  isVerified: boolean;
  algorithm: string;
  error?: string;
}

export default function JwtDebugger() {
  const [jwtToken, setJwtToken] = useState('');
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const base64UrlDecode = (str: string): string => {
    try {
      // Add padding if needed
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
      return atob(str);
    } catch (error) {
      throw new Error('Invalid base64 encoding');
    }
  };

  const decodeJwt = (token: string): DecodedJwt => {
    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
      }

      const [headerPart, payloadPart, signaturePart] = parts;

      // Decode header
      const headerJson = base64UrlDecode(headerPart);
      const header = JSON.parse(headerJson);

      // Decode payload
      const payloadJson = base64UrlDecode(payloadPart);
      const payload = JSON.parse(payloadJson);

      return {
        header,
        payload,
        signature: signaturePart,
        isValid: true
      };
    } catch (error) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch {
      return 'Invalid timestamp';
    }
  };

  const isTokenExpired = (exp?: number): boolean => {
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  };

  const base64UrlEncode = (str: string): string => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const arrayBufferToBase64Url = (arrayBuffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return base64UrlEncode(binary);
  };

  const verifySignature = async (token: string, secret: string): Promise<VerificationResult> => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const [headerPart, payloadPart, signaturePart] = parts;
      const header = JSON.parse(base64UrlDecode(headerPart));
      const algorithm = header.alg;

      if (!algorithm) {
        throw new Error('No algorithm specified in JWT header');
      }

      // Only support HMAC algorithms for client-side verification
      if (!algorithm.startsWith('HS')) {
        return {
          isVerified: false,
          algorithm,
          error: `Algorithm ${algorithm} is not supported for client-side verification. Only HMAC (HS256, HS384, HS512) algorithms are supported.`
        };
      }

      // Create the signing input
      const signingInput = `${headerPart}.${payloadPart}`;
      
      // Import the secret key
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      
      let hashAlgorithm: string;
      switch (algorithm) {
        case 'HS256':
          hashAlgorithm = 'SHA-256';
          break;
        case 'HS384':
          hashAlgorithm = 'SHA-384';
          break;
        case 'HS512':
          hashAlgorithm = 'SHA-512';
          break;
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: hashAlgorithm },
        false,
        ['sign']
      );

      // Sign the input
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signingInput));
      const computedSignature = arrayBufferToBase64Url(signature);

      // Compare signatures
      const isVerified = computedSignature === signaturePart;

      return {
        isVerified,
        algorithm
      };

    } catch (error) {
      return {
        isVerified: false,
        algorithm: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error occurred during verification'
      };
    }
  };

  const loadSampleToken = () => {
    setJwtToken(sampleJwt);
    setSecretKey('your-256-bit-secret');
  };

  const clearAll = () => {
    setJwtToken('');
    setDecodedJwt(null);
    setSecretKey('');
    setVerificationResult(null);
  };

  const handleVerifySignature = async () => {
    if (!jwtToken.trim() || !secretKey.trim()) {
      setVerificationResult({
        isVerified: false,
        algorithm: 'unknown',
        error: 'Please provide both JWT token and secret key'
      });
      return;
    }

    const result = await verifySignature(jwtToken.trim(), secretKey.trim());
    setVerificationResult(result);
  };

  useEffect(() => {
    if (jwtToken.trim()) {
      const decoded = decodeJwt(jwtToken.trim());
      setDecodedJwt(decoded);
    } else {
      setDecodedJwt(null);
    }
    // Clear verification result when token changes
    setVerificationResult(null);
  }, [jwtToken]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JWT Debugger</h1>
        <p className="text-muted-foreground">Debug, validate, and decode JSON Web Tokens</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={loadSampleToken} variant="outline" size="sm">
            Load Sample JWT
          </Button>
          <Button onClick={clearAll} variant="outline" size="sm">
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>JWT Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jwtToken">Paste your JWT token:</Label>
                <textarea 
                  id="jwtToken"
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  rows={8}
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key (for signature verification):</Label>
                <input 
                  id="secretKey"
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="your-256-bit-secret"
                />
              </div>
              
              <Button 
                onClick={handleVerifySignature} 
                className="w-full"
                disabled={!jwtToken.trim() || !secretKey.trim()}
              >
                Verify Signature
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Decoded Output */}
        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Header</CardTitle>
            </CardHeader>
            <CardContent>
              {decodedJwt?.isValid ? (
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(decodedJwt.header, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">Invalid or empty JWT</p>
              )}
            </CardContent>
          </Card>

          {/* Payload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">Payload</CardTitle>
            </CardHeader>
            <CardContent>
              {decodedJwt?.isValid ? (
                <div className="space-y-4">
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(decodedJwt.payload, null, 2)}
                  </pre>
                  
                  {/* Common Claims */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Common Claims:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {decodedJwt.payload.iss && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">iss</Badge>
                          <span className="text-sm">{decodedJwt.payload.iss}</span>
                        </div>
                      )}
                      {decodedJwt.payload.sub && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">sub</Badge>
                          <span className="text-sm">{decodedJwt.payload.sub}</span>
                        </div>
                      )}
                      {decodedJwt.payload.aud && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">aud</Badge>
                          <span className="text-sm">{Array.isArray(decodedJwt.payload.aud) ? decodedJwt.payload.aud.join(', ') : decodedJwt.payload.aud}</span>
                        </div>
                      )}
                      {decodedJwt.payload.exp && (
                        <div className="flex items-center gap-2">
                          <Badge variant={isTokenExpired(decodedJwt.payload.exp) ? "destructive" : "secondary"}>exp</Badge>
                          <span className="text-sm">{formatTimestamp(decodedJwt.payload.exp)}</span>
                          {isTokenExpired(decodedJwt.payload.exp) && (
                            <Badge variant="destructive">EXPIRED</Badge>
                          )}
                        </div>
                      )}
                      {decodedJwt.payload.iat && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">iat</Badge>
                          <span className="text-sm">{formatTimestamp(decodedJwt.payload.iat)}</span>
                        </div>
                      )}
                      {decodedJwt.payload.nbf && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">nbf</Badge>
                          <span className="text-sm">{formatTimestamp(decodedJwt.payload.nbf)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Invalid or empty JWT</p>
              )}
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Signature</CardTitle>
            </CardHeader>
            <CardContent>
              {decodedJwt?.isValid ? (
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm break-all">{decodedJwt.signature}</code>
                  </div>
                  
                  {/* Verification Result */}
                  {verificationResult ? (
                    <Alert variant={verificationResult.isVerified ? "default" : "destructive"}>
                      <AlertDescription>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={verificationResult.isVerified ? "default" : "destructive"}>
                            {verificationResult.isVerified ? "VERIFIED" : "INVALID"}
                          </Badge>
                          <span>Algorithm: {verificationResult.algorithm}</span>
                        </div>
                        {verificationResult.error && (
                          <p className="text-sm">{verificationResult.error}</p>
                        )}
                        {verificationResult.isVerified && (
                          <p className="text-sm">✅ Signature is valid and matches the provided secret key</p>
                        )}
                        {!verificationResult.isVerified && !verificationResult.error && (
                          <p className="text-sm">❌ Signature does not match the provided secret key</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Enter a secret key above and click "Verify Signature" to validate the JWT signature. 
                        Only HMAC algorithms (HS256, HS384, HS512) are supported for client-side verification.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Invalid or empty JWT</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Alert */}
      {decodedJwt && !decodedJwt.isValid && (
        <Alert variant="destructive">
          <AlertDescription>
            {decodedJwt.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Token Status */}
      {decodedJwt?.isValid && (
        <Card>
          <CardHeader>
            <CardTitle>Token Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Algorithm</Badge>
                <span>{decodedJwt.header.alg || 'None'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Type</Badge>
                <span>{decodedJwt.header.typ || 'JWT'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={decodedJwt.payload.exp && isTokenExpired(decodedJwt.payload.exp) ? "destructive" : "default"}>
                  Expiry
                </Badge>
                <span>{decodedJwt.payload.exp && isTokenExpired(decodedJwt.payload.exp) ? 'Expired' : 'Valid'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  verificationResult === null ? "secondary" : 
                  verificationResult.isVerified ? "default" : "destructive"
                }>
                  Signature
                </Badge>
                <span>
                  {verificationResult === null ? 'Not Verified' : 
                   verificationResult.isVerified ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}