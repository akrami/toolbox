"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, QrCode } from "lucide-react";

interface Template {
  value: string;
  label: string;
  defaultText: string;
  formatter: (data: string) => string;
}

const templates: Template[] = [
  {
    value: "url",
    label: "URL",
    defaultText: "https://example.com",
    formatter: (data: string) => data.startsWith("http") ? data : `https://${data}`,
  },
  {
    value: "phone",
    label: "Phone",
    defaultText: "+1234567890",
    formatter: (data: string) => `tel:${data}`,
  },
  {
    value: "sms",
    label: "SMS",
    defaultText: "+1234567890",
    formatter: (data: string) => `sms:${data}`,
  },
  {
    value: "email",
    label: "Email",
    defaultText: "user@example.com",
    formatter: (data: string) => `mailto:${data}`,
  },
  {
    value: "vcard",
    label: "vCard",
    defaultText: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD",
    formatter: (data: string) => data,
  },
  {
    value: "event",
    label: "Event",
    defaultText: "BEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20240101T120000\nLOCATION:Conference Room\nEND:VEVENT",
    formatter: (data: string) => data,
  },
  {
    value: "wifi",
    label: "WiFi",
    defaultText: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;",
    formatter: (data: string) => data,
  },
];

export default function QRCodeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("url");
  const [inputData, setInputData] = useState<string>("https://example.com");
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentTemplate = templates.find(t => t.value === selectedTemplate) || templates[0];

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    const template = templates.find(t => t.value === value);
    if (template) {
      setInputData(template.defaultText);
    }
  };

  const generateQRCode = async () => {
    if (!inputData.trim()) return;

    setIsGenerating(true);
    try {
      const formattedData = currentTemplate.formatter(inputData);
      const dataURL = await QRCode.toDataURL(formattedData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQRCodeDataURL(dataURL);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `qr-code-${selectedTemplate}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Textarea
              id="data"
              placeholder="Enter your data here..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="min-h-[120px] resize-y"
            />
          </div>

          <Button 
            onClick={generateQRCode} 
            disabled={!inputData.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {qrCodeDataURL && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCodeDataURL}
                alt="Generated QR Code"
                className="border rounded-lg"
              />
            </div>
            <Button onClick={downloadQRCode} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}