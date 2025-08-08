import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SvgToCss() {
  const [inputSvg, setInputSvg] = useState('');
  const [cssOutput, setCssOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [options, setOptions] = useState({
    className: 'svg-icon',
    outputFormat: 'background-image' as 'background-image' | 'mask' | 'both',
    includeSize: true,
    optimizeSvg: true,
    addFallback: false
  });

  const optimizeSvg = (svg: string): string => {
    if (!options.optimizeSvg) return svg;

    let optimized = svg;

    // Remove XML declaration
    optimized = optimized.replace(/<\?xml[^>]*\?>/gi, '');

    // Remove DOCTYPE declaration
    optimized = optimized.replace(/<!DOCTYPE[^>]*>/gi, '');

    // Remove comments
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ').trim();

    // Remove empty attributes
    optimized = optimized.replace(/\s+[a-zA-Z-]+=""/g, '');

    // Remove default values
    optimized = optimized.replace(/\s+fill="black"/gi, '');
    optimized = optimized.replace(/\s+fill="#000000"/gi, '');
    optimized = optimized.replace(/\s+fill="#000"/gi, '');
    optimized = optimized.replace(/\s+stroke="none"/gi, '');
    optimized = optimized.replace(/\s+stroke-width="1"/gi, '');

    return optimized;
  };

  const escapeSvgForDataUri = (svg: string): string => {
    // Escape characters for data URI
    return svg
      .replace(/"/g, "'")
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/#/g, '%23')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractSvgDimensions = (svg: string): { width?: string; height?: string } => {
    const widthMatch = svg.match(/width=['"]([^'"]+)['"]/i);
    const heightMatch = svg.match(/height=['"]([^'"]+)['"]/i);
    const viewBoxMatch = svg.match(/viewBox=['"]([^'"]+)['"]/i);

    let width = widthMatch?.[1];
    let height = heightMatch?.[1];

    // If no width/height but viewBox exists, extract from viewBox
    if (!width && !height && viewBoxMatch) {
      const viewBoxValues = viewBoxMatch[1].split(/\s+/);
      if (viewBoxValues.length >= 4) {
        width = `${viewBoxValues[2]}px`;
        height = `${viewBoxValues[3]}px`;
      }
    }

    // Convert units if necessary
    const convertUnit = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      if (value.includes('px') || value.includes('%') || value.includes('em') || value.includes('rem')) {
        return value;
      }
      return `${value}px`;
    };

    return {
      width: convertUnit(width),
      height: convertUnit(height)
    };
  };

  const generateBackgroundImageCSS = (dataUri: string, dimensions: { width?: string; height?: string }): string => {
    let css = `.${options.className} {\n`;
    css += `  background-image: url("data:image/svg+xml,${dataUri}");\n`;
    css += `  background-repeat: no-repeat;\n`;
    css += `  background-position: center;\n`;
    css += `  background-size: contain;\n`;
    
    if (options.includeSize && dimensions.width && dimensions.height) {
      css += `  width: ${dimensions.width};\n`;
      css += `  height: ${dimensions.height};\n`;
    } else if (options.includeSize) {
      css += `  width: 24px;\n`;
      css += `  height: 24px;\n`;
    }
    
    css += `  display: inline-block;\n`;
    css += `}`;

    return css;
  };

  const generateMaskCSS = (dataUri: string, dimensions: { width?: string; height?: string }): string => {
    let css = `.${options.className} {\n`;
    css += `  mask: url("data:image/svg+xml,${dataUri}") no-repeat center / contain;\n`;
    css += `  -webkit-mask: url("data:image/svg+xml,${dataUri}") no-repeat center / contain;\n`;
    css += `  background-color: currentColor;\n`;
    
    if (options.includeSize && dimensions.width && dimensions.height) {
      css += `  width: ${dimensions.width};\n`;
      css += `  height: ${dimensions.height};\n`;
    } else if (options.includeSize) {
      css += `  width: 24px;\n`;
      css += `  height: 24px;\n`;
    }
    
    css += `  display: inline-block;\n`;
    css += `}`;

    return css;
  };

  const generateBothCSS = (dataUri: string, dimensions: { width?: string; height?: string }): string => {
    let css = `/* Background Image Method */\n`;
    css += `.${options.className}-bg {\n`;
    css += `  background-image: url("data:image/svg+xml,${dataUri}");\n`;
    css += `  background-repeat: no-repeat;\n`;
    css += `  background-position: center;\n`;
    css += `  background-size: contain;\n`;
    
    if (options.includeSize && dimensions.width && dimensions.height) {
      css += `  width: ${dimensions.width};\n`;
      css += `  height: ${dimensions.height};\n`;
    } else if (options.includeSize) {
      css += `  width: 24px;\n`;
      css += `  height: 24px;\n`;
    }
    
    css += `  display: inline-block;\n`;
    css += `}\n\n`;

    css += `/* Mask Method (supports color change) */\n`;
    css += `.${options.className}-mask {\n`;
    css += `  mask: url("data:image/svg+xml,${dataUri}") no-repeat center / contain;\n`;
    css += `  -webkit-mask: url("data:image/svg+xml,${dataUri}") no-repeat center / contain;\n`;
    css += `  background-color: currentColor;\n`;
    
    if (options.includeSize && dimensions.width && dimensions.height) {
      css += `  width: ${dimensions.width};\n`;
      css += `  height: ${dimensions.height};\n`;
    } else if (options.includeSize) {
      css += `  width: 24px;\n`;
      css += `  height: 24px;\n`;
    }
    
    css += `  display: inline-block;\n`;
    css += `}`;

    return css;
  };

  const convertSvgToCss = () => {
    try {
      if (!inputSvg.trim()) {
        setCssOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      // Validate SVG
      if (!inputSvg.includes('<svg')) {
        throw new Error('Input does not contain valid SVG markup');
      }

      // Optimize SVG
      const optimizedSvg = optimizeSvg(inputSvg);

      // Extract dimensions
      const dimensions = extractSvgDimensions(optimizedSvg);

      // Create data URI
      const escapedSvg = escapeSvgForDataUri(optimizedSvg);

      // Generate CSS based on selected format
      let css = '';
      
      switch (options.outputFormat) {
        case 'background-image':
          css = generateBackgroundImageCSS(escapedSvg, dimensions);
          break;
        case 'mask':
          css = generateMaskCSS(escapedSvg, dimensions);
          break;
        case 'both':
          css = generateBothCSS(escapedSvg, dimensions);
          break;
      }

      // Add fallback if requested
      if (options.addFallback && options.outputFormat !== 'both') {
        css += '\n\n/* Fallback for older browsers */\n';
        css += `.${options.className}::before {\n`;
        css += `  content: "";\n`;
        css += `  display: inline-block;\n`;
        if (dimensions.width && dimensions.height) {
          css += `  width: ${dimensions.width};\n`;
          css += `  height: ${dimensions.height};\n`;
        } else {
          css += `  width: 24px;\n`;
          css += `  height: 24px;\n`;
        }
        css += `  background-image: url("data:image/svg+xml,${escapedSvg}");\n`;
        css += `  background-size: contain;\n`;
        css += `  background-repeat: no-repeat;\n`;
        css += `}`;
      }

      setCssOutput(css);
      setIsValid(true);
      setErrorMessage('✅ Successfully converted SVG to CSS');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCssOutput('');
    }
  };

  const clearAll = () => {
    setInputSvg('');
    setCssOutput('');
    setIsValid(true);
    setErrorMessage('');
  };

  const copyToClipboard = async () => {
    if (cssOutput) {
      try {
        await navigator.clipboard.writeText(cssOutput);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const downloadCss = () => {
    if (cssOutput) {
      const blob = new Blob([cssOutput], { type: 'text/css;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${options.className}.css`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const loadSimpleIcon = () => {
    const simpleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    
    setInputSvg(simpleIcon);
  };

  const loadColorIcon = () => {
    const colorIcon = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="12" fill="#3b82f6"/>
  <path d="M16 8v8l4 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>`;
    
    setInputSvg(colorIcon);
  };

  const loadComplexIcon = () => {
    const complexIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Home icon -->
  <path d="M24 4L6 20V42H18V30H30V42H42V20L24 4Z" fill="#10b981" stroke="#065f46" stroke-width="2"/>
  <path d="M16 42V32H32V42" stroke="#065f46" stroke-width="2"/>
  <circle cx="20" cy="24" r="2" fill="#065f46"/>
  <circle cx="28" cy="24" r="2" fill="#065f46"/>
</svg>`;
    
    setInputSvg(complexIcon);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SVG to CSS</h1>
        <p className="text-muted-foreground">Convert SVG icons to CSS background images or masks with optimization</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>SVG Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputSvg">Paste your SVG code here:</Label>
                <textarea 
                  id="inputSvg"
                  value={inputSvg}
                  onChange={(e) => setInputSvg(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='<svg width="24" height="24" viewBox="0 0 24 24">...</svg>'
                />
              </div>
              
              {/* Configuration Options */}
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Conversion Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="className">CSS Class Name:</Label>
                      <input 
                        id="className"
                        type="text"
                        value={options.className}
                        onChange={(e) => setOptions({...options, className: e.target.value})}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="svg-icon"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="outputFormat">Output Format:</Label>
                      <select 
                        id="outputFormat"
                        value={options.outputFormat}
                        onChange={(e) => setOptions({...options, outputFormat: e.target.value as any})}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        <option value="background-image">Background Image</option>
                        <option value="mask">Mask (supports color change)</option>
                        <option value="both">Both Methods</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        id="includeSize"
                        type="checkbox"
                        checked={options.includeSize}
                        onChange={(e) => setOptions({...options, includeSize: e.target.checked})}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="includeSize">Include size properties</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        id="optimizeSvg"
                        type="checkbox"
                        checked={options.optimizeSvg}
                        onChange={(e) => setOptions({...options, optimizeSvg: e.target.checked})}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="optimizeSvg">Optimize SVG</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        id="addFallback"
                        type="checkbox"
                        checked={options.addFallback}
                        onChange={(e) => setOptions({...options, addFallback: e.target.checked})}
                        disabled={options.outputFormat === 'both'}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="addFallback">Add browser fallback</Label>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertSvgToCss} className="flex-1">
                  Convert to CSS
                </Button>
                <Button onClick={loadSimpleIcon} variant="outline">
                  Simple Icon
                </Button>
                <Button onClick={loadColorIcon} variant="outline">
                  Color Icon
                </Button>
                <Button onClick={loadComplexIcon} variant="outline">
                  Complex Icon
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

        {cssOutput && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>CSS Output</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadCss} variant="outline" size="sm">
                  Download CSS
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="cssOutput">Generated CSS:</Label>
                <textarea 
                  id="cssOutput"
                  value={cssOutput}
                  readOnly
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
                />
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Usage Examples:</h4>
                <div className="text-xs text-blue-800 space-y-2">
                  {options.outputFormat === 'background-image' && (
                    <div>
                      <strong>Background Image:</strong>
                      <code className="block mt-1 p-2 bg-white rounded text-xs">
                        {`<div class="${options.className}"></div>`}
                      </code>
                    </div>
                  )}
                  {options.outputFormat === 'mask' && (
                    <div>
                      <strong>Mask (color customizable):</strong>
                      <code className="block mt-1 p-2 bg-white rounded text-xs">
                        {`<div class="${options.className}" style="color: red;"></div>`}
                      </code>
                    </div>
                  )}
                  {options.outputFormat === 'both' && (
                    <div>
                      <strong>Both methods:</strong>
                      <code className="block mt-1 p-2 bg-white rounded text-xs">
                        {`<div class="${options.className}-bg"></div>`}<br/>
                        {`<div class="${options.className}-mask" style="color: blue;"></div>`}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}