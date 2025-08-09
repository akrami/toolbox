import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Match {
  match: string;
  index: number;
  groups: string[];
  namedGroups: { [key: string]: string };
}

interface RegExpResult {
  isValid: boolean;
  error?: string;
  matches: Match[];
  totalMatches: number;
}

export default function RegExpTester() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    multiline: false,
    ignoreCase: false,
    dotAll: false,
    unicode: false,
    sticky: false
  });
  const [result, setResult] = useState<RegExpResult>({ isValid: false, matches: [], totalMatches: 0 });

  // Sample patterns for quick testing
  const samplePatterns = [
    {
      name: "Email Validation",
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      testString: "user@example.com\ninvalid.email\ntest123@domain.co.uk",
      flags: { global: true, multiline: true, ignoreCase: false, dotAll: false, unicode: false, sticky: false }
    },
    {
      name: "Phone Number (US)",
      pattern: "\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})",
      testString: "(555) 123-4567\n555-123-4567\n555.123.4567\n5551234567",
      flags: { global: true, multiline: true, ignoreCase: false, dotAll: false, unicode: false, sticky: false }
    },
    {
      name: "URL Extraction",
      pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
      testString: "Visit https://www.example.com or http://test.org for more info.",
      flags: { global: true, multiline: false, ignoreCase: false, dotAll: false, unicode: false, sticky: false }
    },
    {
      name: "HTML Tag Matching",
      pattern: "<\\/?([a-z]+)(?:\\s[^>]*)?\\s*\\/?>",
      testString: "<div class=\"container\">\n  <p>Hello World!</p>\n  <br />\n</div>",
      flags: { global: true, multiline: true, ignoreCase: true, dotAll: false, unicode: false, sticky: false }
    },
    {
      name: "Date Formats (MM/DD/YYYY)",
      pattern: "^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/((19|20)\\d\\d)$",
      testString: "12/25/2023\n02/29/2024\n13/45/2023\n12/25/23",
      flags: { global: false, multiline: true, ignoreCase: false, dotAll: false, unicode: false, sticky: false }
    }
  ];

  const loadSamplePattern = (sample: typeof samplePatterns[0]) => {
    setPattern(sample.pattern);
    setTestString(sample.testString);
    setFlags(sample.flags);
  };

  const clearAll = () => {
    setPattern('');
    setTestString('');
    setFlags({
      global: true,
      multiline: false,
      ignoreCase: false,
      dotAll: false,
      unicode: false,
      sticky: false
    });
    setResult({ isValid: false, matches: [], totalMatches: 0 });
  };

  const getFlagString = () => {
    let flagStr = '';
    if (flags.global) flagStr += 'g';
    if (flags.ignoreCase) flagStr += 'i';
    if (flags.multiline) flagStr += 'm';
    if (flags.dotAll) flagStr += 's';
    if (flags.unicode) flagStr += 'u';
    if (flags.sticky) flagStr += 'y';
    return flagStr;
  };

  const testRegExp = useMemo(() => {
    if (!pattern.trim() || !testString.trim()) {
      setResult({ isValid: false, matches: [], totalMatches: 0 });
      return;
    }

    try {
      const flagStr = getFlagString();
      const regex = new RegExp(pattern, flagStr);
      const matches: Match[] = [];

      if (flags.global) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
          
          // Prevent infinite loop on zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
        }
      }

      setResult({
        isValid: true,
        matches,
        totalMatches: matches.length
      });

    } catch (error) {
      setResult({
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid regular expression',
        matches: [],
        totalMatches: 0
      });
    }
  }, [pattern, testString, flags]);

  const highlightMatches = (text: string, matches: Match[]): JSX.Element[] => {
    if (matches.length === 0) {
      return [<span key="0">{text}</span>];
    }

    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`before-${i}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add highlighted match
      parts.push(
        <mark 
          key={`match-${i}`}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
          title={`Match ${i + 1}: "${match.match}" at position ${match.index}`}
        >
          {match.match}
        </mark>
      );

      lastIndex = match.index + match.match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="after">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const handleFlagChange = (flag: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Regular Expression Tester</h1>
        <p className="text-muted-foreground">Test and validate regular expressions with real-time matching</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={clearAll} variant="outline" size="sm">
            Clear All
          </Button>
          {samplePatterns.map((sample, index) => (
            <Button 
              key={index}
              onClick={() => loadSamplePattern(sample)} 
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
              <CardTitle>Regular Expression Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pattern">Enter your RegExp pattern:</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-mono">/</span>
                    <input
                      id="pattern"
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent pl-6 pr-12 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                      placeholder="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm font-mono">/{getFlagString()}</span>
                  </div>
                </div>

                {/* Flags */}
                <div className="space-y-3">
                  <Label>Flags:</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="global"
                        checked={flags.global}
                        onChange={() => handleFlagChange('global')}
                      />
                      <Label htmlFor="global" className="text-sm">Global (g)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="ignoreCase"
                        checked={flags.ignoreCase}
                        onChange={() => handleFlagChange('ignoreCase')}
                      />
                      <Label htmlFor="ignoreCase" className="text-sm">Ignore Case (i)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="multiline"
                        checked={flags.multiline}
                        onChange={() => handleFlagChange('multiline')}
                      />
                      <Label htmlFor="multiline" className="text-sm">Multiline (m)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dotAll"
                        checked={flags.dotAll}
                        onChange={() => handleFlagChange('dotAll')}
                      />
                      <Label htmlFor="dotAll" className="text-sm">Dot All (s)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="unicode"
                        checked={flags.unicode}
                        onChange={() => handleFlagChange('unicode')}
                      />
                      <Label htmlFor="unicode" className="text-sm">Unicode (u)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sticky"
                        checked={flags.sticky}
                        onChange={() => handleFlagChange('sticky')}
                      />
                      <Label htmlFor="sticky" className="text-sm">Sticky (y)</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test String</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="testString">Enter text to test against:</Label>
                <textarea 
                  id="testString"
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  rows={8}
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder="Enter your test text here..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Invalid RegExp:</strong> {result.error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Badge variant={result.totalMatches > 0 ? "default" : "secondary"}>
                      {result.totalMatches} {result.totalMatches === 1 ? 'Match' : 'Matches'}
                    </Badge>
                    {pattern && (
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        /{pattern}/{getFlagString()}
                      </code>
                    )}
                  </div>
                  
                  {result.totalMatches > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Highlighted Text:</h4>
                      <div className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap border">
                        {highlightMatches(testString, result.matches)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Details */}
          {result.matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {result.matches.map((match, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Match {index + 1}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Position: {match.index}-{match.index + match.match.length}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Full Match:</span>
                          <code className="block text-sm bg-muted p-2 rounded mt-1 break-all">
                            "{match.match}"
                          </code>
                        </div>
                        
                        {match.groups.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Capture Groups:</span>
                            <div className="mt-1 space-y-1">
                              {match.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Group {groupIndex + 1}
                                  </Badge>
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    "{group || ''}"
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {Object.keys(match.namedGroups).length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Named Groups:</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(match.namedGroups).map(([name, value]) => (
                                <div key={name} className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {name}
                                  </Badge>
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    "{value}"
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Character Classes</h4>
              <ul className="space-y-1 font-mono">
                <li><code>.</code> - Any character</li>
                <li><code>\d</code> - Digit (0-9)</li>
                <li><code>\w</code> - Word character</li>
                <li><code>\s</code> - Whitespace</li>
                <li><code>[abc]</code> - Character set</li>
                <li><code>[^abc]</code> - Negated set</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quantifiers</h4>
              <ul className="space-y-1 font-mono">
                <li><code>*</code> - Zero or more</li>
                <li><code>+</code> - One or more</li>
                <li><code>?</code> - Zero or one</li>
                <li><code>{`{n}`}</code> - Exactly n</li>
                <li><code>{`{n,m}`}</code> - Between n and m</li>
                <li><code>{`{n,}`}</code> - n or more</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Anchors & Groups</h4>
              <ul className="space-y-1 font-mono">
                <li><code>^</code> - Start of string</li>
                <li><code>$</code> - End of string</li>
                <li><code>()</code> - Capture group</li>
                <li><code>(?:)</code> - Non-capture group</li>
                <li><code>|</code> - Alternation</li>
                <li><code>\</code> - Escape character</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}