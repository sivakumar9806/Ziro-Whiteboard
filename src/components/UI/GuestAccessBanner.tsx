import React, { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface GuestAccessBannerProps {
  onOpenAuth: () => void;
}

export const GuestAccessBanner: React.FC<GuestAccessBannerProps> = ({ onOpenAuth }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="ziro-guest-banner" role="banner">
      <div className="ziro-guest-banner-content">
        <div className="ziro-guest-banner-tag">
          <Sparkles size={13} className="text-amber-400" />
          <span>Guest Preview Mode</span>
        </div>
        <p className="ziro-guest-banner-text">
          You are exploring Ziro with preview features. <strong>Sign in</strong> or <strong>Create a free account</strong> to unlock unlimited boards, cloud auto-save, live collaboration & exports!
        </p>
      </div>

      <div className="ziro-guest-banner-actions">
        <button
          type="button"
          className="ziro-guest-banner-cta"
          onClick={onOpenAuth}
        >
          <span>Unlock Full Access</span>
          <ArrowRight size={14} />
        </button>
        <button
          type="button"
          className="ziro-guest-banner-close"
          onClick={() => setDismissed(true)}
          title="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
