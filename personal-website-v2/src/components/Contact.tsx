import ContactForm from './ContactForm';

export default function Contact() {
  return (
    <section id="contact">
      <h2 className="section-title">Let&#39;s Build Something Amazing</h2>
      <p className="section-subtitle">
        Ready to bring your ideas to life? Let&#39;s discuss your next project
      </p>
      <div className="contact-content">
        <div className="contact-info">
          <h3>Get In Touch</h3>
          <p>
            I&#39;m always open to discussing new opportunities, creative projects, 
            and innovative solutions. Whether you&#39;re a startup or an established company, 
            let&#39;s explore how we can work together.
          </p>
          <div className="contact-methods">
            <div className="contact-method">
              <div className="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <span>koringo.w.brian@gmail.com</span>
            </div>
            <div className="contact-method">
              <div className="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span>Durham, North Carolina</span>
            </div>
            <div className="contact-method">
              <div className="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <span>Available for remote work</span>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
