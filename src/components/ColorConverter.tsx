import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorValues {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

const colorNames: { [key: string]: string } = {
  red: '#FF0000', green: '#008000', blue: '#0000FF', white: '#FFFFFF', black: '#000000',
  yellow: '#FFFF00', cyan: '#00FFFF', magenta: '#FF00FF', silver: '#C0C0C0', gray: '#808080',
  maroon: '#800000', olive: '#808000', lime: '#00FF00', aqua: '#00FFFF', teal: '#008080',
  navy: '#000080', fuchsia: '#FF00FF', purple: '#800080', orange: '#FFA500', pink: '#FFC0CB',
  brown: '#A52A2A', gold: '#FFD700', beige: '#F5F5DC', tan: '#D2B48C', coral: '#FF7F50',
  salmon: '#FA8072', crimson: '#DC143C', indigo: '#4B0082', violet: '#EE82EE', khaki: '#F0E68C'
};

const hexToColorName = (hex: string): string => {
  const upperHex = hex.toUpperCase();
  for (const [name, value] of Object.entries(colorNames)) {
    if (value.toUpperCase() === upperHex) {
      return name;
    }
  }
  return '';
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
  if (r === 0 && g === 0 && b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const rPercent = r / 255;
  const gPercent = g / 255;
  const bPercent = b / 255;

  const k = 1 - Math.max(rPercent, Math.max(gPercent, bPercent));
  const c = (1 - rPercent - k) / (1 - k);
  const m = (1 - gPercent - k) / (1 - k);
  const y = (1 - bPercent - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
};

const cmykToRgb = (c: number, m: number, y: number, k: number): { r: number; g: number; b: number } => {
  const r = 255 * (1 - c / 100) * (1 - k / 100);
  const g = 255 * (1 - m / 100) * (1 - k / 100);
  const b = 255 * (1 - y / 100) * (1 - k / 100);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
};

export default function ColorConverter() {
  const [colorValues, setColorValues] = useState<ColorValues>({
    name: 'red',
    hex: '#FF0000',
    rgb: { r: 255, g: 0, b: 0 },
    hsl: { h: 0, s: 100, l: 50 },
    cmyk: { c: 0, m: 100, y: 100, k: 0 }
  });

  const [inputValues, setInputValues] = useState({
    name: 'red',
    hex: '#FF0000',
    rgb: 'rgb(255, 0, 0)',
    hsl: 'hsl(0, 100%, 50%)',
    cmyk: 'cmyk(0%, 100%, 100%, 0%)'
  });

  const updateFromHex = (hex: string) => {
    if (!hex.startsWith('#')) hex = '#' + hex;
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const name = hexToColorName(hex);

    const newValues = { name, hex: hex.toUpperCase(), rgb, hsl, cmyk };
    setColorValues(newValues);
    updateInputValues(newValues);
  };

  const updateFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    const name = hexToColorName(hex);

    const newValues = { name, hex, rgb: { r, g, b }, hsl, cmyk };
    setColorValues(newValues);
    updateInputValues(newValues);
  };

  const updateFromHsl = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const name = hexToColorName(hex);

    const newValues = { name, hex, rgb, hsl: { h, s, l }, cmyk };
    setColorValues(newValues);
    updateInputValues(newValues);
  };

  const updateFromCmyk = (c: number, m: number, y: number, k: number) => {
    const rgb = cmykToRgb(c, m, y, k);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const name = hexToColorName(hex);

    const newValues = { name, hex, rgb, hsl, cmyk: { c, m, y, k } };
    setColorValues(newValues);
    updateInputValues(newValues);
  };

  const updateFromName = (name: string) => {
    const lowerName = name.toLowerCase();
    if (colorNames[lowerName]) {
      updateFromHex(colorNames[lowerName]);
    }
  };

  const updateInputValues = (values: ColorValues) => {
    setInputValues({
      name: values.name,
      hex: values.hex,
      rgb: `rgb(${values.rgb.r}, ${values.rgb.g}, ${values.rgb.b})`,
      hsl: `hsl(${values.hsl.h}, ${values.hsl.s}%, ${values.hsl.l}%)`,
      cmyk: `cmyk(${values.cmyk.c}%, ${values.cmyk.m}%, ${values.cmyk.y}%, ${values.cmyk.k}%)`
    });
  };

  const handleInputChange = (type: string, value: string) => {
    setInputValues(prev => ({ ...prev, [type]: value }));

    switch (type) {
      case 'name':
        updateFromName(value);
        break;
      case 'hex':
        if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
          updateFromHex(value);
        }
        break;
      case 'rgb':
        const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          if (r <= 255 && g <= 255 && b <= 255) {
            updateFromRgb(r, g, b);
          }
        }
        break;
      case 'hsl':
        const hslMatch = value.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]);
          const s = parseInt(hslMatch[2]);
          const l = parseInt(hslMatch[3]);
          if (h <= 360 && s <= 100 && l <= 100) {
            updateFromHsl(h, s, l);
          }
        }
        break;
      case 'cmyk':
        const cmykMatch = value.match(/cmyk\((\d+)%,\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\)/);
        if (cmykMatch) {
          const c = parseInt(cmykMatch[1]);
          const m = parseInt(cmykMatch[2]);
          const y = parseInt(cmykMatch[3]);
          const k = parseInt(cmykMatch[4]);
          if (c <= 100 && m <= 100 && y <= 100 && k <= 100) {
            updateFromCmyk(c, m, y, k);
          }
        }
        break;
    }
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded border border-input shadow-sm flex-shrink-0"
              style={{ backgroundColor: colorValues.hex }}
              title={`Current color: ${colorValues.hex}`}
            />
            Color Values
          </CardTitle>
        </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Color Name */}
              <div className="space-y-2">
                <Label htmlFor="colorName">Color Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="colorName"
                    value={inputValues.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., red, blue, green"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => copyToClipboard(inputValues.name)}>
                    Copy
                  </Button>
                </div>
              </div>

              {/* Hex */}
              <div className="space-y-2">
                <Label htmlFor="hex">Hex</Label>
                <div className="flex gap-2">
                  <Input
                    id="hex"
                    value={inputValues.hex}
                    onChange={(e) => handleInputChange('hex', e.target.value)}
                    placeholder="#FF0000"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => copyToClipboard(inputValues.hex)}>
                    Copy
                  </Button>
                </div>
              </div>

              {/* RGB */}
              <div className="space-y-2">
                <Label htmlFor="rgb">RGB</Label>
                <div className="flex gap-2">
                  <Input
                    id="rgb"
                    value={inputValues.rgb}
                    onChange={(e) => handleInputChange('rgb', e.target.value)}
                    placeholder="rgb(255, 0, 0)"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => copyToClipboard(inputValues.rgb)}>
                    Copy
                  </Button>
                </div>
              </div>

              {/* HSL */}
              <div className="space-y-2">
                <Label htmlFor="hsl">HSL</Label>
                <div className="flex gap-2">
                  <Input
                    id="hsl"
                    value={inputValues.hsl}
                    onChange={(e) => handleInputChange('hsl', e.target.value)}
                    placeholder="hsl(0, 100%, 50%)"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => copyToClipboard(inputValues.hsl)}>
                    Copy
                  </Button>
                </div>
              </div>

              {/* CMYK */}
              <div className="space-y-2">
                <Label htmlFor="cmyk">CMYK</Label>
                <div className="flex gap-2">
                  <Input
                    id="cmyk"
                    value={inputValues.cmyk}
                    onChange={(e) => handleInputChange('cmyk', e.target.value)}
                    placeholder="cmyk(0%, 100%, 100%, 0%)"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => copyToClipboard(inputValues.cmyk)}>
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}