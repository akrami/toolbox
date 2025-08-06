import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type InstanceType = 'paragraph' | 'sentence' | 'word';

interface LoremOptions {
  count: number;
  type: InstanceType;
}

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos', 'accusamus', 'accusantium',
  'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt',
  'explicabo', 'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'eos', 'qui', 'ratione',
  'sequi', 'nesciunt', 'neque', 'porro', 'quisquam', 'est', 'qui', 'dolorem', 'ipsum'
];

export default function LoremIpsumGenerator() {
  const [generatedText, setGeneratedText] = useState('');
  const [options, setOptions] = useState<LoremOptions>({
    count: 3,
    type: 'paragraph'
  });
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const generateWord = (): string => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const generateSentence = (): string => {
    const sentenceLength = Math.floor(Math.random() * 15) + 5; // 5-19 words
    const words: string[] = [];
    
    for (let i = 0; i < sentenceLength; i++) {
      words.push(generateWord());
    }
    
    // Capitalize first word
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    
    return words.join(' ') + '.';
  };

  const generateParagraph = (): string => {
    const sentenceCount = Math.floor(Math.random() * 5) + 3; // 3-7 sentences
    const sentences: string[] = [];
    
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    
    return sentences.join(' ');
  };

  const generateLorem = (): string => {
    const results: string[] = [];
    
    for (let i = 0; i < options.count; i++) {
      switch (options.type) {
        case 'word':
          results.push(generateWord());
          break;
        case 'sentence':
          results.push(generateSentence());
          break;
        case 'paragraph':
          results.push(generateParagraph());
          break;
      }
    }
    
    return options.type === 'paragraph' ? results.join('\n\n') : results.join(' ');
  };

  const handleGenerate = () => {
    const text = generateLorem();
    setGeneratedText(text);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedText;
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

  const typeDisplayNames = {
    paragraph: 'Paragraphs',
    sentence: 'Sentences',
    word: 'Words'
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Lorem Ipsum Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Number of instances */}
              <div>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={options.count}
                  onChange={(e) => setOptions(prev => ({ ...prev, count: Math.max(1, parseInt(e.target.value) || 1) }))}
                />
              </div>

              {/* Type selector */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {typeDisplayNames[options.type]}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setOptions(prev => ({ ...prev, type: 'paragraph' }))}>
                      Paragraphs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOptions(prev => ({ ...prev, type: 'sentence' }))}>
                      Sentences
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOptions(prev => ({ ...prev, type: 'word' }))}>
                      Words
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Generate button */}
            <Button onClick={handleGenerate} className="w-full">
              Generate Lorem Ipsum
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Text Display */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Lorem Ipsum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea 
              value={generatedText}
              readOnly 
              rows={10}
              className="flex min-h-[250px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Generated lorem ipsum text will appear here..."
            />
            <Button 
              onClick={handleCopyToClipboard} 
              disabled={!generatedText}
              className="w-full"
            >
              {copyButtonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}