'use client'

import { useState } from 'react'
import FileTree from './FileTree'
import FileViewer from './FileViewer'

/**
 * Panel 3 — File Browser
 * 30/70 split: left pane (directory tree) + right pane (syntax-highlighted viewer).
 */
export default function FileBrowser() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex h-[520px]">
        {/* Left pane — directory tree (30%) */}
        <div className="w-[30%] min-w-[180px] border-r border-border overflow-y-auto bg-muted/20 p-2">
          <FileTree selectedPath={selectedPath} onSelectFile={setSelectedPath} />
        </div>

        {/* Right pane — file content (70%) */}
        <div className="flex-1 overflow-hidden bg-[#1e1e2e]">
          <FileViewer path={selectedPath} />
        </div>
      </div>
    </div>
  )
}
