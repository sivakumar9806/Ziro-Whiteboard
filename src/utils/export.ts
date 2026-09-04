import type { BoardState } from '../types/whiteboard';
import { getElementsBounds, getArrowPoints } from './geometry';

/**
 * Exports the board state as a formatted JSON file download.
 */
export function exportToJson(board: BoardState) {
  const jsonStr = JSON.stringify(board, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${board.metadata.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates an uploaded JSON board file.
 */
export function importFromJsonFile(file: File): Promise<BoardState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as BoardState;
        if (parsed && Array.isArray(parsed.elements)) {
          resolve(parsed);
        } else {
          reject(new Error('Invalid board file structure'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Exports the board as a high-resolution PNG image.
 */
export async function exportToPng(board: BoardState, backgroundColor = '#f8fafc'): Promise<void> {
  if (board.elements.length === 0) {
    alert('Canvas is empty. Add elements before exporting!');
    return;
  }

  const bounds = getElementsBounds(board.elements);
  if (!bounds) return;

  const padding = 60;
  const width = Math.max(bounds.width + padding * 2, 400);
  const height = Math.max(bounds.height + padding * 2, 300);
  const scale = 2; // Retina / high quality

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Optional subtle dot grid
  ctx.fillStyle = '#e2e8f0';
  for (let x = 0; x < width; x += 24) {
    for (let y = 0; y < height; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const offsetX = padding - bounds.x;
  const offsetY = padding - bounds.y;

  // Render elements in zIndex order
  const sorted = [...board.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;

    if (el.type === 'sticky') {
      const colors: Record<string, { bg: string; border: string; text: string }> = {
        yellow: { bg: '#fef08a', border: '#fde047', text: '#713f12' },
        coral: { bg: '#fecdd3', border: '#fda4af', text: '#881337' },
        blue: { bg: '#bae6fd', border: '#7dd3fc', text: '#0c4a6e' },
        green: { bg: '#bbf7d0', border: '#86efac', text: '#14532d' },
        purple: { bg: '#e9d5ff', border: '#d8b4fe', text: '#581c87' },
        amber: { bg: '#fed7aa', border: '#fdba74', text: '#7c2d12' },
      };
      const theme = colors[el.colorTheme] || colors.yellow;
      const x = el.x + offsetX;
      const y = el.y + offsetY;

      // Drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      // Rounded sticky note
      ctx.fillStyle = theme.bg;
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, x, y, el.width, el.height, 8);
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';

      // Text inside
      ctx.fillStyle = el.fontColor || theme.text;
      ctx.font = `${el.fontSize || 14}px 'Inter', sans-serif`;
      ctx.textAlign = el.textAlign || 'left';
      drawWrappedText(ctx, el.text, x + 16, y + 24, el.width - 32, 20);
    } else if (el.type === 'rectangle') {
      const x = el.x + offsetX;
      const y = el.y + offsetY;
      ctx.fillStyle = el.fill || '#ffffff';
      ctx.strokeStyle = el.stroke || '#3b82f6';
      ctx.lineWidth = el.strokeWidth || 2;
      if (el.strokeStyle === 'dashed') {
        ctx.setLineDash([8, 6]);
      } else {
        ctx.setLineDash([]);
      }
      drawRoundedRect(ctx, x, y, el.width, el.height, el.borderRadius ?? 8);
      ctx.fill();
      ctx.stroke();

      if (el.text) {
        ctx.setLineDash([]);
        ctx.fillStyle = el.fontColor || '#1e293b';
        ctx.font = `500 ${el.fontSize || 16}px 'Inter', sans-serif`;
        ctx.textAlign = el.textAlign || 'center';
        const tx = el.textAlign === 'left' ? x + 16 : el.textAlign === 'right' ? x + el.width - 16 : x + el.width / 2;
        drawWrappedText(ctx, el.text, tx, y + el.height / 2, el.width - 32, 22, true);
      }
    } else if (el.type === 'circle') {
      const x = el.x + offsetX + el.width / 2;
      const y = el.y + offsetY + el.height / 2;
      const rx = el.width / 2;
      const ry = el.height / 2;

      ctx.fillStyle = el.fill || '#ffffff';
      ctx.strokeStyle = el.stroke || '#3b82f6';
      ctx.lineWidth = el.strokeWidth || 2;
      if (el.strokeStyle === 'dashed') ctx.setLineDash([8, 6]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (el.text) {
        ctx.setLineDash([]);
        ctx.fillStyle = el.fontColor || '#1e293b';
        ctx.font = `500 ${el.fontSize || 16}px 'Inter', sans-serif`;
        ctx.textAlign = el.textAlign || 'center';
        drawWrappedText(ctx, el.text, x, y, el.width - 24, 22, true);
      }
    } else if (el.type === 'arrow') {
      const sx = el.startX + offsetX;
      const sy = el.startY + offsetY;
      const ex = el.endX + offsetX;
      const ey = el.endY + offsetY;

      ctx.strokeStyle = el.stroke || '#64748b';
      ctx.fillStyle = el.stroke || '#64748b';
      ctx.lineWidth = el.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (el.strokeStyle === 'dashed') ctx.setLineDash([8, 6]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Arrowhead
      if (el.arrowHead === 'end' || el.arrowHead === 'both') {
        const { x1, y1, x2, y2 } = getArrowPoints(sx, sy, ex, ey, 14);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();
      }
    } else if (el.type === 'draw') {
      if (el.points.length > 0) {
        ctx.strokeStyle = el.stroke || '#1e293b';
        ctx.lineWidth = el.strokeWidth || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const p0 = el.points[0];
        ctx.moveTo(p0.x + offsetX, p0.y + offsetY);
        for (let i = 1; i < el.points.length; i++) {
          const pt = el.points[i];
          ctx.lineTo(pt.x + offsetX, pt.y + offsetY);
        }
        ctx.stroke();
      }
    } else if (el.type === 'text') {
      const x = el.x + offsetX;
      const y = el.y + offsetY;
      ctx.fillStyle = el.fontColor || '#1e293b';
      ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 16}px 'Inter', sans-serif`;
      ctx.textAlign = el.textAlign || 'left';
      drawWrappedText(ctx, el.text, x, y + (el.fontSize || 16), el.width, (el.fontSize || 16) * 1.3);
    }

    ctx.restore();
  }

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${board.metadata.title.toLowerCase().replace(/\s+/g, '_')}_export.png`;
  a.click();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  centerVertically = false
) {
  if (!text) return;
  const lines = text.split('\n');
  const allLines: string[] = [];

  lines.forEach((line) => {
    const words = line.split(' ');
    let currentLine = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        allLines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    allLines.push(currentLine);
  });

  const startY = centerVertically ? y - ((allLines.length - 1) * lineHeight) / 2 : y;

  allLines.forEach((l, i) => {
    ctx.fillText(l, x, startY + i * lineHeight);
  });
}
