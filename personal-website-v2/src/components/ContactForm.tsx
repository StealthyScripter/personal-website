'use client'
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, email, subject, message } = formData;
    const mailtoSubject = encodeURIComponent(subject || `Portfolio Contact from ${name}`);
    const mailtoBody = encodeURIComponent(
      `Hi Brian,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`
    );
    
    window.open(
      `mailto:koringo.w.brian@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`,
      '_self'
    );
    
    setStatus('sent');
    setTimeout(() => {
      setStatus('idle');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="contact-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="e.g John Doe" 
            required 
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="e.g john.doe@email.com" 
            required 
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            placeholder="What's this about?" 
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea 
            id="message" 
            name="message" 
            placeholder="Tell me about your project or idea..." 
            required
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: "100%" }}
          disabled={status === 'sending'}
        >
          {status === 'sent' ? 'Opening Email Client...' : 'Send Message'}
        </button>
        {status === 'sent' && (
          <p className="form-success">Your email client should open shortly.</p>
        )}
      </form>
    </div>
  );
}
