import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp' | 'go' | 'rust' | 'php';

interface CodeGeneratorOptions {
  language: Language;
  rootClassName: string;
  useInterfaces: boolean;
  addJsonAnnotations: boolean;
  makeFieldsOptional: boolean;
  generateConstructor: boolean;
  addGettersSetters: boolean;
}

export default function JsonToCode() {
  const [inputJson, setInputJson] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [options, setOptions] = useState<CodeGeneratorOptions>({
    language: 'typescript',
    rootClassName: 'RootObject',
    useInterfaces: true,
    addJsonAnnotations: false,
    makeFieldsOptional: false,
    generateConstructor: false,
    addGettersSetters: false
  });

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const toPascalCase = (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^[a-z]/, (c) => c.toUpperCase());
  };

  const toCamelCase = (str: string): string => {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  };

  const toSnakeCase = (str: string): string => {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/[-\s]+/g, '_');
  };

  const getTypeFromValue = (value: any, key: string = ''): { type: string; className?: string } => {
    if (value === null) {
      return { type: 'any' };
    }

    if (typeof value === 'boolean') {
      return { type: 'boolean' };
    }

    if (typeof value === 'number') {
      return { type: Number.isInteger(value) ? 'number' : 'number' };
    }

    if (typeof value === 'string') {
      return { type: 'string' };
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { type: 'any[]' };
      }
      const firstElement = value[0];
      const elementType = getTypeFromValue(firstElement);
      return { type: `${elementType.type}[]`, className: elementType.className };
    }

    if (typeof value === 'object') {
      const className = key ? toPascalCase(key) : 'NestedObject';
      return { type: className, className };
    }

    return { type: 'any' };
  };

  const generateTypeScriptInterface = (obj: any, className: string): string => {
    let code = `interface ${className} {\n`;
    
    Object.entries(obj).forEach(([key, value]) => {
      const { type } = getTypeFromValue(value, key);
      const optional = options.makeFieldsOptional ? '?' : '';
      code += `  ${key}${optional}: ${type};\n`;
    });
    
    code += '}\n\n';
    return code;
  };

  const generateTypeScriptClass = (obj: any, className: string): string => {
    let code = `class ${className} {\n`;
    
    // Properties
    Object.entries(obj).forEach(([key, value]) => {
      const { type } = getTypeFromValue(value, key);
      const optional = options.makeFieldsOptional ? '?' : '';
      code += `  ${key}${optional}: ${type};\n`;
    });
    
    if (options.generateConstructor) {
      code += '\n  constructor(';
      const params = Object.entries(obj).map(([key, value]) => {
        const { type } = getTypeFromValue(value, key);
        const optional = options.makeFieldsOptional ? '?' : '';
        return `${key}${optional}: ${type}`;
      });
      code += params.join(', ');
      code += ') {\n';
      
      Object.keys(obj).forEach(key => {
        code += `    this.${key} = ${key};\n`;
      });
      code += '  }\n';
    }
    
    code += '}\n\n';
    return code;
  };

  const generateJavaScriptClass = (obj: any, className: string): string => {
    let code = `class ${className} {\n`;
    
    if (options.generateConstructor) {
      const params = Object.keys(obj);
      code += `  constructor(${params.join(', ')}) {\n`;
      params.forEach(key => {
        code += `    this.${key} = ${key};\n`;
      });
      code += '  }\n\n';
    }

    if (options.addGettersSetters) {
      Object.keys(obj).forEach(key => {
        const pascalKey = toPascalCase(key);
        code += `  get${pascalKey}() {\n    return this.${key};\n  }\n\n`;
        code += `  set${pascalKey}(value) {\n    this.${key} = value;\n  }\n\n`;
      });
    }
    
    code += '}\n\n';
    return code;
  };

  const generatePythonClass = (obj: any, className: string): string => {
    let code = `class ${className}:\n`;
    
    if (options.generateConstructor) {
      code += '    def __init__(self';
      Object.keys(obj).forEach(key => {
        const snakeKey = toSnakeCase(key);
        code += `, ${snakeKey}`;
      });
      code += '):\n';
      
      Object.keys(obj).forEach(key => {
        const snakeKey = toSnakeCase(key);
        code += `        self.${snakeKey} = ${snakeKey}\n`;
      });
    } else {
      code += '    pass\n';
    }
    
    code += '\n';
    return code;
  };

  const generateJavaClass = (obj: any, className: string): string => {
    let code = '';
    
    if (options.addJsonAnnotations) {
      code += 'import com.fasterxml.jackson.annotation.JsonProperty;\n\n';
    }
    
    code += `public class ${className} {\n`;
    
    // Fields
    Object.entries(obj).forEach(([key, value]) => {
      const { type } = getJavaType(value);
      if (options.addJsonAnnotations) {
        code += `    @JsonProperty("${key}")\n`;
      }
      code += `    private ${type} ${toCamelCase(key)};\n`;
    });
    
    code += '\n';
    
    // Constructor
    if (options.generateConstructor) {
      code += `    public ${className}() {}\n\n`;
      code += `    public ${className}(`;
      const params = Object.entries(obj).map(([key, value]) => {
        const { type } = getJavaType(value);
        return `${type} ${toCamelCase(key)}`;
      });
      code += params.join(', ');
      code += ') {\n';
      
      Object.keys(obj).forEach(key => {
        const camelKey = toCamelCase(key);
        code += `        this.${camelKey} = ${camelKey};\n`;
      });
      code += '    }\n\n';
    }
    
    // Getters and Setters
    if (options.addGettersSetters) {
      Object.entries(obj).forEach(([key, value]) => {
        const { type } = getJavaType(value);
        const camelKey = toCamelCase(key);
        const pascalKey = toPascalCase(key);
        
        code += `    public ${type} get${pascalKey}() {\n        return ${camelKey};\n    }\n\n`;
        code += `    public void set${pascalKey}(${type} ${camelKey}) {\n        this.${camelKey} = ${camelKey};\n    }\n\n`;
      });
    }
    
    code += '}\n\n';
    return code;
  };

  const generateCSharpClass = (obj: any, className: string): string => {
    let code = '';
    
    if (options.addJsonAnnotations) {
      code += 'using Newtonsoft.Json;\n\n';
    }
    
    code += `public class ${className}\n{\n`;
    
    Object.entries(obj).forEach(([key, value]) => {
      const { type } = getCSharpType(value);
      if (options.addJsonAnnotations) {
        code += `    [JsonProperty("${key}")]\n`;
      }
      code += `    public ${type} ${toPascalCase(key)} { get; set; }\n`;
    });
    
    code += '}\n\n';
    return code;
  };

  const generateGoStruct = (obj: any, className: string): string => {
    let code = `type ${className} struct {\n`;
    
    Object.entries(obj).forEach(([key, value]) => {
      const { type } = getGoType(value);
      const fieldName = toPascalCase(key);
      let tags = '';
      
      if (options.addJsonAnnotations) {
        tags = ` \`json:"${key}"\``;
      }
      
      code += `    ${fieldName} ${type}${tags}\n`;
    });
    
    code += '}\n\n';
    return code;
  };

  const generateRustStruct = (obj: any, className: string): string => {
    let code = '';
    
    if (options.addJsonAnnotations) {
      code += 'use serde::{Deserialize, Serialize};\n\n';
      code += '#[derive(Serialize, Deserialize)]\n';
    }
    
    code += `struct ${className} {\n`;
    
    Object.entries(obj).forEach(([key, value]) => {
      const { type } = getRustType(value);
      if (options.addJsonAnnotations) {
        code += `    #[serde(rename = "${key}")]\n`;
      }
      code += `    ${toSnakeCase(key)}: ${type},\n`;
    });
    
    code += '}\n\n';
    return code;
  };

  const generatePhpClass = (obj: any, className: string): string => {
    let code = '<?php\n\n';
    
    code += `class ${className}\n{\n`;
    
    // Properties
    Object.keys(obj).forEach(key => {
      const camelKey = toCamelCase(key);
      if (options.addJsonAnnotations) {
        code += `    /**\n     * @var mixed\n     */\n`;
      }
      code += `    public $${camelKey};\n`;
    });
    
    code += '\n';
    
    // Constructor
    if (options.generateConstructor) {
      code += '    public function __construct(';
      const params = Object.keys(obj).map(key => {
        const camelKey = toCamelCase(key);
        return `$${camelKey} = null`;
      });
      code += params.join(', ');
      code += ')\n    {\n';
      
      Object.keys(obj).forEach(key => {
        const camelKey = toCamelCase(key);
        code += `        $this->${camelKey} = $${camelKey};\n`;
      });
      code += '    }\n\n';
    }
    
    // Getters and Setters
    if (options.addGettersSetters) {
      Object.keys(obj).forEach(key => {
        const camelKey = toCamelCase(key);
        const pascalKey = toPascalCase(key);
        
        code += `    public function get${pascalKey}()\n    {\n        return $this->${camelKey};\n    }\n\n`;
        code += `    public function set${pascalKey}($${camelKey})\n    {\n        $this->${camelKey} = $${camelKey};\n    }\n\n`;
      });
    }
    
    // JSON serialization methods
    if (options.addJsonAnnotations) {
      code += '    public function toArray()\n    {\n        return [\n';
      Object.keys(obj).forEach(key => {
        const camelKey = toCamelCase(key);
        code += `            '${key}' => $this->${camelKey},\n`;
      });
      code += '        ];\n    }\n\n';
      
      code += '    public function toJson()\n    {\n        return json_encode($this->toArray());\n    }\n\n';
      
      code += '    public static function fromArray(array $data)\n    {\n';
      code += `        $instance = new self();\n`;
      Object.keys(obj).forEach(key => {
        const camelKey = toCamelCase(key);
        code += `        $instance->${camelKey} = $data['${key}'] ?? null;\n`;
      });
      code += '        return $instance;\n    }\n\n';
      
      code += '    public static function fromJson(string $json)\n    {\n';
      code += '        $data = json_decode($json, true);\n';
      code += '        return self::fromArray($data);\n    }\n';
    }
    
    code += '}\n';
    return code;
  };

  const getJavaType = (value: any): { type: string } => {
    if (value === null) return { type: 'Object' };
    if (typeof value === 'boolean') return { type: 'boolean' };
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { type: 'int' } : { type: 'double' };
    }
    if (typeof value === 'string') return { type: 'String' };
    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'List<Object>' };
      const elementType = getJavaType(value[0]);
      return { type: `List<${elementType.type}>` };
    }
    return { type: 'Object' };
  };

  const getCSharpType = (value: any): { type: string } => {
    if (value === null) return { type: 'object' };
    if (typeof value === 'boolean') return { type: 'bool' };
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { type: 'int' } : { type: 'double' };
    }
    if (typeof value === 'string') return { type: 'string' };
    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'List<object>' };
      const elementType = getCSharpType(value[0]);
      return { type: `List<${elementType.type}>` };
    }
    return { type: 'object' };
  };

  const getGoType = (value: any): { type: string } => {
    if (value === null) return { type: 'interface{}' };
    if (typeof value === 'boolean') return { type: 'bool' };
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { type: 'int' } : { type: 'float64' };
    }
    if (typeof value === 'string') return { type: 'string' };
    if (Array.isArray(value)) {
      if (value.length === 0) return { type: '[]interface{}' };
      const elementType = getGoType(value[0]);
      return { type: `[]${elementType.type}` };
    }
    return { type: 'interface{}' };
  };

  const getRustType = (value: any): { type: string } => {
    if (value === null) return { type: 'Option<String>' };
    if (typeof value === 'boolean') return { type: 'bool' };
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { type: 'i32' } : { type: 'f64' };
    }
    if (typeof value === 'string') return { type: 'String' };
    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'Vec<String>' };
      const elementType = getRustType(value[0]);
      return { type: `Vec<${elementType.type}>` };
    }
    return { type: 'String' };
  };

  const generateCode = (data: any): string => {
    let code = '';
    
    switch (options.language) {
      case 'typescript':
        if (options.useInterfaces) {
          code = generateTypeScriptInterface(data, options.rootClassName);
        } else {
          code = generateTypeScriptClass(data, options.rootClassName);
        }
        break;
      case 'javascript':
        code = generateJavaScriptClass(data, options.rootClassName);
        break;
      case 'python':
        code = generatePythonClass(data, options.rootClassName);
        break;
      case 'java':
        code = generateJavaClass(data, options.rootClassName);
        break;
      case 'csharp':
        code = generateCSharpClass(data, options.rootClassName);
        break;
      case 'go':
        code = generateGoStruct(data, options.rootClassName);
        break;
      case 'rust':
        code = generateRustStruct(data, options.rootClassName);
        break;
      case 'php':
        code = generatePhpClass(data, options.rootClassName);
        break;
    }
    
    return code;
  };

  const convertJsonToCode = () => {
    try {
      if (!inputJson.trim()) {
        setCodeOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      const parsed = JSON.parse(inputJson);
      
      // Handle array at root level
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          throw new Error('Cannot generate code from empty array');
        }
        // Use first element as template
        const code = generateCode(parsed[0]);
        setCodeOutput(code);
      } else {
        const code = generateCode(parsed);
        setCodeOutput(code);
      }
      
      setIsValid(true);
      setErrorMessage(`✅ Successfully generated ${options.language} code`);
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCodeOutput('');
    }
  };

  const clearAll = () => {
    setInputJson('');
    setCodeOutput('');
    setIsValid(true);
    setErrorMessage('');
  };

  const copyToClipboard = async () => {
    if (codeOutput) {
      try {
        await navigator.clipboard.writeText(codeOutput);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const getFileExtension = (): string => {
    const extensions: Record<Language, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php'
    };
    return extensions[options.language];
  };

  const downloadCode = () => {
    if (codeOutput) {
      const extension = getFileExtension();
      const filename = `${options.rootClassName}.${extension}`;
      const blob = new Blob([codeOutput], { type: 'text/plain;charset=utf-8;' });
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
    const example = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "active": true,
  "age": 30
}`;
    setInputJson(example);
  };

  const loadComplexExample = () => {
    const example = `{
  "user": {
    "id": 123,
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "avatar": "https://example.com/avatar.jpg"
    },
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    },
    "roles": ["admin", "user"],
    "metadata": {
      "lastLogin": "2024-01-15T10:30:00Z",
      "loginCount": 42
    }
  },
  "permissions": ["read", "write", "delete"],
  "settings": {
    "apiVersion": "v2",
    "rateLimit": 1000
  }
}`;
    setInputJson(example);
  };

  const loadArrayExample = () => {
    const example = `[
  {
    "id": 1,
    "title": "Task 1",
    "completed": false,
    "tags": ["work", "urgent"],
    "assignee": {
      "name": "Alice",
      "email": "alice@example.com"
    }
  },
  {
    "id": 2,
    "title": "Task 2", 
    "completed": true,
    "tags": ["personal"],
    "assignee": null
  }
]`;
    setInputJson(example);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JSON to Code</h1>
        <p className="text-muted-foreground">Generate data models and classes from JSON in multiple programming languages</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>JSON Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputJson">Paste your JSON here:</Label>
                <textarea 
                  id="inputJson"
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='{"name": "John", "age": 30, "active": true}'
                />
              </div>
              
              {/* Configuration Options */}
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Code Generation Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language:</Label>
                      <select 
                        id="language"
                        value={options.language}
                        onChange={(e) => setOptions({...options, language: e.target.value as Language})}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="php">PHP</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rootClassName">Root Class Name:</Label>
                      <input 
                        id="rootClassName"
                        type="text"
                        value={options.rootClassName}
                        onChange={(e) => setOptions({...options, rootClassName: e.target.value})}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="RootObject"
                      />
                    </div>

                    {options.language === 'typescript' && (
                      <div className="flex items-center space-x-2">
                        <input 
                          id="useInterfaces"
                          type="checkbox"
                          checked={options.useInterfaces}
                          onChange={(e) => setOptions({...options, useInterfaces: e.target.checked})}
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                        />
                        <Label htmlFor="useInterfaces">Use interfaces (vs classes)</Label>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        id="makeFieldsOptional"
                        type="checkbox"
                        checked={options.makeFieldsOptional}
                        onChange={(e) => setOptions({...options, makeFieldsOptional: e.target.checked})}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="makeFieldsOptional">Make fields optional</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        id="generateConstructor"
                        type="checkbox"
                        checked={options.generateConstructor}
                        onChange={(e) => setOptions({...options, generateConstructor: e.target.checked})}
                        disabled={options.language === 'typescript' && options.useInterfaces}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                      />
                      <Label htmlFor="generateConstructor">Generate constructor</Label>
                    </div>
                    
                    {['java', 'csharp', 'go', 'rust', 'php'].includes(options.language) && (
                      <div className="flex items-center space-x-2">
                        <input 
                          id="addJsonAnnotations"
                          type="checkbox"
                          checked={options.addJsonAnnotations}
                          onChange={(e) => setOptions({...options, addJsonAnnotations: e.target.checked})}
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                        />
                        <Label htmlFor="addJsonAnnotations">
                          {options.language === 'php' ? 'Add JSON methods' : 'Add JSON annotations'}
                        </Label>
                      </div>
                    )}
                    
                    {['java', 'javascript', 'php'].includes(options.language) && (
                      <div className="flex items-center space-x-2">
                        <input 
                          id="addGettersSetters"
                          type="checkbox"
                          checked={options.addGettersSetters}
                          onChange={(e) => setOptions({...options, addGettersSetters: e.target.checked})}
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-primary"
                        />
                        <Label htmlFor="addGettersSetters">Add getters/setters</Label>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertJsonToCode} className="flex-1">
                  Generate Code
                </Button>
                <Button onClick={loadSimpleExample} variant="outline">
                  Simple Example
                </Button>
                <Button onClick={loadComplexExample} variant="outline">
                  Complex Example
                </Button>
                <Button onClick={loadArrayExample} variant="outline">
                  Array Example
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

        {codeOutput && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated {capitalizeFirstLetter(options.language)} Code</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadCode} variant="outline" size="sm">
                  Download .{getFileExtension()}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="codeOutput">Generated Code:</Label>
                <textarea 
                  id="codeOutput"
                  value={codeOutput}
                  readOnly
                  rows={16}
                  className="flex min-h-[400px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}