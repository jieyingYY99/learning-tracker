"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Server,
  Package,
  FileCode,
  FunctionSquare,
  Search,
} from "lucide-react";
import clsx from "clsx";
import type { ArchNode, Concept } from "@/lib/types";

const TYPE_ICONS: Record<string, React.ElementType> = {
  system: Server,
  module: Package,
  file: FileCode,
  function: FunctionSquare,
};

const TYPE_COLORS: Record<string, string> = {
  system: "text-accent",
  module: "text-blue",
  file: "text-orange",
  function: "text-pink",
};

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/10 text-blue",
  backend: "bg-green/10 text-green",
  general: "bg-pink/10 text-pink",
};

function matchesSearch(node: ArchNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true;
  if (node.description.toLowerCase().includes(query)) return true;
  if (node.metadata?.file_path?.toLowerCase().includes(query)) return true;
  return node.children.some((child) => matchesSearch(child, query));
}

function TreeNode({
  node,
  concepts,
  depth,
  searchQuery,
  defaultExpanded,
}: {
  node: ArchNode;
  concepts: Concept[];
  depth: number;
  searchQuery: string;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded || depth < 1);
  const Icon = TYPE_ICONS[node.type] || FileCode;
  const hasChildren = node.children.length > 0;
  const linkedConcepts = concepts.filter((c) => node.concepts.includes(c.id));

  // Auto-expand if search matches a descendant
  const matchesDescendant = searchQuery
    ? matchesSearch(node, searchQuery)
    : false;

  const isDirectMatch = searchQuery
    ? node.name.toLowerCase().includes(searchQuery) ||
      node.description.toLowerCase().includes(searchQuery)
    : false;

  const shouldShow = !searchQuery || matchesDescendant;
  if (!shouldShow) return null;

  const isExpanded = expanded || (searchQuery ? matchesDescendant : false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!isExpanded)}
        className={clsx(
          "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface2",
          isDirectMatch && searchQuery && "bg-accent/5"
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Expand toggle */}
        <span className="mt-0.5 shrink-0 text-text-dim">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="inline-block w-[14px]" />
          )}
        </span>

        {/* Icon */}
        <Icon size={14} className={clsx("mt-0.5 shrink-0", TYPE_COLORS[node.type])} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{node.name}</span>
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-text-dim bg-surface2">
              {node.type}
            </span>
            {node.metadata?.language && (
              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-text-dim bg-surface2 font-mono">
                {node.metadata.language}
              </span>
            )}
          </div>

          {node.description && (
            <p className="mt-0.5 text-xs text-text-dim line-clamp-1">
              {node.description}
            </p>
          )}

          {node.metadata?.file_path && (
            <p className="mt-0.5 font-mono text-[10px] text-text-dim/60">
              {node.metadata.file_path}
            </p>
          )}

          {/* Linked concepts */}
          {linkedConcepts.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {linkedConcepts.map((c) => (
                <Link
                  key={c.id}
                  href={`/concept/${c.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className={clsx(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80",
                    CATEGORY_COLORS[c.category]
                  )}
                >
                  {c.name.length > 30 ? c.name.slice(0, 27) + "..." : c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              concepts={concepts}
              depth={depth + 1}
              searchQuery={searchQuery}
              defaultExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArchitectureTree({
  tree,
  concepts,
}: {
  tree: ArchNode;
  concepts: Concept[];
}) {
  const [search, setSearch] = useState("");
  const query = search.toLowerCase().trim();

  // Count nodes
  const nodeCount = useMemo(() => {
    let count = 0;
    function walk(node: ArchNode) {
      count++;
      node.children.forEach(walk);
    }
    walk(tree);
    return count;
  }, [tree]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search architecture..."
          className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-dim/50 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-text-dim">
        <span>{nodeCount} nodes</span>
        <span>{concepts.length} linked concepts</span>
      </div>

      {/* Tree */}
      <div className="rounded-2xl border border-border bg-surface p-2 max-h-[calc(100vh-240px)] overflow-y-auto">
        <TreeNode
          node={tree}
          concepts={concepts}
          depth={0}
          searchQuery={query}
          defaultExpanded={true}
        />
      </div>
    </div>
  );
}
