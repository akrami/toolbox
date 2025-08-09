import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SqlFormatter() {
  const [inputSql, setInputSql] = useState('');
  const [formattedSql, setFormattedSql] = useState('');
  const [message, setMessage] = useState('');

  const formatSql = () => {
    if (!inputSql.trim()) {
      setFormattedSql('');
      setMessage('');
      return;
    }

    try {
      let formatted = inputSql
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // Add line breaks for major SQL keywords
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT',
        'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
        'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW', 'DROP VIEW',
        'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
        'ON', 'USING'
      ];

      // Replace keywords with line breaks
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${keyword}`);
      });

      // Handle special cases
      formatted = formatted
        .replace(/,/g, ',\n  ')
        .replace(/\(\s*/g, '(\n  ')
        .replace(/\s*\)/g, '\n)')
        .replace(/\bAND\b/gi, '\n  AND')
        .replace(/\bOR\b/gi, '\n  OR')
        .replace(/\bCASE\b/gi, '\nCASE')
        .replace(/\bWHEN\b/gi, '\n  WHEN')
        .replace(/\bTHEN\b/gi, ' THEN')
        .replace(/\bELSE\b/gi, '\n  ELSE')
        .replace(/\bEND\b/gi, '\nEND')
        .replace(/\bBETWEEN\b/gi, '\n  BETWEEN')
        .replace(/\bIN\s*\(/gi, ' IN (\n    ')
        .replace(/\bEXISTS\s*\(/gi, ' EXISTS (\n    ')
        .replace(/;/g, ';\n');

      // Clean up extra whitespace and indentation
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentSize = 2;

      const beautified = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        // Decrease indent for closing parentheses and END statements
        if (trimmed.startsWith(')') || trimmed.toUpperCase().startsWith('END')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        let currentIndent = indentLevel;

        // Special indentation for certain keywords
        if (trimmed.toUpperCase().match(/^(AND|OR|WHEN|ELSE|BETWEEN)(\s|$)/)) {
          currentIndent = Math.max(0, indentLevel - 1);
        }

        const indentedLine = ' '.repeat(currentIndent * indentSize) + trimmed;

        // Increase indent for opening parentheses and CASE statements
        if (trimmed.endsWith('(') || trimmed.toUpperCase().startsWith('CASE')) {
          indentLevel++;
        }

        return indentedLine;
      }).filter(line => line.trim() !== '').join('\n');

      // Final cleanup
      const finalFormatted = beautified
        .replace(/\n\s*\n/g, '\n')
        .replace(/,\n\s*\)/g, '\n)')
        .replace(/\(\n\s*\)/g, '()')
        .trim();

      setFormattedSql(finalFormatted);
      setMessage('✅ SQL formatted successfully');
    } catch (error) {
      setMessage(`❌ Error formatting SQL: ${error.message}`);
      setFormattedSql('');
    }
  };

  const minifySql = () => {
    if (!inputSql.trim()) {
      setFormattedSql('');
      setMessage('');
      return;
    }

    try {
      const minified = inputSql
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*=\s*/g, '=')
        .replace(/\s*<\s*/g, '<')
        .replace(/\s*>\s*/g, '>')
        .replace(/\s*<=\s*/g, '<=')
        .replace(/\s*>=\s*/g, '>=')
        .replace(/\s*<>\s*/g, '<>')
        .replace(/\s*!=\s*/g, '!=')
        .replace(/;\s*/g, ';')
        .trim();

      setFormattedSql(minified);
      setMessage('✅ SQL minified successfully');
    } catch (error) {
      setMessage(`❌ Error minifying SQL: ${error.message}`);
      setFormattedSql('');
    }
  };

  const validateSql = () => {
    if (!inputSql.trim()) {
      setMessage('');
      return;
    }

    try {
      const sql = inputSql.toUpperCase();
      const parenCount = (inputSql.match(/\(/g) || []).length - (inputSql.match(/\)/g) || []).length;
      const quoteCount = (inputSql.match(/'/g) || []).length % 2;
      const doubleQuoteCount = (inputSql.match(/"/g) || []).length % 2;

      // Basic syntax checks
      const hasValidKeywords = sql.match(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/);
      const hasUnterminatedStrings = quoteCount !== 0 || doubleQuoteCount !== 0;
      const hasMismatchedParens = parenCount !== 0;

      if (!hasValidKeywords) {
        setMessage('⚠️ SQL may be missing main keywords (SELECT, INSERT, etc.)');
      } else if (hasMismatchedParens) {
        setMessage('⚠️ SQL has mismatched parentheses');
      } else if (hasUnterminatedStrings) {
        setMessage('⚠️ SQL may have unterminated string literals');
      } else {
        setMessage('✅ SQL structure appears valid');
      }
    } catch (error) {
      setMessage(`❌ Error validating SQL: ${error.message}`);
    }
  };

  const clearAll = () => {
    setInputSql('');
    setFormattedSql('');
    setMessage('');
  };

  const copyToClipboard = async () => {
    if (formattedSql) {
      try {
        await navigator.clipboard.writeText(formattedSql);
        setMessage('✅ Copied to clipboard');
      } catch (err) {
        setMessage('❌ Failed to copy to clipboard');
      }
    }
  };

  const sampleSql = `SELECT u.id, u.username, u.email, p.title, p.content, p.created_at, COUNT(c.id) as comment_count FROM users u INNER JOIN posts p ON u.id = p.user_id LEFT JOIN comments c ON p.id = c.post_id WHERE u.active = 1 AND p.published = 1 AND p.created_at >= '2023-01-01' GROUP BY u.id, u.username, u.email, p.id, p.title, p.content, p.created_at HAVING COUNT(c.id) > 0 ORDER BY p.created_at DESC, comment_count DESC LIMIT 10; UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id IN (SELECT DISTINCT user_id FROM sessions WHERE expires_at > CURRENT_TIMESTAMP); INSERT INTO audit_log (table_name, action, record_id, old_values, new_values, user_id, timestamp) SELECT 'users', 'UPDATE', u.id, JSON_OBJECT('last_login', u.old_last_login), JSON_OBJECT('last_login', u.last_login), u.id, CURRENT_TIMESTAMP FROM users u WHERE u.last_login IS NOT NULL;`;

  const loadSample = () => {
    setInputSql(sampleSql);
    setMessage('Sample SQL loaded');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SQL Formatter</h1>
        <p className="text-muted-foreground">Format SQL queries for better readability and structure</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input SQL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputSql">Paste your SQL here:</Label>
                <textarea 
                  id="inputSql"
                  value={inputSql}
                  onChange={(e) => setInputSql(e.target.value)}
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                  placeholder='SELECT * FROM users WHERE active = 1;'
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={formatSql} className="flex-1">
                  Format SQL
                </Button>
                <Button onClick={minifySql} variant="outline" className="flex-1">
                  Minify SQL
                </Button>
                <Button onClick={validateSql} variant="outline" className="flex-1">
                  Validate SQL
                </Button>
                <Button onClick={loadSample} variant="outline">
                  Load Sample
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {message && (
          <Card className={message.startsWith('✅') ? "border-green-200 bg-green-50" : message.startsWith('❌') ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
            <CardContent className="pt-6">
              <div className={`text-sm font-medium ${message.startsWith('✅') ? "text-green-700" : message.startsWith('❌') ? "text-red-700" : "text-yellow-700"}`}>
                {message}
              </div>
            </CardContent>
          </Card>
        )}

        {formattedSql && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Formatted SQL</CardTitle>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy to Clipboard
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formattedSql">Formatted result:</Label>
                <textarea 
                  id="formattedSql"
                  value={formattedSql}
                  readOnly
                  rows={12}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}