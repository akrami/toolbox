import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function HtmlToJsx() {
  const [inputHtml, setInputHtml] = useState('');
  const [jsxOutput, setJsxOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [options, setOptions] = useState({
    addReactImport: true,
    functionComponent: true,
    componentName: 'MyComponent',
    formatOutput: true,
    convertComments: true
  });

  // HTML attributes that need to be converted to JSX
  const HTML_TO_JSX_ATTRS: Record<string, string> = {
    'class': 'className',
    'for': 'htmlFor',
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'maxlength': 'maxLength',
    'cellpadding': 'cellPadding',
    'cellspacing': 'cellSpacing',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable',
    'crossorigin': 'crossOrigin',
    'datetime': 'dateTime',
    'enctype': 'encType',
    'formaction': 'formAction',
    'formenctype': 'formEncType',
    'formmethod': 'formMethod',
    'formnovalidate': 'formNoValidate',
    'formtarget': 'formTarget',
    'hreflang': 'hrefLang',
    'http-equiv': 'httpEquiv',
    'novalidate': 'noValidate',
    'radiogroup': 'radioGroup',
    'spellcheck': 'spellCheck',
    'srcdoc': 'srcDoc',
    'srclang': 'srcLang',
    'srcset': 'srcSet',
    'autocomplete': 'autoComplete',
    'autofocus': 'autoFocus',
    'autoplay': 'autoPlay',
    'controls': 'controls',
    'defer': 'defer',
    'disabled': 'disabled',
    'hidden': 'hidden',
    'loop': 'loop',
    'multiple': 'multiple',
    'muted': 'muted',
    'open': 'open',
    'required': 'required',
    'reversed': 'reversed',
    'selected': 'selected'
  };

  // Self-closing HTML tags that need to be converted
  const SELF_CLOSING_TAGS = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  const convertHtmlAttributeToJsx = (attr: string): string => {
    const lowerAttr = attr.toLowerCase();
    
    // Convert known HTML attributes to JSX
    if (HTML_TO_JSX_ATTRS[lowerAttr]) {
      return HTML_TO_JSX_ATTRS[lowerAttr];
    }
    
    // Convert data-* and aria-* attributes (keep as-is)
    if (lowerAttr.startsWith('data-') || lowerAttr.startsWith('aria-')) {
      return lowerAttr;
    }
    
    // Convert hyphenated attributes to camelCase
    if (lowerAttr.includes('-')) {
      return lowerAttr.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }
    
    return lowerAttr;
  };

  const convertStyleAttribute = (styleValue: string): string => {
    // Convert CSS style string to JSX style object
    const styles = styleValue.split(';').filter(style => style.trim());
    const styleObject: Record<string, string> = {};
    
    styles.forEach(style => {
      const [property, value] = style.split(':').map(s => s.trim());
      if (property && value) {
        // Convert CSS property names to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        styleObject[camelProperty] = value;
      }
    });
    
    // Convert to JSX object syntax
    const styleEntries = Object.entries(styleObject).map(([key, value]) => {
      // Handle numeric values
      if (/^\d+$/.test(value)) {
        return `${key}: ${value}`;
      }
      return `${key}: '${value}'`;
    });
    
    return `{{${styleEntries.join(', ')}}}`;
  };

  const parseHtmlToJsx = (html: string): string => {
    let jsx = html;
    
    // Convert HTML comments to JSX comments if enabled
    if (options.convertComments) {
      jsx = jsx.replace(/<!--\s*(.*?)\s*-->/gs, (match, content) => {
        return `{/* ${content.trim()} */}`;
      });
    } else {
      // Remove HTML comments
      jsx = jsx.replace(/<!--.*?-->/gs, '');
    }
    
    // Convert self-closing tags
    SELF_CLOSING_TAGS.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
      jsx = jsx.replace(regex, `<${tag}$1 />`);
    });
    
    // Convert attributes
    jsx = jsx.replace(/<(\w+)([^>]*?)>/g, (match, tagName, attributes) => {
      if (!attributes.trim()) {
        return match;
      }
      
      // Parse attributes
      const attrRegex = /(\w+(?:-\w+)*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let convertedAttrs = '';
      let attrMatch;
      
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        const [, attrName, doubleQuotedValue, singleQuotedValue, unquotedValue] = attrMatch;
        const attrValue = doubleQuotedValue || singleQuotedValue || unquotedValue;
        const jsxAttrName = convertHtmlAttributeToJsx(attrName);
        
        if (attrValue === undefined) {
          // Boolean attribute
          convertedAttrs += ` ${jsxAttrName}`;
        } else if (jsxAttrName === 'style' && attrValue) {
          // Handle style attribute specially
          convertedAttrs += ` ${jsxAttrName}=${convertStyleAttribute(attrValue)}`;
        } else if (jsxAttrName === 'className' && attrValue) {
          // Handle className
          convertedAttrs += ` ${jsxAttrName}="${attrValue}"`;
        } else {
          // Regular attribute
          convertedAttrs += ` ${jsxAttrName}="${attrValue}"`;
        }
      }
      
      return `<${tagName}${convertedAttrs}>`;
    });
    
    return jsx;
  };

  const formatJsxCode = (jsx: string): string => {
    if (!options.formatOutput) {
      return jsx;
    }
    
    let formatted = jsx;
    let indentLevel = 0;
    const indentSize = 2;
    
    // Split by lines and format
    const lines = formatted.split('\n');
    const formattedLines: string[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Decrease indent for closing tags
      if (trimmedLine.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add indented line
      formattedLines.push(' '.repeat(indentLevel * indentSize) + trimmedLine);
      
      // Increase indent for opening tags (but not self-closing ones)
      if (trimmedLine.startsWith('<') && !trimmedLine.startsWith('</') && !trimmedLine.endsWith('/>') && !trimmedLine.includes('</')) {
        indentLevel++;
      }
    });
    
    return formattedLines.join('\n');
  };

  const wrapInComponent = (jsx: string): string => {
    if (!options.functionComponent) {
      return jsx;
    }
    
    let result = '';
    
    if (options.addReactImport) {
      result += "import React from 'react';\n\n";
    }
    
    result += `function ${options.componentName}() {\n`;
    result += '  return (\n';
    
    // Indent the JSX content
    const indentedJsx = jsx.split('\n').map(line => 
      line.trim() ? '    ' + line : line
    ).join('\n');
    
    result += indentedJsx;
    result += '\n  );\n';
    result += '}\n\n';
    result += `export default ${options.componentName};`;
    
    return result;
  };

  const convertHtmlToJsx = () => {
    try {
      if (!inputHtml.trim()) {
        setJsxOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      // Basic HTML validation
      const openTags = (inputHtml.match(/<[^\/][^>]*>/g) || []).length;
      const closeTags = (inputHtml.match(/<\/[^>]*>/g) || []).length;
      const selfClosingTags = (inputHtml.match(/<[^>]*\/>/g) || []).length;
      
      // Convert HTML to JSX
      let jsx = parseHtmlToJsx(inputHtml.trim());
      
      // Format the output
      jsx = formatJsxCode(jsx);
      
      // Wrap in React component if requested
      if (options.functionComponent) {
        jsx = wrapInComponent(jsx);
      }
      
      setJsxOutput(jsx);
      setIsValid(true);
      setErrorMessage('✅ Successfully converted HTML to JSX');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setJsxOutput('');
    }
  };

  const clearAll = () => {
    setInputHtml('');
    setJsxOutput('');
    setIsValid(true);
    setErrorMessage('');
  };

  const copyToClipboard = async () => {
    if (jsxOutput) {
      try {
        await navigator.clipboard.writeText(jsxOutput);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const downloadJsx = () => {
    if (jsxOutput) {
      const extension = options.functionComponent ? '.jsx' : '.txt';
      const filename = options.functionComponent ? `${options.componentName}.jsx` : 'converted.txt';
      const blob = new Blob([jsxOutput], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const loadSimpleExample = () => {
    const simpleExample = `<div class="container">
  <h1>Hello World</h1>
  <p style="color: red; font-size: 16px;">This is a paragraph.</p>
  <button onclick="handleClick()">Click me</button>
  <input type="text" placeholder="Enter text" />
  <img src="image.jpg" alt="An image" />
</div>`;
    
    setInputHtml(simpleExample);
  };

  const loadFormExample = () => {
    const formExample = `<form class="login-form" method="post">
  <div class="form-group">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required autofocus />
  </div>
  <div class="form-group">
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required />
  </div>
  <div class="checkbox-group">
    <input type="checkbox" id="remember" name="remember" />
    <label for="remember">Remember me</label>
  </div>
  <button type="submit" disabled>Login</button>
</form>`;
    
    setInputHtml(formExample);
  };

  const loadComplexExample = () => {
    const complexExample = `<div class="card" data-id="123">
  <!-- Card Header -->
  <header class="card-header" style="background-color: #f8f9fa; padding: 1rem;">
    <h2>Product Card</h2>
  </header>
  
  <div class="card-body">
    <img src="product.jpg" alt="Product image" style="width: 100%; height: auto;" />
    <h3 class="product-title">Amazing Product</h3>
    <p class="product-description">
      This is an <strong>amazing</strong> product with <em>great</em> features.
    </p>
    
    <div class="price-section">
      <span class="price" data-price="99.99">$99.99</span>
      <span class="discount" style="color: red; text-decoration: line-through;">$129.99</span>
    </div>
    
    <div class="actions">
      <button class="btn btn-primary" onclick="addToCart(123)">Add to Cart</button>
      <button class="btn btn-secondary" onclick="addToWishlist(123)">♡ Wishlist</button>
    </div>
  </div>
</div>`;
    
    setInputHtml(complexExample);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HTML to JSX</h1>
        <p className="text-muted-foreground">Convert HTML to JSX format for React with automatic attribute conversion</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HTML Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputHtml">Paste your HTML here:</Label>
                <textarea 
                  id="inputHtml"
                  value={inputHtml}
                  onChange={(e) => setInputHtml(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='<div class="container"><h1>Hello World</h1></div>'
                />
              </div>
              
              {/* Configuration Options */}
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Conversion Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        id="functionComponent"
                        type="checkbox"
                        checked={options.functionComponent}
                        onChange={(e) => setOptions({...options, functionComponent: e.target.checked})}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="functionComponent">Wrap in React component</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        id="addReactImport"
                        type="checkbox"
                        checked={options.addReactImport}
                        onChange={(e) => setOptions({...options, addReactImport: e.target.checked})}
                        disabled={!options.functionComponent}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="addReactImport">Add React import</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        id="formatOutput"
                        type="checkbox"
                        checked={options.formatOutput}
                        onChange={(e) => setOptions({...options, formatOutput: e.target.checked})}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="formatOutput">Format output</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        id="convertComments"
                        type="checkbox"
                        checked={options.convertComments}
                        onChange={(e) => setOptions({...options, convertComments: e.target.checked})}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="convertComments">Convert HTML comments</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="componentName">Component Name:</Label>
                      <input 
                        id="componentName"
                        type="text"
                        value={options.componentName}
                        onChange={(e) => setOptions({...options, componentName: e.target.value})}
                        disabled={!options.functionComponent}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="MyComponent"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertHtmlToJsx} className="flex-1">
                  Convert to JSX
                </Button>
                <Button onClick={loadSimpleExample} variant="outline">
                  Simple Example
                </Button>
                <Button onClick={loadFormExample} variant="outline">
                  Form Example
                </Button>
                <Button onClick={loadComplexExample} variant="outline">
                  Complex Example
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

        {jsxOutput && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>JSX Output</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadJsx} variant="outline" size="sm">
                  Download {options.functionComponent ? 'JSX' : 'File'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="jsxOutput">Converted JSX:</Label>
                <textarea 
                  id="jsxOutput"
                  value={jsxOutput}
                  readOnly
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
                />
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Key Conversions Applied:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <code>class</code> → <code>className</code></li>
                  <li>• <code>for</code> → <code>htmlFor</code></li>
                  <li>• <code>style="..."</code> → <code>style={`{...}`}</code></li>
                  <li>• Self-closing tags: <code>&lt;input&gt;</code> → <code>&lt;input /&gt;</code></li>
                  <li>• HTML comments → JSX comments <code>{`{/* ... */}`}</code></li>
                  <li>• Hyphenated attributes → camelCase</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}