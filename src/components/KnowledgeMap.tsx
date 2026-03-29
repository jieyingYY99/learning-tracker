"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import clsx from "clsx";
import type { Concept } from "@/lib/types";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  name: string;
  category: string;
  mastery?: string;
  difficulty: number;
  reviewStage: number;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const CATEGORY_FILL: Record<string, string> = {
  frontend: "#2563eb",
  backend: "#16a34a",
  general: "#db2777",
};

const CATEGORY_FILL_LIGHT: Record<string, string> = {
  frontend: "rgba(37,99,235,0.12)",
  backend: "rgba(22,163,74,0.12)",
  general: "rgba(219,39,119,0.12)",
};

const MASTERY_STROKE: Record<string, { width: number; dash: string }> = {
  seen: { width: 1.5, dash: "4 2" },
  understand: { width: 2, dash: "" },
  can_use: { width: 3, dash: "" },
};

export default function KnowledgeMap({ concepts }: { concepts: Concept[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Build graph data and run simulation
  useEffect(() => {
    const graphNodes: GraphNode[] = concepts.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      mastery: c.mastery_level,
      difficulty: c.difficulty || 2,
      reviewStage: c.review_stage,
    }));

    const conceptIds = new Set(concepts.map((c) => c.id));
    const graphLinks: GraphLink[] = [];
    for (const c of concepts) {
      if (c.prerequisites) {
        for (const prereq of c.prerequisites) {
          if (conceptIds.has(prereq)) {
            graphLinks.push({ source: prereq, target: c.id });
          }
        }
      }
    }

    const simulation = forceSimulation<GraphNode>(graphNodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(graphLinks)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(0, 0))
      .force("collide", forceCollide<GraphNode>().radius((d) => d.difficulty * 8 + 20));

    simulation.on("end", () => {
      setNodes([...graphNodes]);
      setLinks(
        graphLinks.map((l) => ({
          ...l,
          source: l.source as GraphNode,
          target: l.target as GraphNode,
        }))
      );
    });

    // Run synchronously for faster rendering
    simulation.tick(200);
    simulation.stop();
    setNodes([...graphNodes]);
    setLinks(
      graphLinks.map((l) => ({
        ...l,
        source: l.source as GraphNode,
        target: l.target as GraphNode,
      }))
    );

    return () => {
      simulation.stop();
    };
  }, [concepts]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.3, Math.min(3, prev.scale * delta)),
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).closest("a")) return;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setTransform((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    },
    [dragging]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const nodeRadius = (d: GraphNode) => d.difficulty * 6 + 14;

  return (
    <div className="relative h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 rounded-xl border border-border bg-surface/95 backdrop-blur-sm p-3 text-xs space-y-2">
        <div className="font-medium text-text mb-1">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: CATEGORY_FILL.frontend }} />
            <span className="text-text-dim">Frontend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: CATEGORY_FILL.backend }} />
            <span className="text-text-dim">Backend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: CATEGORY_FILL.general }} />
            <span className="text-text-dim">General</span>
          </div>
        </div>
        <div className="border-t border-border pt-1.5 space-y-1">
          <div className="flex items-center gap-2">
            <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#7c7c7a" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
            <span className="text-text-dim">Seen</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#7c7c7a" strokeWidth="2" /></svg>
            <span className="text-text-dim">Understand</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#7c7c7a" strokeWidth="3" /></svg>
            <span className="text-text-dim">Can Use</span>
          </div>
        </div>
        <div className="border-t border-border pt-1.5 text-text-dim">
          Node size = difficulty
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <button
          onClick={() => setTransform((p) => ({ ...p, scale: Math.min(3, p.scale * 1.2) }))}
          className="rounded-lg border border-border bg-surface px-2 py-1 text-sm hover:bg-surface2"
        >
          +
        </button>
        <button
          onClick={() => setTransform((p) => ({ ...p, scale: Math.max(0.3, p.scale * 0.8) }))}
          className="rounded-lg border border-border bg-surface px-2 py-1 text-sm hover:bg-surface2"
        >
          −
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="rounded-lg border border-border bg-surface px-2 py-1 text-[10px] hover:bg-surface2"
        >
          Reset
        </button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className={clsx("cursor-grab", dragging && "cursor-grabbing")}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g
          transform={`translate(${transform.x + (svgRef.current?.clientWidth || 800) / 2}, ${transform.y + (svgRef.current?.clientHeight || 600) / 2}) scale(${transform.scale})`}
        >
          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 7"
              refX="10"
              refY="3.5"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#d9d6cf" />
            </marker>
          </defs>

          {/* Links */}
          {links.map((l, i) => {
            const s = l.source as GraphNode;
            const t = l.target as GraphNode;
            if (!s.x || !s.y || !t.x || !t.y) return null;

            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const tr = nodeRadius(t);
            const endX = t.x - (dx / dist) * (tr + 4);
            const endY = t.y - (dy / dist) * (tr + 4);

            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={endX}
                y2={endY}
                stroke="#d9d6cf"
                strokeWidth={1}
                markerEnd="url(#arrowhead)"
                opacity={0.6}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const r = nodeRadius(node);
            const fill = CATEGORY_FILL[node.category] || CATEGORY_FILL.general;
            const fillLight = CATEGORY_FILL_LIGHT[node.category] || CATEGORY_FILL_LIGHT.general;
            const masteryStyle = MASTERY_STROKE[node.mastery || "seen"] || MASTERY_STROKE.seen;
            const isHovered = hoveredNode === node.id;

            return (
              <a
                key={node.id}
                href={`/concept/${node.id}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={fillLight}
                  stroke={fill}
                  strokeWidth={masteryStyle.width}
                  strokeDasharray={masteryStyle.dash}
                  opacity={isHovered ? 1 : 0.85}
                  style={{ transition: "opacity 0.15s" }}
                />
                {/* Stage indicator (small inner ring) */}
                {node.reviewStage >= 5 && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r - 4}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth={1.5}
                    opacity={0.5}
                  />
                )}
                {/* Label */}
                <text
                  x={node.x}
                  y={(node.y || 0) + r + 14}
                  textAnchor="middle"
                  fontSize={11}
                  fill={isHovered ? "#1a1a1a" : "#7c7c7a"}
                  fontWeight={isHovered ? 600 : 400}
                  style={{ transition: "fill 0.15s" }}
                >
                  {node.name.length > 25
                    ? node.name.slice(0, 22) + "..."
                    : node.name}
                </text>
              </a>
            );
          })}
        </g>
      </svg>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-text-dim text-sm">
          No concepts to display. Run the learning tracker skill to generate data.
        </div>
      )}
    </div>
  );
}
