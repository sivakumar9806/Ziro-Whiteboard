import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Lock, Sparkles, LogOut } from 'lucide-react';
import type { User } from '../../types/whiteboard';
import { DEMO_USERS, loginUser, signupUser, logoutUser } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChange: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const isGuest = currentUser.id === 'user-guest';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (tab === 'login') {
      const logged = loginUser(email);
      onUserChange(logged);
    } else {
      const signed = signupUser(name || 'Anonymous Creator', email);
      onUserChange(signed);
    }
    onClose();
  };

  const handleSelectDemo = (demoUser: User) => {
    const user = loginUser(demoUser.email);
    onUserChange(user);
    onClose();
  };

  const handleLogout = () => {
    const guest = logoutUser();
    onUserChange(guest);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card auth-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div
              className="user-profile-avatar-large"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="modal-title">{isGuest ? 'Welcome to MiroBoard' : currentUser.name}</h2>
              <p className="modal-subtitle">
                {isGuest ? 'Sign in to access and manage your personal boards' : currentUser.email}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* If logged in as non-guest, show profile card with switch account or logout */}
        {!isGuest && (
          <div className="profile-active-box">
            <div className="profile-badge-row">
              <span className="profile-role-tag">{currentUser.roleTitle || 'Member'}</span>
              <span className="text-xs text-slate-500">Active Workspace Session</span>
            </div>
            <button className="auth-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* Quick Demo Switcher */}
        <div className="demo-accounts-section">
          <div className="demo-title-row">
            <Sparkles size={14} className="text-amber-500" />
            <span>Switch / Test With Demo Accounts:</span>
          </div>
          <div className="demo-users-grid">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                className={`demo-user-card ${currentUser.id === demo.id ? 'active' : ''}`}
                onClick={() => handleSelectDemo(demo)}
              >
                <div
                  className="demo-avatar-circle"
                  style={{ backgroundColor: demo.avatarColor }}
                >
                  {demo.name.charAt(0)}
                </div>
                <div className="demo-user-text">
                  <span className="demo-name">{demo.name}</span>
                  <span className="demo-role">{demo.roleTitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-divider-line">
          <span>Or sign in with custom account</span>
        </div>

        {/* Tab switch */}
        <div className="auth-tab-switch">
          <button
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'signup' && (
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <UserIcon size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
