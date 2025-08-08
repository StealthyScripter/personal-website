export default function ContactForm() {
  return (
    <div className="contact-form">
      <form>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" placeholder="e.g John Doe"required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="e.g john.doe@email.com" required />
        </div>
        <div className="form-group">
          <label htmlFor="project">Subject</label>
          <input 
            type="text" 
            id="project" 
            name="project" 
            placeholder="Subject..." 
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea 
            id="message" 
            name="message" 
            placeholder="message..." 
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
