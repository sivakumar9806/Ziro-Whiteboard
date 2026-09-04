import React from 'react';
import type { CollaboratorPresence } from '../../types/whiteboard';

interface CollaboratorCursorsProps {
  collaborators: CollaboratorPresence[];
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({ collaborators }) => {
  return (
    <div className="collaborator-cursors-layer" style={{ pointerEvents: 'none' }}>
      {collaborators.map((collab) => {
        const color = collab.user.avatarColor || '#3b82f6';

        return (
          <div
            key={collab.id}
            className="collaborator-cursor"
            style={{
              position: 'absolute',
              left: `${collab.cursor.x}px`,
              top: `${collab.cursor.y}px`,
              transform: 'translate(-2px, -2px)',
              transition: 'left 0.08s ease-out, top 0.08s ease-out',
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          >
            {/* Miro-style sleek cursor pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={color}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>

            {/* Name Tag Badge */}
            <div
              className="collaborator-name-badge"
              style={{
                backgroundColor: color,
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                position: 'absolute',
                left: '14px',
                top: '14px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{collab.user.name}</span>
              {collab.isSimulated && (
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    fontSize: '9px',
                  }}
                >
                  AI Sim
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
