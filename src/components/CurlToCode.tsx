import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Language = 'javascript' | 'python' | 'php' | 'go' | 'java' | 'csharp' | 'ruby' | 'node-fetch';

interface CurlRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: string;
  auth?: { username: string; password: string };
  cookies?: string;
  followRedirects?: boolean;
  insecure?: boolean;
  timeout?: number;
}

export default function CurlToCode() {
  const [inputCurl, setInputCurl] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');

  const parseCurlCommand = (curlCmd: string): CurlRequest => {
    // Remove 'curl' from the beginning and clean up
    let cmd = curlCmd.trim();
    if (cmd.startsWith('curl ')) {
      cmd = cmd.substring(5);
    }

    const request: CurlRequest = {
      method: 'GET',
      url: '',
      headers: {}
    };

    // Split command into tokens, handling quoted strings
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < cmd.length; i++) {
      const char = cmd[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else if (!inQuotes && char === ' ') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      tokens.push(current.trim());
    }

    // Parse tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (token === '-X' || token === '--request') {
        request.method = tokens[++i]?.toUpperCase() || 'GET';
      } else if (token === '-H' || token === '--header') {
        const header = tokens[++i];
        if (header) {
          const [key, ...valueParts] = header.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            request.headers[key.trim()] = value.replace(/^["']|["']$/g, '');
          }
        }
      } else if (token === '-d' || token === '--data' || token === '--data-raw') {
        request.data = tokens[++i]?.replace(/^["']|["']$/g, '');
        if (request.method === 'GET') {
          request.method = 'POST';
        }
      } else if (token === '-u' || token === '--user') {
        const auth = tokens[++i];
        if (auth) {
          const [username, password] = auth.split(':');
          request.auth = { username, password: password || '' };
        }
      } else if (token === '-b' || token === '--cookie') {
        request.cookies = tokens[++i]?.replace(/^["']|["']$/g, '');
      } else if (token === '-L' || token === '--location') {
        request.followRedirects = true;
      } else if (token === '-k' || token === '--insecure') {
        request.insecure = true;
      } else if (token === '--connect-timeout') {
        request.timeout = parseInt(tokens[++i]) || 30;
      } else if (token.startsWith('http://') || token.startsWith('https://')) {
        request.url = token.replace(/^["']|["']$/g, '');
      }
    }

    return request;
  };

  const generateJavaScriptCode = (req: CurlRequest): string => {
    let code = `// JavaScript (Fetch API)\n`;
    
    // Build fetch options
    const options: string[] = [];
    options.push(`method: '${req.method}'`);
    
    // Headers
    if (Object.keys(req.headers).length > 0) {
      const headers = Object.entries(req.headers)
        .map(([key, value]) => `    '${key}': '${value}'`)
        .join(',\n');
      options.push(`headers: {\n${headers}\n  }`);
    }
    
    // Body data
    if (req.data) {
      // Check if data is JSON
      try {
        JSON.parse(req.data);
        options.push(`body: JSON.stringify(${req.data})`);
      } catch {
        options.push(`body: '${req.data}'`);
      }
    }
    
    // Auth (Basic)
    if (req.auth) {
      const authString = btoa(`${req.auth.username}:${req.auth.password}`);
      if (options.find(opt => opt.includes('headers'))) {
        // Add to existing headers
        const headerIndex = options.findIndex(opt => opt.includes('headers'));
        options[headerIndex] = options[headerIndex].replace(
          '\n  }',
          `,\n    'Authorization': 'Basic ${authString}'\n  }`
        );
      } else {
        options.push(`headers: {\n    'Authorization': 'Basic ${authString}'\n  }`);
      }
    }
    
    code += `const response = await fetch('${req.url}', {\n`;
    code += `  ${options.join(',\n  ')}\n`;
    code += `});\n\n`;
    code += `const data = await response.json();\n`;
    code += `console.log(data);`;
    
    return code;
  };

  const generateNodeFetchCode = (req: CurlRequest): string => {
    let code = `// Node.js (node-fetch)\n`;
    code += `const fetch = require('node-fetch');\n\n`;
    
    return generateJavaScriptCode(req).replace('// JavaScript (Fetch API)', '');
  };

  const generatePythonCode = (req: CurlRequest): string => {
    let code = `# Python (requests)\nimport requests\n`;
    if (req.data) {
      code += `import json\n`;
    }
    code += `\n`;
    
    // URL
    code += `url = '${req.url}'\n`;
    
    // Headers
    if (Object.keys(req.headers).length > 0) {
      code += `headers = {\n`;
      Object.entries(req.headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += `}\n`;
    }
    
    // Data
    if (req.data) {
      try {
        JSON.parse(req.data);
        code += `data = ${req.data}\n`;
      } catch {
        code += `data = '${req.data}'\n`;
      }
    }
    
    // Auth
    if (req.auth) {
      code += `auth = ('${req.auth.username}', '${req.auth.password}')\n`;
    }
    
    code += `\n`;
    
    // Request
    const params: string[] = [`url`];
    if (Object.keys(req.headers).length > 0) params.push('headers=headers');
    if (req.data) params.push('json=data' + (req.data.startsWith('{') ? '' : ', data=data'));
    if (req.auth) params.push('auth=auth');
    if (req.followRedirects === false) params.push('allow_redirects=False');
    if (req.insecure) params.push('verify=False');
    if (req.timeout) params.push(`timeout=${req.timeout}`);
    
    code += `response = requests.${req.method.toLowerCase()}(${params.join(', ')})\n`;
    code += `print(response.json())`;
    
    return code;
  };

  const generatePhpCode = (req: CurlRequest): string => {
    let code = `<?php\n// PHP (cURL)\n\n`;
    
    code += `$ch = curl_init();\n\n`;
    code += `curl_setopt($ch, CURLOPT_URL, '${req.url}');\n`;
    code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
    
    if (req.method !== 'GET') {
      code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${req.method}');\n`;
    }
    
    // Headers
    if (Object.keys(req.headers).length > 0 || req.auth) {
      code += `\n$headers = [\n`;
      Object.entries(req.headers).forEach(([key, value]) => {
        code += `    '${key}: ${value}',\n`;
      });
      
      if (req.auth) {
        const authString = btoa(`${req.auth.username}:${req.auth.password}`);
        code += `    'Authorization: Basic ${authString}',\n`;
      }
      
      code += `];\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
    }
    
    // Data
    if (req.data) {
      code += `\n$data = '${req.data}';\n`;
      code += `curl_setopt($ch, CURLOPT_POSTFIELDS, $data);\n`;
    }
    
    // Other options
    if (req.followRedirects) {
      code += `curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);\n`;
    }
    
    if (req.insecure) {
      code += `curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);\n`;
    }
    
    if (req.timeout) {
      code += `curl_setopt($ch, CURLOPT_TIMEOUT, ${req.timeout});\n`;
    }
    
    code += `\n$response = curl_exec($ch);\n`;
    code += `curl_close($ch);\n\n`;
    code += `echo $response;\n`;
    
    return code;
  };

  const generateGoCode = (req: CurlRequest): string => {
    let code = `// Go\npackage main\n\nimport (\n    "fmt"\n    "io"\n    "net/http"\n`;
    
    if (req.data) {
      code += `    "strings"\n`;
    }
    
    code += `)\n\nfunc main() {\n`;
    
    // Create request
    if (req.data) {
      code += `    payload := strings.NewReader(\`${req.data}\`)\n`;
      code += `    req, err := http.NewRequest("${req.method}", "${req.url}", payload)\n`;
    } else {
      code += `    req, err := http.NewRequest("${req.method}", "${req.url}", nil)\n`;
    }
    
    code += `    if err != nil {\n        panic(err)\n    }\n\n`;
    
    // Headers
    if (Object.keys(req.headers).length > 0) {
      Object.entries(req.headers).forEach(([key, value]) => {
        code += `    req.Header.Add("${key}", "${value}")\n`;
      });
      code += `\n`;
    }
    
    // Auth
    if (req.auth) {
      code += `    req.SetBasicAuth("${req.auth.username}", "${req.auth.password}")\n\n`;
    }
    
    // Execute request
    code += `    client := &http.Client{}\n`;
    code += `    resp, err := client.Do(req)\n`;
    code += `    if err != nil {\n        panic(err)\n    }\n`;
    code += `    defer resp.Body.Close()\n\n`;
    code += `    body, err := io.ReadAll(resp.Body)\n`;
    code += `    if err != nil {\n        panic(err)\n    }\n\n`;
    code += `    fmt.Println(string(body))\n`;
    code += `}`;
    
    return code;
  };

  const generateJavaCode = (req: CurlRequest): string => {
    let code = `// Java (OkHttp)\nimport okhttp3.*;\nimport java.io.IOException;\n\n`;
    code += `public class ApiClient {\n    public static void main(String[] args) throws IOException {\n`;
    code += `        OkHttpClient client = new OkHttpClient();\n\n`;
    
    // Request body
    if (req.data) {
      code += `        RequestBody body = RequestBody.create(\n`;
      code += `            "${req.data}",\n`;
      code += `            MediaType.get("application/json; charset=utf-8")\n`;
      code += `        );\n\n`;
    }
    
    // Build request
    code += `        Request request = new Request.Builder()\n`;
    code += `            .url("${req.url}")\n`;
    
    if (req.method !== 'GET') {
      if (req.data) {
        code += `            .${req.method.toLowerCase()}(body)\n`;
      } else {
        code += `            .${req.method.toLowerCase()}(RequestBody.create("", null))\n`;
      }
    }
    
    // Headers
    Object.entries(req.headers).forEach(([key, value]) => {
      code += `            .addHeader("${key}", "${value}")\n`;
    });
    
    // Auth
    if (req.auth) {
      const authString = btoa(`${req.auth.username}:${req.auth.password}`);
      code += `            .addHeader("Authorization", "Basic ${authString}")\n`;
    }
    
    code += `            .build();\n\n`;
    code += `        try (Response response = client.newCall(request).execute()) {\n`;
    code += `            System.out.println(response.body().string());\n`;
    code += `        }\n    }\n}`;
    
    return code;
  };

  const generateCSharpCode = (req: CurlRequest): string => {
    let code = `// C#\nusing System;\nusing System.Net.Http;\nusing System.Text;\nusing System.Threading.Tasks;\n\n`;
    code += `class Program\n{\n    static async Task Main(string[] args)\n    {\n`;
    code += `        using var client = new HttpClient();\n\n`;
    
    // Headers
    Object.entries(req.headers).forEach(([key, value]) => {
      code += `        client.DefaultRequestHeaders.Add("${key}", "${value}");\n`;
    });
    
    // Auth
    if (req.auth) {
      const authString = btoa(`${req.auth.username}:${req.auth.password}`);
      code += `        client.DefaultRequestHeaders.Add("Authorization", "Basic ${authString}");\n`;
    }
    
    if (Object.keys(req.headers).length > 0 || req.auth) {
      code += `\n`;
    }
    
    // Request
    if (req.data) {
      code += `        var content = new StringContent("${req.data}", Encoding.UTF8, "application/json");\n`;
      code += `        var response = await client.${req.method === 'POST' ? 'PostAsync' : req.method.toLowerCase() + 'Async'}("${req.url}"${req.method === 'POST' ? ', content' : ''});\n`;
    } else {
      code += `        var response = await client.${req.method === 'GET' ? 'GetAsync' : req.method.toLowerCase() + 'Async'}("${req.url}");\n`;
    }
    
    code += `        var result = await response.Content.ReadAsStringAsync();\n`;
    code += `        Console.WriteLine(result);\n    }\n}`;
    
    return code;
  };

  const generateRubyCode = (req: CurlRequest): string => {
    let code = `# Ruby\nrequire 'net/http'\nrequire 'json'\n\n`;
    
    code += `uri = URI('${req.url}')\n`;
    code += `http = Net::HTTP.new(uri.host, uri.port)\n`;
    
    if (req.url.startsWith('https://')) {
      code += `http.use_ssl = true\n`;
    }
    
    if (req.insecure) {
      code += `http.verify_mode = OpenSSL::SSL::VERIFY_NONE\n`;
    }
    
    code += `\n`;
    
    // Request
    const method = req.method === 'GET' ? 'Net::HTTP::Get' : `Net::HTTP::${req.method.charAt(0) + req.method.slice(1).toLowerCase()}`;
    code += `request = ${method}.new(uri)\n`;
    
    // Headers
    Object.entries(req.headers).forEach(([key, value]) => {
      code += `request['${key}'] = '${value}'\n`;
    });
    
    // Auth
    if (req.auth) {
      code += `request.basic_auth('${req.auth.username}', '${req.auth.password}')\n`;
    }
    
    // Data
    if (req.data) {
      code += `request.body = '${req.data}'\n`;
    }
    
    code += `\nresponse = http.request(request)\nputs response.body`;
    
    return code;
  };

  const generateCode = (request: CurlRequest): string => {
    switch (selectedLanguage) {
      case 'javascript':
        return generateJavaScriptCode(request);
      case 'node-fetch':
        return generateNodeFetchCode(request);
      case 'python':
        return generatePythonCode(request);
      case 'php':
        return generatePhpCode(request);
      case 'go':
        return generateGoCode(request);
      case 'java':
        return generateJavaCode(request);
      case 'csharp':
        return generateCSharpCode(request);
      case 'ruby':
        return generateRubyCode(request);
      default:
        return '';
    }
  };

  const convertCurlToCode = () => {
    try {
      if (!inputCurl.trim()) {
        setCodeOutput('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      if (!inputCurl.includes('curl') && !inputCurl.includes('http')) {
        throw new Error('Input does not appear to be a valid cURL command');
      }

      const request = parseCurlCommand(inputCurl);
      
      if (!request.url) {
        throw new Error('Could not extract URL from cURL command');
      }

      const code = generateCode(request);
      setCodeOutput(code);
      setIsValid(true);
      setErrorMessage(`✅ Successfully converted cURL to ${selectedLanguage} code`);
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`❌ Error converting cURL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCodeOutput('');
    }
  };

  const clearAll = () => {
    setInputCurl('');
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
      javascript: 'js',
      'node-fetch': 'js',
      python: 'py',
      php: 'php',
      go: 'go',
      java: 'java',
      csharp: 'cs',
      ruby: 'rb'
    };
    return extensions[selectedLanguage];
  };

  const downloadCode = () => {
    if (codeOutput) {
      const extension = getFileExtension();
      const filename = `api_client.${extension}`;
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

  const loadGetExample = () => {
    const example = `curl -X GET "https://api.example.com/users" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer your-token-here"`;
    setInputCurl(example);
  };

  const loadPostExample = () => {
    const example = `curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-token-here" \\
  -d '{"name":"John Doe","email":"john@example.com","age":30}'`;
    setInputCurl(example);
  };

  const loadAuthExample = () => {
    const example = `curl -X GET "https://api.example.com/protected" \\
  -u "username:password" \\
  -H "Accept: application/json" \\
  -k \\
  -L`;
    setInputCurl(example);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">cURL to Code</h1>
        <p className="text-muted-foreground">Convert cURL commands to code in various programming languages</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>cURL Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputCurl">Paste your cURL command here:</Label>
                <textarea 
                  id="inputCurl"
                  value={inputCurl}
                  onChange={(e) => setInputCurl(e.target.value)}
                  rows={8}
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token"'
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Target Language:</Label>
                <select 
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="javascript">JavaScript (Fetch)</option>
                  <option value="node-fetch">Node.js (node-fetch)</option>
                  <option value="python">Python (requests)</option>
                  <option value="php">PHP (cURL)</option>
                  <option value="go">Go</option>
                  <option value="java">Java (OkHttp)</option>
                  <option value="csharp">C# (HttpClient)</option>
                  <option value="ruby">Ruby</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertCurlToCode} className="flex-1">
                  Convert to Code
                </Button>
                <Button onClick={loadGetExample} variant="outline">
                  GET Example
                </Button>
                <Button onClick={loadPostExample} variant="outline">
                  POST Example
                </Button>
                <Button onClick={loadAuthExample} variant="outline">
                  Auth Example
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
              <CardTitle>Generated {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Code</CardTitle>
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
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Supported cURL Options:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <code>-X</code>, <code>--request</code> - HTTP method</li>
                  <li>• <code>-H</code>, <code>--header</code> - Headers</li>
                  <li>• <code>-d</code>, <code>--data</code> - Request body data</li>
                  <li>• <code>-u</code>, <code>--user</code> - Basic authentication</li>
                  <li>• <code>-b</code>, <code>--cookie</code> - Cookies</li>
                  <li>• <code>-L</code>, <code>--location</code> - Follow redirects</li>
                  <li>• <code>-k</code>, <code>--insecure</code> - Allow insecure SSL</li>
                  <li>• <code>--connect-timeout</code> - Connection timeout</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}