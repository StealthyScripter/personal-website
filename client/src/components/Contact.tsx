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
              <div className="contact-icon"></div>
              <span>brian@wendot.com</span>
            </div>
            <div className="contact-method">
              <div className="contact-icon"></div>
              <span>Durham, North Carolina</span>
            </div>
            <div className="contact-method">
              <div className="contact-icon"></div>
              <span>Available for remote work</span>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
