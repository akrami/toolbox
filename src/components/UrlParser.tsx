import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ParsedUrl {
  isValid: boolean;
  error?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  origin?: string;
  host?: string;
  queryParams: { [key: string]: string | string[] };
  pathSegments: string[];
}

interface UrlInfo {
  component: string;
  value: string;
  description: string;
  example: string;
}

export default function UrlParser() {
  const [inputUrl, setInputUrl] = useState('');
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl>({ 
    isValid: false, 
    queryParams: {}, 
    pathSegments: [] 
  });

  // Sample URLs for quick testing
  const sampleUrls = [
    {
      name: "Complex API URL",
      url: "https://api.example.com:8080/v1/users/123?name=john&age=30&tags=developer,admin&active=true#profile"
    },
    {
      name: "E-commerce URL",
      url: "https://shop.example.com/products/electronics/smartphones?brand=apple&price=min:500,max:1000&sort=price_asc&page=2"
    },
    {
      name: "Search Results",
      url: "https://www.google.com/search?q=javascript+url+parsing&hl=en&safe=strict&source=hp"
    },
    {
      name: "Social Media",
      url: "https://www.facebook.com/username/posts/123456789?utm_source=twitter&utm_medium=social&utm_campaign=spring2024#comments"
    },
    {
      name: "Local Development",
      url: "http://localhost:3000/admin/dashboard?debug=true&theme=dark&lang=en"
    }
  ];

  const loadSampleUrl = (sample: typeof sampleUrls[0]) => {
    setInputUrl(sample.url);
  };

  const clearAll = () => {
    setInputUrl('');
    setParsedUrl({ isValid: false, queryParams: {}, pathSegments: [] });
  };

  const parseQueryString = (search: string): { [key: string]: string | string[] } => {
    const params: { [key: string]: string | string[] } = {};
    
    if (!search || search === '?') return params;
    
    const searchParams = new URLSearchParams(search);
    
    for (const [key, value] of searchParams.entries()) {
      if (params[key]) {
        // Handle multiple values for the same parameter
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    }
    
    return params;
  };

  const parseUrl = useMemo(() => {
    if (!inputUrl.trim()) {
      setParsedUrl({ isValid: false, queryParams: {}, pathSegments: [] });
      return;
    }

    try {
      const url = new URL(inputUrl.trim());
      
      // Parse path segments
      const pathSegments = url.pathname.split('/').filter(segment => segment !== '');
      
      // Parse query parameters
      const queryParams = parseQueryString(url.search);

      setParsedUrl({
        isValid: true,
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : url.protocol === 'http:' ? '80' : ''),
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        host: url.host,
        queryParams,
        pathSegments
      });

    } catch (error) {
      setParsedUrl({
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid URL format',
        queryParams: {},
        pathSegments: []
      });
    }
  }, [inputUrl]);

  const getUrlComponents = (): UrlInfo[] => {
    if (!parsedUrl.isValid) return [];

    const components: UrlInfo[] = [
      {
        component: "Protocol",
        value: parsedUrl.protocol || '',
        description: "The scheme of the URL (http:, https:, ftp:, etc.)",
        example: "https:"
      },
      {
        component: "Hostname",
        value: parsedUrl.hostname || '',
        description: "The domain name or IP address of the server",
        example: "www.example.com"
      },
      {
        component: "Port",
        value: parsedUrl.port || '',
        description: "The port number (default: 80 for HTTP, 443 for HTTPS)",
        example: "8080"
      },
      {
        component: "Origin",
        value: parsedUrl.origin || '',
        description: "The combination of protocol, hostname, and port",
        example: "https://www.example.com:8080"
      },
      {
        component: "Host",
        value: parsedUrl.host || '',
        description: "The hostname and port (if non-standard)",
        example: "www.example.com:8080"
      },
      {
        component: "Pathname",
        value: parsedUrl.pathname || '',
        description: "The path portion of the URL",
        example: "/path/to/resource"
      },
      {
        component: "Search",
        value: parsedUrl.search || '',
        description: "The query string including the '?' character",
        example: "?param1=value1&param2=value2"
      },
      {
        component: "Hash",
        value: parsedUrl.hash || '',
        description: "The fragment identifier including the '#' character",
        example: "#section1"
      }
    ].filter(component => component.value !== '');

    return components;
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Parser</h1>
        <p className="text-muted-foreground">Parse and analyze URL components and parameters</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={clearAll} variant="outline" size="sm">
            Clear All
          </Button>
          {sampleUrls.map((sample, index) => (
            <Button 
              key={index}
              onClick={() => loadSampleUrl(sample)} 
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
        <Card>
          <CardHeader>
            <CardTitle>URL Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputUrl">Enter URL to parse:</Label>
                <textarea
                  id="inputUrl"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder="https://www.example.com:8080/path/to/resource?param1=value1&param2=value2#section"
                />
              </div>

              {/* URL Validation Status */}
              {inputUrl.trim() && (
                <div className="flex items-center gap-2">
                  <Badge variant={parsedUrl.isValid ? "default" : "destructive"}>
                    {parsedUrl.isValid ? "Valid URL" : "Invalid URL"}
                  </Badge>
                  {parsedUrl.isValid && parsedUrl.protocol && (
                    <Badge variant="secondary">
                      {parsedUrl.protocol.replace(':', '').toUpperCase()}
                    </Badge>
                  )}
                </div>
              )}

              {/* Error Message */}
              {parsedUrl.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Parse Error:</strong> {parsedUrl.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* URL Components */}
        {parsedUrl.isValid && (
          <Card>
            <CardHeader>
              <CardTitle>URL Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUrlComponents().map((component, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{component.component}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(component.value)}
                          className="h-6 px-2 text-xs"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <code className="block text-sm bg-muted p-2 rounded break-all">
                        {component.value}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        {component.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Path Segments */}
      {parsedUrl.isValid && parsedUrl.pathSegments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Path Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The path "{parsedUrl.pathname}" contains {parsedUrl.pathSegments.length} segment{parsedUrl.pathSegments.length !== 1 ? 's' : ''}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {parsedUrl.pathSegments.map((segment, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                    <code className="text-sm flex-1 truncate">
                      {decodeURIComponent(segment)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(segment)}
                      className="h-6 w-6 p-0"
                    >
                      📋
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Parameters */}
      {parsedUrl.isValid && Object.keys(parsedUrl.queryParams).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Query Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Found {Object.keys(parsedUrl.queryParams).length} query parameter{Object.keys(parsedUrl.queryParams).length !== 1 ? 's' : ''}:
              </p>
              <div className="space-y-3">
                {Object.entries(parsedUrl.queryParams).map(([key, value], index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{key}</Badge>
                        {Array.isArray(value) && (
                          <Badge variant="secondary" className="text-xs">
                            Multiple Values
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(Array.isArray(value) ? value.join(', ') : value)}
                          className="h-6 px-2 text-xs"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {Array.isArray(value) ? (
                        <div className="space-y-1">
                          {value.map((val, valIndex) => (
                            <code key={valIndex} className="block text-sm bg-muted p-2 rounded break-all">
                              {decodeURIComponent(val)}
                            </code>
                          ))}
                        </div>
                      ) : (
                        <code className="block text-sm bg-muted p-2 rounded break-all">
                          {decodeURIComponent(value)}
                        </code>
                      )}
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Raw:</strong> {Array.isArray(value) ? value.join(', ') : value}</p>
                        {(Array.isArray(value) ? value.some(v => v !== decodeURIComponent(v)) : value !== decodeURIComponent(value)) && (
                          <p><strong>URL Decoded:</strong> {Array.isArray(value) ? value.map(v => decodeURIComponent(v)).join(', ') : decodeURIComponent(value)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL Structure Reference */}
      <Card>
        <CardHeader>
          <CardTitle>URL Structure Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              <div className="text-center mb-2 font-bold">URL Anatomy</div>
              <div className="break-all">
                <span className="text-blue-600">protocol</span>://
                <span className="text-green-600">hostname</span>:
                <span className="text-purple-600">port</span>
                <span className="text-orange-600">/path/to/resource</span>
                <span className="text-red-600">?param1=value1&param2=value2</span>
                <span className="text-pink-600">#fragment</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Common Protocols</h4>
                <ul className="space-y-1">
                  <li><code>http://</code> - HyperText Transfer Protocol</li>
                  <li><code>https://</code> - HTTP Secure</li>
                  <li><code>ftp://</code> - File Transfer Protocol</li>
                  <li><code>mailto:</code> - Email address</li>
                  <li><code>file://</code> - Local file system</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Default Ports</h4>
                <ul className="space-y-1">
                  <li><code>HTTP:</code> 80</li>
                  <li><code>HTTPS:</code> 443</li>
                  <li><code>FTP:</code> 21</li>
                  <li><code>SSH:</code> 22</li>
                  <li><code>Telnet:</code> 23</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}