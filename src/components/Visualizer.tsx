import React from 'react';
import { ProgramNode, ASTNode } from '../compiler/parser';

interface VisualizerProps {
  ast: ProgramNode | null;
  compileError: string | null;
}

interface VisualNode {
  id: string;
  type: 'START' | 'REQUEST' | 'APPROVAL' | 'CONDITION' | 'ASSIGN' | 'NOTIFY' | 'REJECT' | 'END';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisualEdge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
  dashed?: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ ast, compileError }) => {
  if (compileError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-lg text-center">
        <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 font-bold text-xl">
          !
        </div>
        <h4 className="text-slate-200 font-semibold mb-2">Visualization Unavailable</h4>
        <p className="text-slate-400 text-sm max-w-md">
          Please resolve the compilation diagnostics in the editor to render the workflow diagram.
        </p>
      </div>
    );
  }

  if (!ast) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-lg text-center text-slate-400 text-sm">
        Write or load a workflow in the editor and click "Compile" to visualize the graph.
      </div>
    );
  }

  // Generate layouts dynamically
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];

  let currentY = 40;
  const centerX = 200;
  const nodeWidth = 160;
  const nodeHeight = 50;
  const spacingY = 90;

  // Add START Node
  nodes.push({
    id: 'start',
    type: 'START',
    label: 'START',
    x: centerX - 50,
    y: currentY,
    width: 100,
    height: 40,
  });

  // Edge from Start to Request
  edges.push({
    fromX: centerX,
    fromY: currentY + 40,
    toX: centerX,
    toY: currentY + spacingY,
  });

  currentY += spacingY;

  // Add REQUEST Node
  nodes.push({
    id: 'request',
    type: 'REQUEST',
    label: `REQUEST: ${ast.request.value}`,
    x: centerX - nodeWidth / 2,
    y: currentY,
    width: nodeWidth,
    height: nodeHeight,
  });

  let lastNodeId = 'request';
  let lastNodeX = centerX;
  let lastNodeY = currentY + nodeHeight;

  // Function to layout statements recursively
  function layoutStatements(statements: ASTNode[], startX: number, startY: number, blockId: string): { endX: number; endY: number } {
    let localY = startY;
    let localX = startX;

    statements.forEach((stmt, idx) => {
      const stmtId = `${blockId}_stmt_${idx}`;
      
      // Draw arrow from previous node
      edges.push({
        fromX: lastNodeX,
        fromY: lastNodeY,
        toX: localX,
        toY: localY + 10, // give some spacing
      });

      if (stmt.type === 'Approval') {
        nodes.push({
          id: stmtId,
          type: 'APPROVAL',
          label: `APPROVAL\n${stmt.role}`,
          x: localX - nodeWidth / 2,
          y: localY + 10,
          width: nodeWidth,
          height: nodeHeight,
        });
        lastNodeId = stmtId;
        lastNodeX = localX;
        lastNodeY = localY + 10 + nodeHeight;
        localY += spacingY;
      } else if (stmt.type === 'Notify') {
        nodes.push({
          id: stmtId,
          type: 'NOTIFY',
          label: `NOTIFY\n${stmt.target}`,
          x: localX - nodeWidth / 2,
          y: localY + 10,
          width: nodeWidth,
          height: nodeHeight,
        });
        lastNodeId = stmtId;
        lastNodeX = localX;
        lastNodeY = localY + 10 + nodeHeight;
        localY += spacingY;
      } else if (stmt.type === 'Assign') {
        nodes.push({
          id: stmtId,
          type: 'ASSIGN',
          label: `ASSIGN\n${stmt.variable} = ${stmt.value}`,
          x: localX - nodeWidth / 2,
          y: localY + 10,
          width: nodeWidth,
          height: nodeHeight,
        });
        lastNodeId = stmtId;
        lastNodeX = localX;
        lastNodeY = localY + 10 + nodeHeight;
        localY += spacingY;
      } else if (stmt.type === 'Reject') {
        nodes.push({
          id: stmtId,
          type: 'REJECT',
          label: 'REJECT',
          x: localX - 70,
          y: localY + 10,
          width: 140,
          height: nodeHeight,
        });
        lastNodeId = stmtId;
        lastNodeX = localX;
        lastNodeY = localY + 10 + nodeHeight;
        localY += spacingY;
      } else if (stmt.type === 'IfStmt') {
        const condId = `${stmtId}_cond`;
        const condY = localY + 10;
        
        // Render IF condition node (Diamond shape)
        nodes.push({
          id: condId,
          type: 'CONDITION',
          label: `${stmt.variable}\n${stmt.operator} ${stmt.value}`,
          x: localX - 90,
          y: condY,
          width: 180,
          height: 60,
        });

        const condBottomY = condY + 60;
        
        // Branching Coordinates
        const branchX = localX + 180; // Offset to the right
        const branchStartY = condY + 30; // Center level of Diamond
        
        // Draw edge to true block (going right then down)
        edges.push({
          fromX: localX + 90,
          fromY: branchStartY,
          toX: branchX,
          toY: condBottomY + 10,
          label: 'YES',
        });

        // Save last node references to restore after true branch
        const outerLastX = localX;
        const outerLastY = condBottomY;
        
        // Compile true branch statements inside
        lastNodeId = condId;
        lastNodeX = branchX;
        lastNodeY = condBottomY + 10;

        const branchResult = layoutStatements(stmt.body, branchX, condBottomY + 10, `${stmtId}_body`);

        // If the true block executed, draw an arrow back to the main flow line
        const mergeY = Math.max(localY + spacingY, branchResult.endY + 30);

        // Draw line from true branch end back to main line
        edges.push({
          fromX: branchResult.endX,
          fromY: branchResult.endY,
          toX: outerLastX,
          toY: mergeY,
          dashed: true,
        });

        // Draw line from condition diamond straight down (representing NO)
        edges.push({
          fromX: outerLastX,
          fromY: outerLastY,
          toX: outerLastX,
          toY: mergeY,
          label: 'NO',
        });

        lastNodeId = condId;
        lastNodeX = outerLastX;
        lastNodeY = mergeY;
        localY = mergeY;
      }
    });

    return { endX: lastNodeX, endY: lastNodeY };
  }

  // Layout all body statements starting from main line
  const bodyLayout = layoutStatements(ast.body, centerX, currentY + nodeHeight, 'main');

  // Draw final arrow to END node
  edges.push({
    fromX: bodyLayout.endX,
    fromY: bodyLayout.endY,
    toX: centerX,
    toY: bodyLayout.endY + 40,
  });

  // Add END node
  nodes.push({
    id: 'end',
    type: 'END',
    label: 'END',
    x: centerX - 50,
    y: bodyLayout.endY + 40,
    width: 100,
    height: 40,
  });

  const svgHeight = bodyLayout.endY + 120;
  const svgWidth = 460;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <span className="text-xs font-semibold text-cyan-400 font-mono">FLOW VISUALIZATION ({ast.name})</span>
        <span className="text-[10px] text-slate-500">Auto-generated from AST</span>
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="overflow-visible"
          style={{ minWidth: '400px' }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Render Edges (arrows) */}
          {edges.map((edge, index) => {
            const isSelfBranch = edge.fromX !== edge.toX;
            let pathD = '';
            
            if (isSelfBranch) {
              // Draw angled paths for true branch jumps
              pathD = `M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.fromY} L ${edge.toX} ${edge.toY}`;
            } else {
              // Draw simple vertical line
              pathD = `M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.toY}`;
            }

            return (
              <g key={`edge-${index}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={edge.dashed ? '#64748b' : '#0284c7'}
                  strokeWidth="2"
                  strokeDasharray={edge.dashed ? '4,4' : undefined}
                  markerEnd={edge.dashed ? undefined : 'url(#arrow)'}
                />
                {edge.label && (
                  <text
                    x={isSelfBranch ? (edge.fromX + edge.toX) / 2 : edge.fromX + 8}
                    y={isSelfBranch ? edge.fromY - 6 : (edge.fromY + edge.toY) / 2}
                    fill={edge.label === 'YES' ? '#10b981' : '#f43f5e'}
                    className="text-[10px] font-bold font-mono"
                    textAnchor={isSelfBranch ? 'middle' : 'start'}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            let fillColor = 'bg-slate-800';
            let borderColor = 'border-slate-700';
            let textGlow = '';
            let rx = '4px';

            switch (node.type) {
              case 'START':
                fillColor = '#0f172a';
                borderColor = '#10b981';
                rx = '20px';
                break;
              case 'END':
                fillColor = '#0f172a';
                borderColor = '#f43f5e';
                rx = '20px';
                break;
              case 'REQUEST':
                fillColor = '#082f49';
                borderColor = '#0284c7';
                break;
              case 'APPROVAL':
                fillColor = '#172554';
                borderColor = '#3b82f6';
                break;
              case 'CONDITION':
                fillColor = '#1e1b4b';
                borderColor = '#6366f1';
                rx = '0px'; // Diamond shape rendered as polygon below
                break;
              case 'NOTIFY':
                fillColor = '#042f2e';
                borderColor = '#0d9488';
                break;
              case 'ASSIGN':
                fillColor = '#14532d';
                borderColor = '#22c55e';
                break;
              case 'REJECT':
                fillColor = '#450a0a';
                borderColor = '#ef4444';
                break;
            }

            return (
              <g key={node.id} className="cursor-default select-none">
                {node.type === 'CONDITION' ? (
                  // Diamond shape
                  <polygon
                    points={`${node.x + node.width / 2},${node.y} ${node.x + node.width},${node.y + node.height / 2} ${node.x + node.width / 2},${node.y + node.height} ${node.x},${node.y + node.height / 2}`}
                    fill={fillColor}
                    stroke={borderColor}
                    strokeWidth="1.5"
                    className="transition-colors hover:brightness-110"
                  />
                ) : (
                  // Round rect shape
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={rx}
                    fill={fillColor}
                    stroke={borderColor}
                    strokeWidth="1.5"
                    className="transition-colors hover:brightness-110"
                  />
                )}
                
                {/* Node Label Text */}
                {node.label.split('\n').map((line, idx, arr) => {
                  const yOffset = arr.length > 1 ? (idx - 0.5) * 14 : 0;
                  return (
                    <text
                      key={idx}
                      x={node.x + node.width / 2}
                      y={node.y + node.height / 2 + 4 + yOffset}
                      fill="#e2e8f0"
                      className={`text-[11px] font-medium font-mono text-center`}
                      textAnchor="middle"
                    >
                      {line}
                    </text>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
