'use client';
import { useState } from 'react';
import { Arrow } from '@/components/ui/Arrow';

export function ConversationForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const fieldError = (name: string) => errors[name]?.length ? <span id={`contact-${name}-error`} className="field-error">{errors[name].join(' ')}</span> : null;
  const fieldProps = (name: string) => ({ 'aria-invalid': !!errors[name]?.length, 'aria-describedby': errors[name]?.length ? `contact-${name}-error` : undefined });
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setStatus('sending'); setFeedback(''); setErrors({});
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok || data.accepted !== true) { setErrors(data.fields || {}); throw new Error(data.error || 'Your message could not be accepted. Please try again.'); }
      setStatus('success'); setFeedback('Your message has been received. Thank you for getting in touch.'); form.reset();
    } catch (error) { setStatus('error'); setFeedback(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The connection timed out. Your message may have arrived; please wait before retrying.'); }
  }
  return <form className="conversation-form" onSubmit={submit} aria-busy={status === 'sending'}>
    <div className="form-pair"><label>Name<input name="name" autoComplete="name" maxLength={100} required {...fieldProps('name')} />{fieldError('name')}</label><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required {...fieldProps('email')} />{fieldError('email')}</label></div>
    <label>Subject <span className="subtle">(optional)</span><input name="subject" maxLength={200} {...fieldProps('subject')} />{fieldError('subject')}</label>
    <label>Message<textarea name="message" rows={5} minLength={10} maxLength={5000} required {...fieldProps('message')} />{fieldError('message')}</label>
    <div className="honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <button className="button button-primary" disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Sending…' : 'Send message'}<Arrow /></button>
    <p className={`form-feedback ${status}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite">{feedback}</p>
  </form>;
}
