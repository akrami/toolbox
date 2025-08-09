import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface CaseFormat {
  name: string;
  key: string;
  description: string;
  example: string;
  convert: (text: string) => string;
  commonUse: string;
}

interface ConversionResult {
  format: string;
  result: string;
  description: string;
  example: string;
  commonUse: string;
}

export default function StringCaseConverter() {
  const [inputText, setInputText] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(
    new Set(['camelCase', 'PascalCase', 'snake_case', 'kebab-case', 'UPPER_CASE'])
  );
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([]);

  // Case conversion functions
  const caseFormats: CaseFormat[] = [
    {
      name: 'camelCase',
      key: 'camelCase',
      description: 'First word lowercase, subsequent words capitalized, no spaces',
      example: 'myVariableName',
      commonUse: 'JavaScript/Java variables, object properties',
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
          })
          .replace(/\s+/g, '');
      }
    },
    {
      name: 'PascalCase',
      key: 'PascalCase',
      description: 'All words capitalized, no spaces (Upper Camel Case)',
      example: 'MyClassName',
      commonUse: 'Class names, constructors, components',
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '');
      }
    },
    {
      name: 'snake_case',
      key: 'snake_case',
      description: 'All lowercase with underscores between words',
      example: 'my_variable_name',
      commonUse: 'Python variables, database columns, file names',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('_');
      }
    },
    {
      name: 'kebab-case',
      key: 'kebab-case',
      description: 'All lowercase with hyphens between words',
      example: 'my-variable-name',
      commonUse: 'CSS classes, HTML attributes, URLs, file names',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('-');
      }
    },
    {
      name: 'UPPER_CASE',
      key: 'UPPER_CASE',
      description: 'All uppercase with underscores between words',
      example: 'MY_CONSTANT_VALUE',
      commonUse: 'Constants, environment variables, macros',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toUpperCase())
          .join('_');
      }
    },
    {
      name: 'UPPER-KEBAB-CASE',
      key: 'UPPER-KEBAB-CASE',
      description: 'All uppercase with hyphens between words',
      example: 'MY-CONSTANT-VALUE',
      commonUse: 'HTTP headers, some configuration files',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toUpperCase())
          .join('-');
      }
    },
    {
      name: 'lowercase',
      key: 'lowercase',
      description: 'All characters in lowercase',
      example: 'my variable name',
      commonUse: 'Simple text processing, case-insensitive comparisons',
      convert: (text: string) => text.toLowerCase()
    },
    {
      name: 'UPPERCASE',
      key: 'UPPERCASE',
      description: 'All characters in uppercase',
      example: 'MY VARIABLE NAME',
      commonUse: 'Headers, emphasis, legacy systems',
      convert: (text: string) => text.toUpperCase()
    },
    {
      name: 'Title Case',
      key: 'Title Case',
      description: 'First letter of each word capitalized',
      example: 'My Variable Name',
      commonUse: 'Titles, headers, proper names',
      convert: (text: string) => {
        return text.replace(/\w\S*/g, (txt) => {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      }
    },
    {
      name: 'Sentence case',
      key: 'Sentence case',
      description: 'First letter capitalized, rest lowercase',
      example: 'My variable name',
      commonUse: 'Sentences, descriptions, user-facing text',
      convert: (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      }
    },
    {
      name: 'dot.case',
      key: 'dot.case',
      description: 'All lowercase with dots between words',
      example: 'my.variable.name',
      commonUse: 'Package names, namespaces, configuration keys',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('.');
      }
    },
    {
      name: 'path/case',
      key: 'path/case',
      description: 'All lowercase with forward slashes between words',
      example: 'my/variable/name',
      commonUse: 'File paths, URLs, hierarchical structures',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('/');
      }
    }
  ];

  // Sample texts for quick testing
  const sampleTexts = [
    {
      name: "Variable Name",
      text: "myVariableName"
    },
    {
      name: "Class Name",
      text: "UserAccountManager"
    },
    {
      name: "Simple Text",
      text: "hello world"
    },
    {
      name: "Mixed Format",
      text: "convert-this_textTo Different Cases"
    },
    {
      name: "With Numbers",
      text: "user123AccountData"
    },
    {
      name: "API Endpoint",
      text: "getUserAccountDetails"
    }
  ];

  const loadSampleText = (sample: typeof sampleTexts[0]) => {
    setInputText(sample.text);
  };

  const clearAll = () => {
    setInputText('');
    setConversionResults([]);
  };

  const handleFormatToggle = (format: string) => {
    const newSelected = new Set(selectedFormats);
    if (newSelected.has(format)) {
      newSelected.delete(format);
    } else {
      newSelected.add(format);
    }
    setSelectedFormats(newSelected);
  };

  const selectAllFormats = () => {
    setSelectedFormats(new Set(caseFormats.map(f => f.key)));
  };

  const deselectAllFormats = () => {
    setSelectedFormats(new Set());
  };

  const selectCommonFormats = () => {
    setSelectedFormats(new Set(['camelCase', 'PascalCase', 'snake_case', 'kebab-case', 'UPPER_CASE']));
  };

  // Generate conversions
  const generateConversions = useMemo(() => {
    if (!inputText.trim() || selectedFormats.size === 0) {
      setConversionResults([]);
      return;
    }

    const results: ConversionResult[] = [];
    
    for (const formatKey of Array.from(selectedFormats)) {
      const format = caseFormats.find(f => f.key === formatKey);
      if (format) {
        try {
          const result = format.convert(inputText.trim());
          results.push({
            format: format.name,
            result,
            description: format.description,
            example: format.example,
            commonUse: format.commonUse
          });
        } catch (error) {
          results.push({
            format: format.name,
            result: 'Error converting',
            description: format.description,
            example: format.example,
            commonUse: format.commonUse
          });
        }
      }
    }

    setConversionResults(results);
  }, [inputText, selectedFormats]);

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

  const copyAllResults = () => {
    const allResults = conversionResults
      .map(result => `${result.format}: ${result.result}`)
      .join('\n');
    copyToClipboard(allResults);
  };

  const getFormatCategory = (formatKey: string): 'programming' | 'text' | 'special' => {
    const programmingFormats = ['camelCase', 'PascalCase', 'snake_case', 'kebab-case', 'UPPER_CASE', 'UPPER-KEBAB-CASE', 'dot.case'];
    const textFormats = ['lowercase', 'UPPERCASE', 'Title Case', 'Sentence case'];
    const specialFormats = ['path/case'];

    if (programmingFormats.includes(formatKey)) return 'programming';
    if (textFormats.includes(formatKey)) return 'text';
    return 'special';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">String Case Converter</h1>
        <p className="text-muted-foreground">Convert text between different case formats</p>
        
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
              <CardTitle>Input Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inputText">Enter text to convert:</Label>
                  <textarea
                    id="inputText"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder="Enter your text here... (e.g., 'myVariableName' or 'hello world')"
                  />
                  {inputText && (
                    <div className="text-xs text-muted-foreground">
                      Length: {inputText.length} characters
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Case Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={selectAllFormats} variant="outline" size="sm">
                    Select All
                  </Button>
                  <Button onClick={deselectAllFormats} variant="outline" size="sm">
                    Deselect All
                  </Button>
                  <Button onClick={selectCommonFormats} variant="outline" size="sm">
                    Common
                  </Button>
                </div>

                {/* Programming Formats */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Programming Formats</h4>
                  <div className="space-y-3">
                    {caseFormats.filter(f => getFormatCategory(f.key) === 'programming').map((format) => (
                      <div key={format.key} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={format.key}
                              checked={selectedFormats.has(format.key)}
                              onChange={() => handleFormatToggle(format.key)}
                            />
                            <Label htmlFor={format.key} className="font-medium">
                              {format.name}
                            </Label>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {format.example}
                            </code>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{format.description}</p>
                          <p><strong>Common use:</strong> {format.commonUse}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text Formats */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Text Formats</h4>
                  <div className="space-y-3">
                    {caseFormats.filter(f => getFormatCategory(f.key) === 'text').map((format) => (
                      <div key={format.key} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={format.key}
                              checked={selectedFormats.has(format.key)}
                              onChange={() => handleFormatToggle(format.key)}
                            />
                            <Label htmlFor={format.key} className="font-medium">
                              {format.name}
                            </Label>
                            <span className="text-xs bg-muted px-1 py-0.5 rounded">
                              {format.example}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{format.description}</p>
                          <p><strong>Common use:</strong> {format.commonUse}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Formats */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Special Formats</h4>
                  <div className="space-y-3">
                    {caseFormats.filter(f => getFormatCategory(f.key) === 'special').map((format) => (
                      <div key={format.key} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={format.key}
                              checked={selectedFormats.has(format.key)}
                              onChange={() => handleFormatToggle(format.key)}
                            />
                            <Label htmlFor={format.key} className="font-medium">
                              {format.name}
                            </Label>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {format.example}
                            </code>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{format.description}</p>
                          <p><strong>Common use:</strong> {format.commonUse}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {conversionResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversion Results</CardTitle>
                  <Button
                    onClick={copyAllResults}
                    variant="outline"
                    size="sm"
                  >
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.format}</Badge>
                          <Badge 
                            variant="secondary"
                            className="text-xs"
                          >
                            {getFormatCategory(caseFormats.find(f => f.name === result.format)?.key || '')}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.result)}
                          className="text-xs"
                        >
                          Copy
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <code className="block text-sm bg-muted p-3 rounded break-all font-mono">
                          {result.result}
                        </code>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{result.description}</p>
                          <p><strong>Common use:</strong> {result.commonUse}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Case Format Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Case Format Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Quick Reference</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center">
                      <code className="text-xs">camelCase</code>
                      <span className="text-xs text-muted-foreground">JS variables, properties</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-xs">PascalCase</code>
                      <span className="text-xs text-muted-foreground">Classes, constructors</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-xs">snake_case</code>
                      <span className="text-xs text-muted-foreground">Python, databases</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-xs">kebab-case</code>
                      <span className="text-xs text-muted-foreground">CSS, URLs, files</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-xs">UPPER_CASE</code>
                      <span className="text-xs text-muted-foreground">Constants, env vars</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Programming Conventions</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li><strong>JavaScript:</strong> camelCase for variables, PascalCase for classes</li>
                    <li><strong>Python:</strong> snake_case for variables and functions</li>
                    <li><strong>CSS:</strong> kebab-case for classes and IDs</li>
                    <li><strong>Constants:</strong> UPPER_CASE in most languages</li>
                    <li><strong>URLs:</strong> kebab-case for readability and SEO</li>
                  </ul>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Tip:</strong> Choose consistent naming conventions within your project. Different languages and frameworks have their own preferred styles.
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