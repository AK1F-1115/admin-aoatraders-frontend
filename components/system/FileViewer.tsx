'use client'

import { useState } from 'react'
import { Copy, Check, Loader2, FileText } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useFileContent } from '@/lib/queries/useSystem'

// Map API language slug → Prism language identifier
const PRISM_LANG: Record<string, string> = {
  python: 'python',
  toml: 'toml',
  ini: 'ini',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  markdown: 'markdown',
  text: 'text',
  shell: 'bash',
  env: 'bash',
  javascript: 'javascript',
  typescript: 'typescript',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileViewerProps {
  path: string | null
}

export default function FileViewer({ path }: FileViewerProps) {
  const [copied, setCopied] = useState(false)
  const { data, isLoading, isError, error } = useFileContent(path)

  async function handleCopy() {
    if (!data?.content) return
    await navigator.clipboard.writeText(data.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Empty state
  if (!path) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <FileText className="h-8 w-8 opacity-40" />
        <p className="text-sm">Select a file to view its contents</p>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    )
  }

  // Error states — surface specific HTTP errors
  if (isError || !data) {
    const msg = (error as Error)?.message ?? 'Unknown error'
    const is413 = msg.includes('413') || msg.toLowerCase().includes('too large')
    const is403 = msg.includes('403') || msg.toLowerCase().includes('forbidden')
    const is404 = msg.includes('404') || msg.toLowerCase().includes('not found')

    return (
      <div className="flex h-full min-h-[300px] items-center justify-center px-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive max-w-sm text-center">
          {is413 && <p>File is too large to display.</p>}
          {is403 && <p>Access to this file is restricted.</p>}
          {is404 && <p>File not found.</p>}
          {!is413 && !is403 && !is404 && <p>Failed to load file: {msg}</p>}
        </div>
      </div>
    )
  }

  const prismLang = PRISM_LANG[data.language] ?? 'text'
  const breadcrumbs = data.path.split('/').filter(Boolean)

  return (
    <div className="flex h-full flex-col">
      {/* Header: breadcrumb + meta + copy button */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono truncate">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-40">/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : ''}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">{formatSize(data.size)}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            {data.language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs border border-border hover:bg-muted transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Syntax-highlighted content */}
      <div className="flex-1 overflow-auto text-xs">
        <SyntaxHighlighter
          language={prismLang}
          style={oneDark}
          showLineNumbers
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.75rem',
            background: 'transparent',
            minHeight: '100%',
          }}
        >
          {data.content}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
