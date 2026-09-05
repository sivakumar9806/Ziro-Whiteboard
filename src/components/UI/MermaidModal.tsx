import React, { useState } from 'react';
import { X, Code2, Play, FileCode } from 'lucide-react';
import type { CanvasElement, ViewportTransform } from '../../types/whiteboard';
import confetti from 'canvas-confetti';

interface MermaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewport: ViewportTransform;
  onInsertElements: (elements: CanvasElement[]) => void;
}

const MERMAID_TEMPLATES = [
  {
    name: 'User Login & MFA Flow',
    code: `graph TD
  Start[👤 User Enters Credentials] --> Auth{Validate Password}
  Auth -->|Success| MFA[📱 Send 2FA Code]
  Auth -->|Failed| Err[❌ Show Error]
  MFA --> Verify{Verify SMS / TOTP}
  Verify -->|Valid| Dash[🚀 Enter Dashboard]
  Verify -->|Invalid| MFA`,
  },
  {
    name: 'Microservice API Gateway Flow',
    code: `graph LR
  Client[🌐 Mobile & Web Client] --> Gateway[🛡️ API Gateway]
  Gateway --> AuthSvc[🔐 Auth Service]
  Gateway --> OrderSvc[🛒 Order Service]
  Gateway --> NotifSvc[🔔 Notification Service]
  OrderSvc --> DB[(🗄️ PostgreSQL Database)]`,
  },
  {
    name: 'CI/CD Deployment Pipeline',
    code: `graph LR
  Code[💻 Git Push] --> Build[⚙️ Automated Build]
  Build --> Test[🧪 Unit & E2E Tests]
  Test --> Deploy[🚀 Netlify / Cloud Deploy]
  Deploy --> Live[✅ Production Verified]`,
  },
];

export const MermaidModal: React.FC<MermaidModalProps> = ({
  isOpen,
  onClose,
  viewport,
  onInsertElements,
}) => {
  const [code, setCode] = useState(MERMAID_TEMPLATES[0].code);

  if (!isOpen) return null;

  const centerX = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom);
  const centerY = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom);

  const parseAndInsertMermaid = () => {
    const lines = code.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('graph') && !l.startsWith('flowchart'));
    const now = Date.now();

    const nodeMap = new Map<string, { id: string; label: string; x: number; y: number }>();
    const arrows: CanvasElement[] = [];
    const elements: CanvasElement[] = [];

    // Parse simple graph syntax: A[Label] --> B[Label] or A --> B
    let stepIndex = 0;
    const isHorizontal = code.includes('graph LR') || code.includes('flowchart LR');

    lines.forEach((line) => {
      // Look for arrows
      const parts = line.split(/-->|-->\|.*?\|/);
      if (parts.length >= 2) {
        const leftRaw = parts[0].trim();
        const rightRaw = parts[1].trim();

        // Extract label from A[Label] or A(Label) or A{Label}
        const extract = (raw: string) => {
          const match = raw.match(/^([a-zA-Z0-9_-]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})?$/);
          if (match) {
            const id = match[1];
            const label = match[2] || match[3] || match[4] || id;
            return { id, label };
          }
          return { id: raw, label: raw };
        };

        const from = extract(leftRaw);
        const to = extract(rightRaw);

        if (!nodeMap.has(from.id)) {
          const x = isHorizontal ? centerX - 300 + stepIndex * 220 : centerX - 80;
          const y = isHorizontal ? centerY - 40 : centerY - 200 + stepIndex * 120;
          nodeMap.set(from.id, { id: `m-node-${from.id}-${now}`, label: from.label, x, y });
          stepIndex++;
        }

        if (!nodeMap.has(to.id)) {
          const x = isHorizontal ? centerX - 300 + stepIndex * 220 : centerX - 80;
          const y = isHorizontal ? centerY - 40 : centerY - 200 + stepIndex * 120;
          nodeMap.set(to.id, { id: `m-node-${to.id}-${now}`, label: to.label, x, y });
          stepIndex++;
        }

        const fromNode = nodeMap.get(from.id)!;
        const toNode = nodeMap.get(to.id)!;

        // Arrow
        arrows.push({
          id: `m-arrow-${from.id}-${to.id}-${now}`,
          type: 'arrow',
          startX: isHorizontal ? fromNode.x + 160 : fromNode.x + 80,
          startY: isHorizontal ? fromNode.y + 35 : fromNode.y + 70,
          endX: isHorizontal ? toNode.x : toNode.x + 80,
          endY: isHorizontal ? toNode.y + 35 : toNode.y,
          x: fromNode.x,
          y: fromNode.y,
          width: Math.abs(toNode.x - fromNode.x) || 50,
          height: Math.abs(toNode.y - fromNode.y) || 50,
          stroke: '#4262ff',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowHead: 'end',
          zIndex: 3,
        });
      }
    });

    // Create frame
    const frame: CanvasElement = {
      id: `m-frame-${now}`,
      type: 'frame',
      x: centerX - 420,
      y: centerY - 240,
      width: 840,
      height: 480,
      title: '📊 Mermaid.js Diagram (Compiled to Native Shapes)',
      fill: 'rgba(240, 245, 255, 0.4)',
      stroke: '#4262ff',
      zIndex: 1,
    };
    elements.push(frame);

    // Create node shapes
    nodeMap.forEach((node) => {
      elements.push({
        id: node.id,
        type: 'rounded_rectangle',
        x: node.x,
        y: node.y,
        width: 160,
        height: 70,
        fill: '#ffffff',
        stroke: '#4262ff',
        strokeWidth: 2,
        strokeStyle: 'solid',
        text: node.label,
        fontSize: 13,
        fontColor: '#050038',
        zIndex: 2,
      });
    });

    elements.push(...arrows);

    onInsertElements(elements);
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.4 } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card mermaid-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2.5">
            <div className="mermaid-icon-badge">
              <Code2 size={22} className="text-white" />
            </div>
            <div>
              <h2 className="modal-title flex items-center gap-2">
                <span>Mermaid & Code Diagram Runner</span>
                <span className="mermaid-badge">Developer Superpower</span>
              </h2>
              <p className="modal-subtitle">
                Paste Mermaid markdown code to compile it into native editable whiteboard shapes.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Template Quick Switcher */}
        <div className="mermaid-templates-row">
          <span className="text-xs font-bold text-slate-500">Quick Templates:</span>
          <div className="flex gap-2">
            {MERMAID_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                className="mermaid-tmpl-btn"
                onClick={() => setCode(tmpl.code)}
              >
                <FileCode size={13} />
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="mermaid-code-editor-wrap">
          <div className="mermaid-editor-header">
            <span>Mermaid Syntax Editor (Flowchart & Sequence)</span>
            <span className="text-[11px] text-slate-400">graph TD / LR</span>
          </div>
          <textarea
            className="mermaid-code-textarea"
            rows={9}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Footer Actions */}
        <div className="mermaid-footer-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary flex items-center gap-2"
            onClick={parseAndInsertMermaid}
          >
            <Play size={15} />
            <span>Compile & Insert into Whiteboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
