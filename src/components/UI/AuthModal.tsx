import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Sparkles,
  LogOut,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Briefcase,
} from 'lucide-react';
import type { User } from '../../types/whiteboard';
import {
  DEMO_USERS,
  loginUserApi,
  signupUserApi,
  logoutUser,
} from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChange: (user: User) => void;
}

const ROLES = [
  'Product Designer',
  'Software Engineer',
  'Product Manager',
  'Agile Coach / Scrum Master',
  'Educator / Student',
  'Freelance Creator',
];

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
  const [roleTitle, setRoleTitle] = useState(ROLES[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const isGuest = currentUser.id === 'user-guest';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (tab === 'login') {
        const logged = await loginUserApi(email, password);
        onUserChange(logged);
        setSuccessMessage(`Welcome back, ${logged.name}!`);
      } else {
        const signed = await signupUserApi(
          name || 'Anonymous Creator',
          email,
          password,
          roleTitle
        );
        onUserChange(signed);
        setSuccessMessage(`Account created successfully! Welcome to Ziro.`);
      }
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSelectDemo = async (demoUser: User) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const user = await loginUserApi(demoUser.email, 'password123');
      onUserChange(user);
      setLoading(false);
      onClose();
    } catch {
      onUserChange(demoUser);
      setLoading(false);
      onClose();
    }
  };

  const handleLogout = () => {
    const guest = logoutUser();
    onUserChange(guest);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
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
              <h2 className="modal-title">{isGuest ? 'Welcome to Ziro' : currentUser.name}</h2>
              <p className="modal-subtitle">
                {isGuest ? 'Sign in to access, cloud-sync, and manage your whiteboards' : currentUser.email}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
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
            <button className="auth-logout-btn" onClick={handleLogout} type="button">
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* Quick Demo Switcher */}
        <div className="demo-accounts-section">
          <div className="demo-title-row">
            <Sparkles size={14} className="text-amber-500" />
            <span>1-Click Test with Demo Accounts:</span>
          </div>
          <div className="demo-users-grid">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                className={`demo-user-card ${currentUser.id === demo.id ? 'active' : ''}`}
                onClick={() => handleSelectDemo(demo)}
                disabled={loading}
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
          <span>Or sign in with custom credentials</span>
        </div>

        {/* Tab switch */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setErrorMessage('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup');
              setErrorMessage('');
            }}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="form-error-banner flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="form-success-banner flex items-center gap-2">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'signup' && (
            <>
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

              <div className="form-field">
                <label className="form-label">Role / Specialty</label>
                <div className="input-with-icon">
                  <Briefcase size={16} className="input-icon" />
                  <select
                    className="form-input"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
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
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((p) => !p)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : tab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account & Start Creating'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
