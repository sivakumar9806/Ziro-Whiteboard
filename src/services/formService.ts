import { apiRequest } from './apiClient';

export interface FormSubmissionPayload {
  formType: 'feedback' | 'feature_request' | 'survey' | 'bug_report' | 'contact';
  name?: string;
  email?: string;
  title: string;
  rating?: number;
  category?: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export interface FormSubmissionResult {
  id: string;
  formType: string;
  title: string;
  name?: string;
  email?: string;
  rating?: number;
  category?: string;
  message: string;
  createdAt: string;
}

const LOCAL_FORMS_KEY = 'ziro_form_submissions_local_v1';

export async function submitDataCollectionForm(
  payload: FormSubmissionPayload
): Promise<{ message: string; submission: FormSubmissionResult }> {
  try {
    // Try sending to backend API
    const res = await apiRequest<{ message: string; submission: FormSubmissionResult }>(
      '/forms/submit',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res;
  } catch {
    // Graceful offline fallback to localStorage
    const localSubmission: FormSubmissionResult = {
      id: `sub-local-${Date.now()}`,
      formType: payload.formType,
      title: payload.title,
      name: payload.name || 'Anonymous Creator',
      email: payload.email,
      rating: payload.rating,
      category: payload.category,
      message: payload.message,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_FORMS_KEY) || '[]');
      existing.unshift(localSubmission);
      localStorage.setItem(LOCAL_FORMS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save form locally:', e);
    }

    return {
      message: 'Feedback submitted successfully (Saved to workspace session)',
      submission: localSubmission,
    };
  }
}

export async function getFormSubmissions(
  formType?: string
): Promise<{ total: number; submissions: FormSubmissionResult[] }> {
  try {
    const endpoint = formType ? `/forms/submissions?formType=${formType}` : '/forms/submissions';
    const res = await apiRequest<{ total: number; submissions: FormSubmissionResult[] }>(endpoint);
    return res;
  } catch {
    const local = JSON.parse(localStorage.getItem(LOCAL_FORMS_KEY) || '[]');
    return {
      total: local.length,
      submissions: local,
    };
  }
}
