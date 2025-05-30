import * as React from "react"
import {
  BriefcaseBusiness,
  BugPlay,
  Cone,
  ContactRound,
  FileCode2,
  KeySquare,
  Paintbrush,
  RotateCcwKey,
} from "lucide-react"
import { SiGithub } from "@icons-pack/react-simple-icons"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
  {
    title: "General Utilities",
    url: "/general-utilities",
    icon: BriefcaseBusiness,
    items: [
      {
        title: "Unix Time Converter",
        url: "/general-utilities/unix-time-converter",
      },
      {
        title: "UUID Generate/Decode",
        url: "/general-utilities/uuid-generate-decode",
      },
      {
        title: "Random String Generator",
        url: "/general-utilities/random-string-generator",
      },
      {
        title: "Lorem Ipsum Generator",
        url: "/general-utilities/lorem-ipsum-generator",
      },
      {
        title: "String Inspector",
        url: "/general-utilities/string-inspector",
      },
      {
        title: "Line Sort/Dedupe",
        url: "/general-utilities/line-sort-dedupe",
      },
      {
        title: "Color Converter",
        url: "/general-utilities/color-converter",
      },
      {
        title: "Cron Job Parser",
        url: "/general-utilities/cron-job-parser",
      },
      {
        title: "QR Code Generator",
        url: "/general-utilities/qr-code-generator",
      },
    ],
  },
  {
    title: "Encoding & Decoding",
    url: "/encoding-decoding",
    icon: KeySquare,
    items: [
      {
        title: "Base64 Encode/Decode",
        url: "/encoding-decoding/base64-encode-decode",
      },
      {
        title: "URL Encode/Decode",
        url: "/encoding-decoding/url-encode-decode",
      },
      {
        title: "HTML Encode/Decode",
        url: "/encoding-decoding/html-encode-decode",
      },
      {
        title: "Backslash Escape",
        url: "/encoding-decoding/backslash-escape",
      },
      {
        title: "Hex to ASCII",
        url: "/encoding-decoding/hex-to-ascii",
      },
      {
        title: "ASCII to Hex",
        url: "/encoding-decoding/ascii-to-hex",
      },
    ],
  },
  {
    title: "Data Conversion",
    url: "/data-conversion",
    icon: FileCode2,
    items: [
      {
        title: "JSON Format/Validate",
        url: "/date-conversion/json-format-validate",
      },
      {
        title: "YAML to JSON",
        url: "/date-conversion/yaml-to-json",
      },
      {
        title: "JSON to YAML",
        url: "/date-conversion/json-to-yaml",
      },
      {
        title: "JSON to CSV",
        url: "/date-conversion/json-to-csv",
      },
      {
        title: "CSV to JSON",
        url: "/date-conversion/csv-to-json",
      },
      {
        title: "PHP to JSON",
        url: "/date-conversion/php-to-json",
      },
      {
        title: "JSON to PHP",
        url: "/date-conversion/json-to-php",
      },
      {
        title: "PHP Serializer",
        url: "/date-conversion/php-serializer",
      },
      {
        title: "PHP Unserializer",
        url: "/date-conversion/php-unserializer",
      },
      {
        title: "Number Base Converter",
        url: "/date-conversion/number-base-converter",
      },
      {
        title: "HTML to JSX",
        url: "/date-conversion/html-to-jsx",
      },
      {
        title: "SVG to CSS",
        url: "/date-conversion/svg-to-css",
      },
      {
        title: "JSON to Code",
        url: "/date-conversion/json-to-code",
      },
      {
        title: "cURL to Code",
        url: "/date-conversion/curl-to-code",
      },
    ],
  },
  {
    title: "Code Formatting",
    url: "/code-formatting",
    icon: Paintbrush,
    items: [
      {
        title: "HTML Beautify/Minify",
        url: "/code-formatting/html-beautify-minify",
      },
      {
        title: "CSS Beautify/Minify",
        url: "/code-formatting/css-beautify-minify",
      },
      {
        title: "JS Beautify/Minify",
        url: "/code-formatting/js-beautify-minify",
      },
      {
        title: "ERB Beautify/Minify",
        url: "/code-formatting/erb-beautify-minify",
      },
      {
        title: "LESS Beautify/Minify",
        url: "/code-formatting/less-beautify-minify",
      },
      {
        title: "SCSS Beautify/Minify",
        url: "/code-formatting/scss-beautify-minify",
      },
      {
        title: "XML Beautify/Minify",
        url: "/code-formatting/xml-beautify-minify",
      },
      {
        title: "SQL Formatter",
        url: "/code-formatting/sql-formatter",
      },
      {
        title: "Markdown Preview",
        url: "/code-formatting/markdown-preview",
      },
    ],
  },
  {
    title: "Analysis & Debugging",
    url: "/analysis-debugging",
    icon: BugPlay,
    items: [
      {
        title: "JWT Debugger",
        url: "/analysis-debugging/jwt-debugger",
      },
      {
        title: "RegExp Tester",
        url: "/analysis-debugging/regexp-tester",
      },
      {
        title: "URL Parser",
        url: "/analysis-debugging/url-parser",
      },
      {
        title: "Text Diff Checker",
        url: "/analysis-debugging/text-diff-checker",
      },
      {
        title: "Hash Generator",
        url: "/analysis-debugging/hash-generator",
      },
      {
        title: "String Case Converter",
        url: "/analysis-debugging/string-case-converter",
      },
      {
        title: "Certificate Decoder (X.509)",
        url: "/analysis-debugging/certificate-decoder-x509",
      },
    ],
  }
]
,
  navSecondary: [
    {
      title: "Alireza",
      url: "https://alireza.akrami.io",
      icon: ContactRound,
    },
    {
      title: "Github",
      url: "https://github.com/akrami/toolbox",
      icon: SiGithub,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Cone className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Akrami</span>
                  <span className="truncate text-xs">Dev Toolbox</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
