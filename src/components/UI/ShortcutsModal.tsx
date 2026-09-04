import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Tools',
      items: [
        { label: 'Select Tool', key: 'V' },
        { label: 'Hand / Pan Tool', key: 'H' },
        { label: 'Sticky Note', key: 'S' },
        { label: 'Rectangle Shape', key: 'R' },
        { label: 'Circle Shape', key: 'O' },
        { label: 'Arrow Connection', key: 'A' },
        { label: 'Freehand Pen', key: 'P' },
        { label: 'Text Box', key: 'T' },
        { label: 'Eraser', key: 'E' },
      ],
    },
    {
      title: 'Navigation & View',
      items: [
        { label: 'Pan Canvas', key: 'Space + Drag' },
        { label: 'Zoom In / Out', key: 'Wheel / Pinch' },
        { label: 'Zoom In', key: 'Ctrl + +' },
        { label: 'Zoom Out', key: 'Ctrl + -' },
        { label: 'Reset Zoom (100%)', key: 'Ctrl + 0' },
      ],
    },
    {
      title: 'Editing & Actions',
      items: [
        { label: 'Undo', key: 'Ctrl + Z' },
        { label: 'Redo', key: 'Ctrl + Y / Shift+Z' },
        { label: 'Select All', key: 'Ctrl + A' },
        { label: 'Duplicate', key: 'Ctrl + D' },
        { label: 'Delete Selected', key: 'Delete / Backspace' },
        { label: 'Multi-select', key: 'Shift + Click' },
        { label: 'Cancel / Deselect', key: 'Escape' },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-card shortcuts-modal-card">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Keyboard className="text-blue-500" size={22} />
            <h2 className="modal-title">Keyboard Shortcuts</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="shortcuts-content-grid">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="shortcut-group-card">
              <h3 className="shortcut-group-title">{group.title}</h3>
              <div className="shortcut-list">
                {group.items.map((item) => (
                  <div key={item.label} className="shortcut-row">
                    <span className="shortcut-label">{item.label}</span>
                    <kbd className="shortcut-kbd">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
