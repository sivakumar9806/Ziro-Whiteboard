import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Sparkles,
  Bug,
  ClipboardList,
  Star,
  CheckCircle2,
  Send,
  User as UserIcon,
  Mail,
  Loader2,
} from 'lucide-react';
import type { User } from '../../types/whiteboard';
import { submitDataCollectionForm, type FormSubmissionPayload } from '../../services/formService';
import confetti from 'canvas-confetti';

interface DataCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

type FormCategory = 'feedback' | 'feature_request' | 'survey' | 'bug_report';

export const DataCollectionModal: React.FC<DataCollectionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [formType, setFormType] = useState<FormCategory>('feedback');
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState('UI & Experience');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMessage('Please fill in both the title and message fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const payload: FormSubmissionPayload = {
      formType,
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      title: title.trim(),
      rating,
      category,
      message: message.trim(),
      userId: currentUser.id,
      metadata: {
        submittedAt: new Date().toISOString(),
        clientUserAgent: navigator.userAgent,
      },
    };

    try {
      await submitDataCollectionForm(payload);
      setSubmitting(false);
      setSubmitted(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.4 } });
    } catch (err: any) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit form. Please try again.');
    }
  };

  const handleReset = () => {
    setTitle('');
    setMessage('');
    setSubmitted(false);
    setErrorMessage('');
  };

  const formTabs = [
    { id: 'feedback' as const, label: 'Feedback', icon: <MessageSquare size={16} /> },
    { id: 'feature_request' as const, label: 'Feature Request', icon: <Sparkles size={16} /> },
    { id: 'survey' as const, label: 'Team Survey', icon: <ClipboardList size={16} /> },
    { id: 'bug_report' as const, label: 'Bug Report', icon: <Bug size={16} /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card data-form-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title flex items-center gap-2">
              <span>Forms & Community Feedback</span>
            </h2>
            <p className="modal-subtitle">
              Help us improve Ziro Whiteboard by submitting feedback, ideas, or bug reports.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="form-success-container">
            <CheckCircle2 size={56} className="text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Thank You for Your Feedback!</h3>
            <p className="text-sm text-slate-500 max-w-sm text-center mb-6">
              Your submission has been securely recorded to the backend database. We review community requests to continuously elevate Ziro.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={handleReset}>
                Submit Another Response
              </button>
              <button className="btn-primary" onClick={onClose}>
                Return to Canvas
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Form Type Tabs */}
            <div className="form-tabs-container">
              {formTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`form-tab-btn ${formType === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setFormType(tab.id);
                    setErrorMessage('');
                  }}
                  type="button"
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="form-error-banner">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="data-form-body">
              {/* Star Rating for Feedback & Survey */}
              {(formType === 'feedback' || formType === 'survey') && (
                <div className="form-field-group">
                  <label className="form-field-label">How would you rate your experience?</label>
                  <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="star-rating-btn"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          size={24}
                          fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                          color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-500 ml-2">
                      {rating === 5 && '🌟 Outstanding'}
                      {rating === 4 && '👍 Great'}
                      {rating === 3 && '👌 Good'}
                      {rating === 2 && '😕 Needs Improvement'}
                      {rating === 1 && '⚠️ Poor'}
                    </span>
                  </div>
                </div>
              )}

              {/* Category Selector */}
              <div className="form-field-group">
                <label className="form-field-label">Category</label>
                <select
                  className="form-select-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="UI & Experience">UI, Aesthetics & Themes</option>
                  <option value="Canvas Tools & Shapes">Canvas Tools & Sticky Notes</option>
                  <option value="Realtime & Collaboration">Real-time WebRTC Collaboration</option>
                  <option value="Performance & Speed">Performance & Loading</option>
                  <option value="Export & Integrations">Exporting & File Support</option>
                  <option value="Other">Other / General</option>
                </select>
              </div>

              {/* Title Input */}
              <div className="form-field-group">
                <label className="form-field-label">
                  {formType === 'bug_report'
                    ? 'Issue Summary'
                    : formType === 'feature_request'
                    ? 'Feature Idea Title'
                    : 'Subject / Summary'}
                </label>
                <input
                  type="text"
                  className="form-text-input"
                  placeholder={
                    formType === 'bug_report'
                      ? 'e.g., Sticky note text cursor jumps when typing fast'
                      : formType === 'feature_request'
                      ? 'e.g., Add AI mindmap auto-generation node'
                      : 'e.g., Loving the multi-user meeting timer and live discussion!'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Detailed Description */}
              <div className="form-field-group">
                <label className="form-field-label">
                  {formType === 'bug_report'
                    ? 'Steps to Reproduce / Expected Behavior'
                    : 'Details & Suggestions'}
                </label>
                <textarea
                  className="form-textarea-input"
                  rows={4}
                  placeholder={
                    formType === 'bug_report'
                      ? '1. Open a board...\n2. Click on...\n3. Expected result vs actual result...'
                      : 'Share your thoughts, use cases, or ideas with our engineering team...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Author Info */}
              <div className="form-author-row">
                <div className="form-author-col">
                  <label className="form-field-label">Your Name</label>
                  <div className="input-with-icon">
                    <UserIcon size={14} className="input-icon" />
                    <input
                      type="text"
                      className="form-text-input"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-author-col">
                  <label className="form-field-label">Email (Optional)</label>
                  <div className="input-with-icon">
                    <Mail size={14} className="input-icon" />
                    <input
                      type="email"
                      className="form-text-input"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
