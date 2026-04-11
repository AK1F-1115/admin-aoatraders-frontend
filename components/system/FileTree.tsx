'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Loader2 } from 'lucide-react'
import { useFileBrowser } from '@/lib/queries/useSystem'
import type { FileEntry } from '@/types/system.types'

// Map language slug → short label shown next to file
const LANG_LABEL: Record<string, string> = {
  python: 'py',
  toml: 'toml',
  ini: 'ini',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  markdown: 'md',
  text: 'txt',
  shell: 'sh',
  env: 'env',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// ── Single expandable directory node ─────────────────────────────────────────

interface DirNodeProps {
  entry: FileEntry
  depth: number
  selectedPath: string | null
  onSelectFile: (path: string) => void
}

function DirNode({ entry, depth, selectedPath, onSelectFile }: DirNodeProps) {
  const [open, setOpen] = useState(false)
  const { data, isFetching } = useFileBrowser(open ? entry.path : '__disabled__')

  // Prevent fetch when closed by using a sentinel path
  const children = open && data ? data.entries : []

  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className="flex w-full items-center gap-1.5 py-1 pr-2 text-left text-sm hover:bg-muted/40 rounded transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        {open ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
        )}
        <span className="truncate font-medium">{entry.name}</span>
        {isFetching && open && (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground ml-auto" />
        )}
      </button>
      {open && children.length > 0 && (
        <ul>
          {children.map((child) =>
            child.type === 'dir' ? (
              <DirNode
                key={child.path}
                entry={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ) : (
              <FileNode
                key={child.path}
                entry={child}
                depth={depth + 1}
                isSelected={selectedPath === child.path}
                onSelect={() => onSelectFile(child.path)}
              />
            ),
          )}
        </ul>
      )}
    </li>
  )
}

// ── Single file leaf node ─────────────────────────────────────────────────────

interface FileNodeProps {
  entry: FileEntry
  depth: number
  isSelected: boolean
  onSelect: () => void
}

function FileNode({ entry, depth, isSelected, onSelect }: FileNodeProps) {
  const langLabel = entry.language ? (LANG_LABEL[entry.language] ?? entry.language) : null
  return (
    <li>
      <button
        onClick={onSelect}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex w-full items-center gap-1.5 py-1 pr-2 text-left text-sm rounded transition-colors ${
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-muted/40 text-foreground'
        }`}
      >
        <span className="w-3.5 shrink-0" /> {/* align with chevron space */}
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate flex-1">{entry.name}</span>
        {langLabel && (
          <span className="shrink-0 rounded px-1 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground">
            {langLabel}
          </span>
        )}
        {entry.size != null && (
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatSize(entry.size)}
          </span>
        )}
      </button>
    </li>
  )
}

// ── Root tree ─────────────────────────────────────────────────────────────────

interface FileTreeProps {
  selectedPath: string | null
  onSelectFile: (path: string) => void
}

export default function FileTree({ selectedPath, onSelectFile }: FileTreeProps) {
  const { data, isLoading, isError } = useFileBrowser('.')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="px-3 py-4 text-sm text-destructive">Failed to load file tree.</div>
    )
  }

  return (
    <ul className="text-sm">
      {data.entries.map((entry) =>
        entry.type === 'dir' ? (
          <DirNode
            key={entry.path}
            entry={entry}
            depth={0}
            selectedPath={selectedPath}
            onSelectFile={onSelectFile}
          />
        ) : (
          <FileNode
            key={entry.path}
            entry={entry}
            depth={0}
            isSelected={selectedPath === entry.path}
            onSelect={() => onSelectFile(entry.path)}
          />
        ),
      )}
    </ul>
  )
}
