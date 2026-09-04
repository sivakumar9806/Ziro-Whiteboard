import React from 'react';
import { Columns3, Lightbulb, MessageSquarePlus, PlusCircle, X } from 'lucide-react';
import { TEMPLATES } from '../../utils/templates';
import type { BoardTemplate } from '../../utils/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: BoardTemplate | null) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Columns3':
        return <Columns3 size={24} style={{ color: '#3b82f6' }} />;
      case 'Lightbulb':
        return <Lightbulb size={24} style={{ color: '#f59e0b' }} />;
      case 'MessageSquarePlus':
        return <MessageSquarePlus size={24} style={{ color: '#10b981' }} />;
      default:
        return <Lightbulb size={24} style={{ color: '#6366f1' }} />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Choose a Template</h2>
            <p className="modal-subtitle">Start with a pre-built layout or start from a blank canvas</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="templates-grid">
          <div
            className="template-card blank-card"
            onClick={() => {
              onSelectTemplate(null);
              onClose();
            }}
          >
            <div className="template-icon-box blank-icon-box">
              <PlusCircle size={26} style={{ color: '#64748b' }} />
            </div>
            <div className="template-info">
              <span className="template-name">Blank Canvas</span>
              <span className="template-desc">Clean slate for custom ideas and freehand drawing.</span>
            </div>
          </div>

          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="template-card"
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
            >
              <div className="template-icon-box">{getTemplateIcon(tmpl.icon)}</div>
              <div className="template-info">
                <span className="template-category">{tmpl.category}</span>
                <span className="template-name">{tmpl.name}</span>
                <span className="template-desc">{tmpl.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
