import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Zap,
  Layout,
  GitMerge,
  Lightbulb,
  Workflow,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { CanvasElement, ViewportTransform } from '../../types/whiteboard';
import confetti from 'canvas-confetti';

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewport: ViewportTransform;
  onInsertElements: (elements: CanvasElement[]) => void;
}

interface AIPreset {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  prompt: string;
  description: string;
  generate: (cx: number, cy: number) => CanvasElement[];
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({
  isOpen,
  onClose,
  viewport,
  onInsertElements,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Center coordinate in canvas space
  const centerX = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom);
  const centerY = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom);

  const presets: AIPreset[] = [
    {
      id: 'saas_auth_flow',
      title: 'SaaS Authentication & Onboarding Flow',
      category: 'Architecture',
      icon: <GitMerge size={16} className="text-blue-500" />,
      prompt: 'Build a secure SaaS Authentication, JWT verification, and User Onboarding workflow architecture',
      description: 'Connected frontend, API gateway, auth server, database, and email verification nodes.',
      generate: (cx, cy) => {
        const now = Date.now();
        const frame: CanvasElement = {
          id: `ai-frame-${now}`,
          type: 'frame',
          x: cx - 450,
          y: cy - 250,
          width: 900,
          height: 500,
          title: '🚀 SaaS Authentication & Onboarding Architecture (AI Generated)',
          fill: 'rgba(238, 242, 255, 0.4)',
          stroke: '#818cf8',
          zIndex: 1,
        };

        const node1: CanvasElement = {
          id: `ai-n1-${now}`,
          type: 'rounded_rectangle',
          x: cx - 400,
          y: cy - 50,
          width: 150,
          height: 80,
          fill: '#eff6ff',
          stroke: '#3b82f6',
          strokeWidth: 2,
          strokeStyle: 'solid',
          text: '🌐 Client Web App\n(Sign In / Sign Up)',
          fontSize: 13,
          fontColor: '#1e3a8a',
          zIndex: 2,
        };

        const node2: CanvasElement = {
          id: `ai-n2-${now}`,
          type: 'rounded_rectangle',
          x: cx - 180,
          y: cy - 50,
          width: 150,
          height: 80,
          fill: '#f0fdf4',
          stroke: '#22c55e',
          strokeWidth: 2,
          strokeStyle: 'solid',
          text: '🛡️ API Gateway\n(Rate Limit & CORS)',
          fontSize: 13,
          fontColor: '#14532d',
          zIndex: 2,
        };

        const node3: CanvasElement = {
          id: `ai-n3-${now}`,
          type: 'diamond',
          x: cx + 40,
          y: cy - 65,
          width: 130,
          height: 110,
          fill: '#fef3c7',
          stroke: '#f59e0b',
          strokeWidth: 2,
          strokeStyle: 'solid',
          text: '🔐 Validate\nJWT Token?',
          fontSize: 12,
          fontColor: '#78350f',
          zIndex: 2,
        };

        const node4: CanvasElement = {
          id: `ai-n4-${now}`,
          type: 'rounded_rectangle',
          x: cx + 240,
          y: cy - 140,
          width: 160,
          height: 80,
          fill: '#ecfdf5',
          stroke: '#10b981',
          strokeWidth: 2,
          strokeStyle: 'solid',
          text: '✅ Session Granted\n(Access Dashboard)',
          fontSize: 13,
          fontColor: '#064e3b',
          zIndex: 2,
        };

        const node5: CanvasElement = {
          id: `ai-n5-${now}`,
          type: 'rounded_rectangle',
          x: cx + 240,
          y: cy + 40,
          width: 160,
          height: 80,
          fill: '#fef2f2',
          stroke: '#ef4444',
          strokeWidth: 2,
          strokeStyle: 'solid',
          text: '❌ 401 Unauthorized\n(Prompt Sign In)',
          fontSize: 13,
          fontColor: '#7f1d1d',
          zIndex: 2,
        };

        // Connecting Arrows
        const a1: CanvasElement = {
          id: `ai-a1-${now}`,
          type: 'arrow',
          startX: cx - 250,
          startY: cy - 10,
          endX: cx - 180,
          endY: cy - 10,
          x: cx - 250,
          y: cy - 10,
          width: 70,
          height: 20,
          stroke: '#3b82f6',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowHead: 'end',
          zIndex: 3,
        };

        const a2: CanvasElement = {
          id: `ai-a2-${now}`,
          type: 'arrow',
          startX: cx - 30,
          startY: cy - 10,
          endX: cx + 40,
          endY: cy - 10,
          x: cx - 30,
          y: cy - 10,
          width: 70,
          height: 20,
          stroke: '#22c55e',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowHead: 'end',
          zIndex: 3,
        };

        const a3: CanvasElement = {
          id: `ai-a3-${now}`,
          type: 'arrow',
          startX: cx + 170,
          startY: cy - 30,
          endX: cx + 240,
          endY: cy - 100,
          x: cx + 170,
          y: cy - 100,
          width: 70,
          height: 70,
          stroke: '#10b981',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowHead: 'end',
          text: 'Yes',
          zIndex: 3,
        };

        const a4: CanvasElement = {
          id: `ai-a4-${now}`,
          type: 'arrow',
          startX: cx + 170,
          startY: cy + 10,
          endX: cx + 240,
          endY: cy + 80,
          x: cx + 170,
          y: cy + 10,
          width: 70,
          height: 70,
          stroke: '#ef4444',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowHead: 'end',
          text: 'No',
          zIndex: 3,
        };

        return [frame, node1, node2, node3, node4, node5, a1, a2, a3, a4];
      },
    },
    {
      id: 'agile_sprint_retro',
      title: 'Agile 2-Week Sprint Retrospective',
      category: 'Agile & Team',
      icon: <Workflow size={16} className="text-emerald-500" />,
      prompt: 'Generate a 3-column Sprint Retrospective board with sticky notes for What Went Well, What to Improve, and Action Items',
      description: 'Color-coded columns with structured agile sticky notes.',
      generate: (cx, cy) => {
        const now = Date.now();
        const frame: CanvasElement = {
          id: `ai-frame-${now}`,
          type: 'frame',
          x: cx - 420,
          y: cy - 240,
          width: 840,
          height: 480,
          title: '🔄 Agile Sprint 24 Retrospective (AI Generated)',
          fill: 'rgba(240, 253, 244, 0.4)',
          stroke: '#86efac',
          zIndex: 1,
        };

        const stickies: CanvasElement[] = [
          // Column 1: What Went Well (Green)
          {
            id: `ai-s1-${now}`,
            type: 'sticky',
            x: cx - 380,
            y: cy - 160,
            width: 180,
            height: 120,
            colorTheme: 'green',
            text: '🌟 Shipped WebRTC Realtime collaboration ahead of schedule!',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          {
            id: `ai-s2-${now}`,
            type: 'sticky',
            x: cx - 380,
            y: cy - 20,
            width: 180,
            height: 120,
            colorTheme: 'green',
            text: '⚡ Zero build errors on automated Netlify deployment.',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          // Column 2: What Can Improve (Yellow/Pink)
          {
            id: `ai-s3-${now}`,
            type: 'sticky',
            x: cx - 100,
            y: cy - 160,
            width: 180,
            height: 120,
            colorTheme: 'yellow',
            text: '⚠️ Need better mobile touch gestures on pinch-to-zoom.',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          {
            id: `ai-s4-${now}`,
            type: 'sticky',
            x: cx - 100,
            y: cy - 20,
            width: 180,
            height: 120,
            colorTheme: 'pink',
            text: '💡 Add automatic sticky note clustering by tags.',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          // Column 3: Action Items (Blue)
          {
            id: `ai-s5-${now}`,
            type: 'sticky',
            x: cx + 180,
            y: cy - 160,
            width: 180,
            height: 120,
            colorTheme: 'blue',
            text: '🎯 [Alex] Add export to SVG vector alongside PNG.',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          {
            id: `ai-s6-${now}`,
            type: 'sticky',
            x: cx + 180,
            y: cy - 20,
            width: 180,
            height: 120,
            colorTheme: 'blue',
            text: '🎯 [Sarah] Implement 1-click Mermaid code runner.',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
        ];

        return [frame, ...stickies];
      },
    },
    {
      id: 'ai_mindmap_studio',
      title: 'AI Mindmap & Concept Tree',
      category: 'Brainstorming',
      icon: <Lightbulb size={16} className="text-amber-500" />,
      prompt: 'Create a central concept mindmap with 4 branching categories and sub-ideas',
      description: 'Radial thought map with central hub and connecting arrows.',
      generate: (cx, cy) => {
        const now = Date.now();
        const centerNode: CanvasElement = {
          id: `ai-c1-${now}`,
          type: 'circle',
          x: cx - 80,
          y: cy - 50,
          width: 160,
          height: 100,
          fill: '#4262ff',
          stroke: '#1e3a8a',
          strokeWidth: 3,
          strokeStyle: 'solid',
          text: '🚀 Product\nInnovation 2026',
          fontSize: 14,
          fontColor: '#ffffff',
          zIndex: 3,
        };

        const branches: CanvasElement[] = [
          // Top Branch
          {
            id: `ai-b1-${now}`,
            type: 'rounded_rectangle',
            x: cx - 100,
            y: cy - 220,
            width: 200,
            height: 60,
            fill: '#eff6ff',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '🤖 AI Whiteboard Copilot',
            fontSize: 13,
            fontColor: '#1e40af',
            zIndex: 2,
          },
          // Right Branch
          {
            id: `ai-b2-${now}`,
            type: 'rounded_rectangle',
            x: cx + 180,
            y: cy - 30,
            width: 200,
            height: 60,
            fill: '#f0fdf4',
            stroke: '#22c55e',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '⚡ Real-time WebRTC Mesh',
            fontSize: 13,
            fontColor: '#166534',
            zIndex: 2,
          },
          // Bottom Branch
          {
            id: `ai-b3-${now}`,
            type: 'rounded_rectangle',
            x: cx - 100,
            y: cy + 160,
            width: 200,
            height: 60,
            fill: '#faf5ff',
            stroke: '#a855f7',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '🎙️ Voice Memo Pins',
            fontSize: 13,
            fontColor: '#6b21a8',
            zIndex: 2,
          },
          // Left Branch
          {
            id: `ai-b4-${now}`,
            type: 'rounded_rectangle',
            x: cx - 380,
            y: cy - 30,
            width: 200,
            height: 60,
            fill: '#fffbeb',
            stroke: '#f59e0b',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '📊 Live Mermaid Engine',
            fontSize: 13,
            fontColor: '#92400e',
            zIndex: 2,
          },
        ];

        // Connectors
        const arrows: CanvasElement[] = [
          {
            id: `ai-ca1-${now}`,
            type: 'arrow',
            startX: cx,
            startY: cy - 50,
            endX: cx,
            endY: cy - 160,
            x: cx - 10,
            y: cy - 160,
            width: 20,
            height: 110,
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowHead: 'end',
            zIndex: 2,
          },
          {
            id: `ai-ca2-${now}`,
            type: 'arrow',
            startX: cx + 80,
            startY: cy,
            endX: cx + 180,
            endY: cy,
            x: cx + 80,
            y: cy - 10,
            width: 100,
            height: 20,
            stroke: '#22c55e',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowHead: 'end',
            zIndex: 2,
          },
          {
            id: `ai-ca3-${now}`,
            type: 'arrow',
            startX: cx,
            startY: cy + 50,
            endX: cx,
            endY: cy + 160,
            x: cx - 10,
            y: cy + 50,
            width: 20,
            height: 110,
            stroke: '#a855f7',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowHead: 'end',
            zIndex: 2,
          },
          {
            id: `ai-ca4-${now}`,
            type: 'arrow',
            startX: cx - 80,
            startY: cy,
            endX: cx - 180,
            endY: cy,
            x: cx - 180,
            y: cy - 10,
            width: 100,
            height: 20,
            stroke: '#f59e0b',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowHead: 'end',
            zIndex: 2,
          },
        ];

        return [centerNode, ...branches, ...arrows];
      },
    },
    {
      id: 'swot_matrix',
      title: 'SWOT 4-Quadrant Strategic Analysis',
      category: 'Business & Strategy',
      icon: <Layout size={16} className="text-purple-500" />,
      prompt: 'Generate a 4-Quadrant SWOT Matrix for Strengths, Weaknesses, Opportunities, and Threats',
      description: 'Structured 2x2 strategic analysis grid.',
      generate: (cx, cy) => {
        const now = Date.now();
        const frame: CanvasElement = {
          id: `ai-frame-${now}`,
          type: 'frame',
          x: cx - 380,
          y: cy - 240,
          width: 760,
          height: 480,
          title: '🎯 Strategic SWOT Analysis Matrix (AI Generated)',
          fill: 'rgba(248, 250, 252, 0.6)',
          stroke: '#cbd5e1',
          zIndex: 1,
        };

        const quadrants: CanvasElement[] = [
          // Strengths (Green)
          {
            id: `ai-sw1-${now}`,
            type: 'rectangle',
            x: cx - 350,
            y: cy - 190,
            width: 320,
            height: 180,
            fill: '#f0fdf4',
            stroke: '#22c55e',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '💪 STRENGTHS\n• Fast WebRTC real-time sync\n• Built-in AI generation\n• Neon laser pointer & voice pins',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          // Weaknesses (Red)
          {
            id: `ai-sw2-${now}`,
            type: 'rectangle',
            x: cx + 30,
            y: cy - 190,
            width: 320,
            height: 180,
            fill: '#fef2f2',
            stroke: '#ef4444',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '⚠️ WEAKNESSES\n• New platform brand awareness\n• Third-party plugin marketplace\n• Custom desktop apps',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          // Opportunities (Blue)
          {
            id: `ai-sw3-${now}`,
            type: 'rectangle',
            x: cx - 350,
            y: cy + 20,
            width: 320,
            height: 180,
            fill: '#eff6ff',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '🚀 OPPORTUNITIES\n• Free alternative to costly Miro plans\n• Developer-first Mermaid integrations\n• Remote engineering workshops',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
          // Threats (Amber)
          {
            id: `ai-sw4-${now}`,
            type: 'rectangle',
            x: cx + 30,
            y: cy + 20,
            width: 320,
            height: 180,
            fill: '#fffbeb',
            stroke: '#f59e0b',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '🛡️ THREATS\n• Legacy corporate tool contracts\n• Competitor feature parity\n• Fast evolving AI ecosystems',
            fontSize: 13,
            textAlign: 'left',
            zIndex: 2,
          },
        ];

        return [frame, ...quadrants];
      },
    },
  ];

  const handleGenerateCustom = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const now = Date.now();
      const lower = prompt.toLowerCase();
      let generated: CanvasElement[] = [];

      // 1. Specific shape / element requests
      if (lower.includes('round') || lower.includes('box') || lower.includes('rectangle')) {
        generated = [
          {
            id: `ai-rnd-${now}`,
            type: 'rounded_rectangle',
            x: centerX - 120,
            y: centerY - 60,
            width: 240,
            height: 120,
            fill: '#eff6ff',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: `✨ ${prompt}`,
            fontSize: 14,
            fontColor: '#1e3a8a',
            zIndex: 2,
          },
        ];
      } else if (lower.includes('circle') || lower.includes('oval')) {
        generated = [
          {
            id: `ai-circ-${now}`,
            type: 'circle',
            x: centerX - 80,
            y: centerY - 80,
            width: 160,
            height: 160,
            fill: '#f0fdf4',
            stroke: '#22c55e',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: `🎯 ${prompt}`,
            fontSize: 14,
            fontColor: '#14532d',
            zIndex: 2,
          },
        ];
      } else if (lower.includes('sticky') || lower.includes('note')) {
        generated = [
          {
            id: `ai-stk-${now}`,
            type: 'sticky',
            x: centerX - 100,
            y: centerY - 90,
            width: 200,
            height: 180,
            colorTheme: 'yellow',
            text: `💡 ${prompt}`,
            fontSize: 14,
            textAlign: 'left',
            zIndex: 2,
          },
        ];
      } else if (lower.includes('diamond') || lower.includes('decision')) {
        generated = [
          {
            id: `ai-dia-${now}`,
            type: 'diamond',
            x: centerX - 80,
            y: centerY - 70,
            width: 160,
            height: 140,
            fill: '#fef3c7',
            stroke: '#f59e0b',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: `❓ ${prompt}`,
            fontSize: 13,
            fontColor: '#78350f',
            zIndex: 2,
          },
        ];
      } else if (lower.includes('mindmap') || lower.includes('concept') || lower.includes('ideas')) {
        // Radial mindmap
        const centerNode: CanvasElement = {
          id: `ai-mm-c-${now}`,
          type: 'circle',
          x: centerX - 80,
          y: centerY - 50,
          width: 160,
          height: 100,
          fill: '#4262ff',
          stroke: '#1e3a8a',
          strokeWidth: 3,
          strokeStyle: 'solid',
          text: `🎯 ${prompt.slice(0, 30)}`,
          fontSize: 14,
          fontColor: '#ffffff',
          zIndex: 3,
        };
        const branchTitles = ['Strategy & Goals', 'Execution Plan', 'User Experience', 'Key Metrics'];
        const branchNodes: CanvasElement[] = branchTitles.map((title, i) => {
          const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
          const dist = 200;
          const bx = centerX + Math.cos(angles[i]) * dist - 80;
          const by = centerY + Math.sin(angles[i]) * dist - 30;
          return {
            id: `ai-mm-b${i}-${now}`,
            type: 'rounded_rectangle',
            x: bx,
            y: by,
            width: 160,
            height: 60,
            fill: '#f8fafc',
            stroke: '#64748b',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: title,
            fontSize: 12,
            fontColor: '#1e293b',
            zIndex: 2,
          };
        });
        const branchArrows: CanvasElement[] = branchNodes.map((bn, i) => ({
          id: `ai-mm-a${i}-${now}`,
          type: 'arrow',
          startX: centerX,
          startY: centerY,
          endX: bn.x + 80,
          endY: bn.y + 30,
          x: Math.min(centerX, bn.x + 80),
          y: Math.min(centerY, bn.y + 30),
          width: Math.abs(centerX - (bn.x + 80)) || 10,
          height: Math.abs(centerY - (bn.y + 30)) || 10,
          stroke: '#64748b',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowHead: 'end',
          zIndex: 2,
        }));
        generated = [centerNode, ...branchNodes, ...branchArrows];
      } else {
        // Multi-node connected flow
        const frame: CanvasElement = {
          id: `ai-custom-frame-${now}`,
          type: 'frame',
          x: centerX - 360,
          y: centerY - 200,
          width: 720,
          height: 400,
          title: `🤖 AI Flow: "${prompt.slice(0, 35)}"`,
          fill: 'rgba(240, 245, 255, 0.5)',
          stroke: '#4262ff',
          zIndex: 1,
        };

        const nodes: CanvasElement[] = [
          {
            id: `ai-cn1-${now}`,
            type: 'rounded_rectangle',
            x: centerX - 320,
            y: centerY - 40,
            width: 180,
            height: 80,
            fill: '#eff6ff',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: `📥 1. Input / Trigger\n(${prompt.slice(0, 22)})`,
            fontSize: 13,
            fontColor: '#1e3a8a',
            zIndex: 2,
          },
          {
            id: `ai-cn2-${now}`,
            type: 'diamond',
            x: centerX - 70,
            y: centerY - 55,
            width: 140,
            height: 110,
            fill: '#fef3c7',
            stroke: '#f59e0b',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '⚙️ 2. Process &\nEvaluate Logic',
            fontSize: 12,
            fontColor: '#78350f',
            zIndex: 2,
          },
          {
            id: `ai-cn3-${now}`,
            type: 'rounded_rectangle',
            x: centerX + 140,
            y: centerY - 40,
            width: 180,
            height: 80,
            fill: '#f0fdf4',
            stroke: '#22c55e',
            strokeWidth: 2,
            strokeStyle: 'solid',
            text: '🎯 3. Output Goal\n(Action Complete)',
            fontSize: 13,
            fontColor: '#14532d',
            zIndex: 2,
          },
        ];

        const arrows: CanvasElement[] = [
          {
            id: `ai-ca1-${now}`,
            type: 'arrow',
            startX: centerX - 140,
            startY: centerY,
            endX: centerX - 70,
            endY: centerY,
            x: centerX - 140,
            y: centerY - 10,
            width: 70,
            height: 20,
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowHead: 'end',
            zIndex: 3,
          },
          {
            id: `ai-ca2-${now}`,
            type: 'arrow',
            startX: centerX + 70,
            startY: centerY,
            endX: centerX + 140,
            endY: centerY,
            x: centerX + 70,
            y: centerY - 10,
            width: 70,
            height: 20,
            stroke: '#22c55e',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowHead: 'end',
            zIndex: 3,
          },
        ];

        generated = [frame, ...nodes, ...arrows];
      }

      setIsGenerating(false);
      onInsertElements(generated);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
      onClose();
    }, 400);
  };

  const handleApplyPreset = (preset: AIPreset) => {
    setSelectedPresetId(preset.id);
    setIsGenerating(true);

    setTimeout(() => {
      const elements = preset.generate(centerX, centerY);
      setIsGenerating(false);
      onInsertElements(elements);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
      onClose();
    }, 400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card ai-studio-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2.5">
            <div className="ai-icon-badge">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h2 className="modal-title flex items-center gap-2">
                <span>Ziro AI Whiteboard Studio</span>
                <span className="ai-studio-pill">Superpower</span>
              </h2>
              <p className="modal-subtitle">
                Instant Prompt-to-Diagram generator. Type an idea or pick a blueprint below.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Custom Prompt Box */}
        <div className="ai-prompt-box">
          <div className="ai-prompt-input-row">
            <Sparkles size={18} className="text-blue-500 flex-shrink-0" />
            <input
              type="text"
              className="ai-prompt-input"
              placeholder="e.g. Microservices payment architecture, Customer onboarding flow, Sprint retro..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateCustom();
              }}
              autoFocus
            />
            <button
              type="button"
              className="ai-generate-btn"
              onClick={handleGenerateCustom}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating && !selectedPresetId ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <Zap size={15} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Blueprints Title */}
        <div className="ai-presets-header">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Or Choose from Instant AI Blueprints:
          </span>
        </div>

        {/* Presets Grid */}
        <div className="ai-presets-grid">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className={`ai-preset-card ${selectedPresetId === preset.id ? 'active' : ''}`}
              onClick={() => handleApplyPreset(preset)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="ai-preset-icon-wrap">{preset.icon}</div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                    {preset.category}
                  </span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">{preset.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{preset.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
