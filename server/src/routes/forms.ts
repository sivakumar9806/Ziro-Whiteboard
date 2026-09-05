import { Router, Request, Response } from 'express';
import { loadDatabase, saveDatabase, FormSubmissionRecord } from '../db.js';

const router = Router();

// POST /api/forms/submit
router.post('/submit', (req: Request, res: Response) => {
  try {
    const { formType, name, email, title, rating, category, message, metadata, userId } = req.body;

    if (!formType || !title || !message) {
      res.status(400).json({ error: 'Form type, title, and message are required' });
      return;
    }

    const db = loadDatabase();

    const submission: FormSubmissionRecord = {
      id: `sub-${Date.now()}`,
      userId: userId || undefined,
      formType: formType || 'feedback',
      name: name?.trim() || 'Anonymous Collaborator',
      email: email?.trim() || undefined,
      title: title.trim(),
      rating: typeof rating === 'number' ? rating : 5,
      category: category || 'General',
      message: message.trim(),
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    db.formSubmissions.unshift(submission);
    saveDatabase(db);

    res.status(201).json({
      message: 'Form submitted successfully',
      submission,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Failed to process form submission' });
  }
});

// GET /api/forms/submissions
router.get('/submissions', (req: Request, res: Response) => {
  try {
    const db = loadDatabase();
    const formType = req.query.formType as string;

    const submissions = formType
      ? db.formSubmissions.filter((s) => s.formType === formType)
      : db.formSubmissions;

    res.json({
      total: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// DELETE /api/forms/submissions/:id
router.delete('/submissions/:id', (req: Request, res: Response) => {
  try {
    const db = loadDatabase();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const index = db.formSubmissions.findIndex((s) => s.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const deleted = db.formSubmissions.splice(index, 1)[0];
    saveDatabase(db);

    res.json({ message: 'Submission deleted', submission: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

export default router;
