import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface DiffResult {
  type: 'equal' | 'added' | 'removed';
  value: string;
  lineNumber?: number;
}

interface DiffStats {
  totalLines: number;
  addedLines: number;
  removedLines: number;
  changedLines: number;
  equalLines: number;
}

export default function TextDiffChecker() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diffMode, setDiffMode] = useState<'word' | 'line' | 'character'>('line');
  const [options, setOptions] = useState({
    ignoreCase: false,
    ignoreWhitespace: false,
    ignoreEmptyLines: false
  });

  // Sample texts for quick testing
  const sampleTexts = [
    {
      name: "Code Changes",
      left: `function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price;
  }
  return total;
}`,
      right: `function calculateTotal(items, taxRate = 0) {
  let total = 0;
  for (let item of items) {
    total += item.price * item.quantity;
  }
  const tax = total * taxRate;
  return total + tax;
}`
    },
    {
      name: "Document Changes",
      left: `# Project Setup

## Requirements
- Node.js v14 or higher
- npm or yarn

## Installation
1. Clone the repository
2. Run npm install
3. Start the development server

## Configuration
Edit config.json file`,
      right: `# Project Setup Guide

## Requirements
- Node.js v16 or higher
- npm or yarn package manager

## Installation Steps
1. Clone the repository
2. Run npm install
3. Copy .env.example to .env
4. Start the development server

## Configuration
Edit the config.json file in the root directory`
    },
    {
      name: "JSON Comparison",
      left: `{
  "name": "My App",
  "version": "1.0.0",
  "dependencies": {
    "react": "^17.0.0",
    "lodash": "^4.17.21"
  }
}`,
      right: `{
  "name": "My App",
  "version": "1.1.0",
  "author": "John Doe",
  "dependencies": {
    "react": "^18.0.0",
    "lodash": "^4.17.21",
    "axios": "^0.27.0"
  }
}`
    }
  ];

  const loadSampleText = (sample: typeof sampleTexts[0]) => {
    setLeftText(sample.left);
    setRightText(sample.right);
  };

  const clearAll = () => {
    setLeftText('');
    setRightText('');
  };

  const swapTexts = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  // Simple diff algorithm implementation
  const computeDiff = (text1: string, text2: string): DiffResult[] => {
    let processedText1 = text1;
    let processedText2 = text2;

    // Apply options
    if (options.ignoreCase) {
      processedText1 = processedText1.toLowerCase();
      processedText2 = processedText2.toLowerCase();
    }

    if (options.ignoreWhitespace) {
      processedText1 = processedText1.replace(/\s+/g, ' ').trim();
      processedText2 = processedText2.replace(/\s+/g, ' ').trim();
    }

    let units1: string[];
    let units2: string[];
    let originalUnits1: string[];
    let originalUnits2: string[];

    switch (diffMode) {
      case 'character':
        units1 = processedText1.split('');
        units2 = processedText2.split('');
        originalUnits1 = text1.split('');
        originalUnits2 = text2.split('');
        break;
      case 'word':
        units1 = processedText1.split(/(\s+)/);
        units2 = processedText2.split(/(\s+)/);
        originalUnits1 = text1.split(/(\s+)/);
        originalUnits2 = text2.split(/(\s+)/);
        break;
      case 'line':
      default:
        units1 = processedText1.split('\n');
        units2 = processedText2.split('\n');
        originalUnits1 = text1.split('\n');
        originalUnits2 = text2.split('\n');
        
        if (options.ignoreEmptyLines) {
          const nonEmptyIndices1: number[] = [];
          const nonEmptyIndices2: number[] = [];
          
          units1 = units1.filter((line, i) => {
            if (line.trim() !== '') {
              nonEmptyIndices1.push(i);
              return true;
            }
            return false;
          });
          
          units2 = units2.filter((line, i) => {
            if (line.trim() !== '') {
              nonEmptyIndices2.push(i);
              return true;
            }
            return false;
          });
          
          originalUnits1 = nonEmptyIndices1.map(i => originalUnits1[i]);
          originalUnits2 = nonEmptyIndices2.map(i => originalUnits2[i]);
        }
        break;
    }

    // Simple LCS-based diff algorithm
    const diff = longestCommonSubsequence(units1, units2, originalUnits1, originalUnits2);
    return diff;
  };

  // Longest Common Subsequence algorithm for diff
  const longestCommonSubsequence = (
    arr1: string[], 
    arr2: string[], 
    original1: string[], 
    original2: string[]
  ): DiffResult[] => {
    const m = arr1.length;
    const n = arr2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Build LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff
    const result: DiffResult[] = [];
    let i = m, j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
        result.unshift({
          type: 'equal',
          value: original1[i - 1],
          lineNumber: diffMode === 'line' ? i : undefined
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({
          type: 'added',
          value: original2[j - 1],
          lineNumber: diffMode === 'line' ? j : undefined
        });
        j--;
      } else if (i > 0) {
        result.unshift({
          type: 'removed',
          value: original1[i - 1],
          lineNumber: diffMode === 'line' ? i : undefined
        });
        i--;
      }
    }

    return result;
  };

  const diffResults = useMemo(() => {
    if (!leftText && !rightText) return [];
    return computeDiff(leftText, rightText);
  }, [leftText, rightText, diffMode, options]);

  const diffStats = useMemo((): DiffStats => {
    const stats = {
      totalLines: 0,
      addedLines: 0,
      removedLines: 0,
      changedLines: 0,
      equalLines: 0
    };

    diffResults.forEach(result => {
      if (diffMode === 'line') {
        stats.totalLines++;
        switch (result.type) {
          case 'added':
            stats.addedLines++;
            break;
          case 'removed':
            stats.removedLines++;
            break;
          case 'equal':
            stats.equalLines++;
            break;
        }
      }
    });

    stats.changedLines = stats.addedLines + stats.removedLines;
    return stats;
  }, [diffResults, diffMode]);

  const renderDiffResults = () => {
    if (diffResults.length === 0) {
      return <div className="text-center text-muted-foreground py-8">No differences to display</div>;
    }

    return (
      <div className="space-y-1 font-mono text-sm">
        {diffResults.map((result, index) => {
          let bgColor = '';
          let textColor = '';
          let prefix = '';

          switch (result.type) {
            case 'added':
              bgColor = 'bg-green-50 dark:bg-green-950 border-l-4 border-l-green-500';
              textColor = 'text-green-900 dark:text-green-100';
              prefix = '+ ';
              break;
            case 'removed':
              bgColor = 'bg-red-50 dark:bg-red-950 border-l-4 border-l-red-500';
              textColor = 'text-red-900 dark:text-red-100';
              prefix = '- ';
              break;
            case 'equal':
              bgColor = 'bg-background';
              textColor = 'text-foreground';
              prefix = '  ';
              break;
          }

          return (
            <div
              key={index}
              className={`px-3 py-1 ${bgColor} ${textColor} whitespace-pre-wrap break-all`}
            >
              <span className="select-none text-muted-foreground mr-2">
                {diffMode === 'line' && result.lineNumber ? 
                  `${result.lineNumber.toString().padStart(3, ' ')}` : 
                  `${(index + 1).toString().padStart(3, ' ')}`
                }
              </span>
              <span className="select-none">{prefix}</span>
              <span>{result.value || (diffMode === 'line' ? '(empty line)' : '')}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Diff Checker</h1>
        <p className="text-muted-foreground">Compare text files and highlight differences</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={clearAll} variant="outline" size="sm">
            Clear All
          </Button>
          <Button onClick={swapTexts} variant="outline" size="sm">
            Swap Texts
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

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="leftText">Enter the original text:</Label>
              <textarea
                id="leftText"
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                rows={12}
                className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                placeholder="Paste your original text here..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modified Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="rightText">Enter the modified text:</Label>
              <textarea
                id="rightText"
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                rows={12}
                className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                placeholder="Paste your modified text here..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Diff Mode */}
            <div className="space-y-2">
              <Label>Comparison Mode:</Label>
              <div className="flex gap-2">
                {(['line', 'word', 'character'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={diffMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDiffMode(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <Label>Options:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ignoreCase"
                    checked={options.ignoreCase}
                    onChange={() => handleOptionChange('ignoreCase')}
                  />
                  <Label htmlFor="ignoreCase" className="text-sm">Ignore Case</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ignoreWhitespace"
                    checked={options.ignoreWhitespace}
                    onChange={() => handleOptionChange('ignoreWhitespace')}
                  />
                  <Label htmlFor="ignoreWhitespace" className="text-sm">Ignore Whitespace</Label>
                </div>
                {diffMode === 'line' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ignoreEmptyLines"
                      checked={options.ignoreEmptyLines}
                      onChange={() => handleOptionChange('ignoreEmptyLines')}
                    />
                    <Label htmlFor="ignoreEmptyLines" className="text-sm">Ignore Empty Lines</Label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {(leftText || rightText) && (
        <Card>
          <CardHeader>
            <CardTitle>Diff Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {diffMode === 'line' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{diffStats.addedLines}</div>
                    <div className="text-sm text-muted-foreground">Added Lines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{diffStats.removedLines}</div>
                    <div className="text-sm text-muted-foreground">Removed Lines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{diffStats.equalLines}</div>
                    <div className="text-sm text-muted-foreground">Unchanged Lines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{diffStats.totalLines}</div>
                    <div className="text-sm text-muted-foreground">Total Lines</div>
                  </div>
                </>
              )}
              {diffMode !== 'line' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {diffResults.filter(r => r.type === 'added').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Added {diffMode}s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {diffResults.filter(r => r.type === 'removed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Removed {diffMode}s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {diffResults.filter(r => r.type === 'equal').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Unchanged {diffMode}s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{diffResults.length}</div>
                    <div className="text-sm text-muted-foreground">Total {diffMode}s</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff Results */}
      <Card>
        <CardHeader>
          <CardTitle>Differences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 dark:bg-green-950 border border-green-500 rounded"></div>
                <span className="text-green-700 dark:text-green-300">+ Added</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 dark:bg-red-950 border border-red-500 rounded"></div>
                <span className="text-red-700 dark:text-red-300">- Removed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-background border border-muted rounded"></div>
                <span className="text-muted-foreground">Unchanged</span>
              </div>
            </div>

            {/* Results */}
            <div className="border rounded-lg max-h-96 overflow-auto">
              {renderDiffResults()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}