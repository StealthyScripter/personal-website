export default function ContactForm() {
  return (
    <div className="contact-form">
      <form>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="project">Project Type</label>
          <input 
            type="text" 
            id="project" 
            name="project" 
            placeholder="Web App, Mobile App, Consultation..." 
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea 
            id="message" 
            name="message" 
            placeholder="Tell me about your project..." 
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Send Message
        </button>
      </form>
    </div>
  );
}
