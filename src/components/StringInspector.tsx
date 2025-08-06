import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface StringAnalysis {
  characterCount: number;
  byteCount: number;
  wordCount: number;
  lineCount: number;
  nonEmptyLineCount: number;
  topWords: Array<{ word: string; count: number; percentage: number }>;
}

export default function StringInspector() {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<StringAnalysis | null>(null);

  const analyzeString = () => {
    if (!inputText.trim()) {
      setAnalysis(null);
      return;
    }

    const characterCount = inputText.length;
    const byteCount = new TextEncoder().encode(inputText).length;
    const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = inputText.split('\n').length;
    const nonEmptyLineCount = inputText.split('\n').filter(line => line.trim().length > 0).length;

    const words = inputText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const topWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        percentage: Math.round((count / words.length) * 100 * 100) / 100
      }));

    setAnalysis({
      characterCount,
      byteCount,
      wordCount,
      lineCount,
      nonEmptyLineCount,
      topWords
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>String Input</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stringInput">Enter text to analyze:</Label>
              <textarea 
                id="stringInput"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Type or paste your text here..."
              />
            </div>
            <Button onClick={analyzeString} className="w-full">
              Inspect String
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Character Count:</span>
                  <span className="font-mono text-lg">{analysis.characterCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Byte Count:</span>
                  <span className="font-mono text-lg">{analysis.byteCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Word Count:</span>
                  <span className="font-mono text-lg">{analysis.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Line Count:</span>
                  <span className="font-mono text-lg">{analysis.lineCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Non-Empty Lines:</span>
                  <span className="font-mono text-lg">{analysis.nonEmptyLineCount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Words Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.topWords.length > 0 ? (
                <div className="space-y-3">
                  {analysis.topWords.map((wordData, index) => (
                    <div key={wordData.word} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          #{index + 1} "{wordData.word}"
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {wordData.count} times ({wordData.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${wordData.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No words found to analyze
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}