import { useState } from "react";

const ACCESS_COPY = {
  en: {
    title: "Request Platform Access",
    subtitle:
      "Submit your details to request a JINSING platform account. Credentials will be emailed once your request is approved.",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    company: "Company Name",
    role: "Role",
    heardFrom: "How did you hear about Jinsing?",
    roleOptions: ["Contractor", "Developer", "Project Manager", "Architect / Engineer", "Site Manager", "Systems Team", "Other"],
    heardFromOptions: ["Referral", "LinkedIn", "WhatsApp group", "Construction forum", "Other"],
    submit: "Request Access",
    pending: "Submitting request...",
    cancel: "Cancel",
    requiredError: "Please complete your name, email, and role to continue.",
    success:
      "Access request received. Check your email for onboarding instructions and login credentials.",
    helper:
      "Access is provisioned for authorised JINSING project personnel. Your credentials will arrive by email.",
  },
};

ACCESS_COPY.zh = ACCESS_COPY.en;

export default function AccessRegistrationForm({ lang = "en", onClose }) {
  const copy = ACCESS_COPY[lang] || ACCESS_COPY.en;
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    heardFrom: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.role.trim()) {
      setError(copy.requiredError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/wp-json/jinsing/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          role: formData.role,
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          heardFrom: formData.heardFrom.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Registration failed. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="access-form quote-success">
        <div className="success-message">
          <h3>{copy.success}</h3>
          <p>{copy.helper}</p>
          {onClose && (
            <button type="button" className="btn-primary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="access-form quote-form">
      <div className="form-header">
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="access-grid">
        <label className="form-field">
          <span>
            {copy.fullName} <span className="required">*</span>
          </span>
          <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" />
        </label>

        <label className="form-field">
          <span>
            {copy.email} <span className="required">*</span>
          </span>
          <input name="email" value={formData.email} onChange={handleChange} type="email" />
        </label>

        <label className="form-field">
          <span>{copy.phone}</span>
          <input name="phone" value={formData.phone} onChange={handleChange} type="tel" />
        </label>

        <label className="form-field">
          <span>{copy.company}</span>
          <input name="company" value={formData.company} onChange={handleChange} type="text" />
        </label>

        <label className="form-field">
          <span>
            {copy.role} <span className="required">*</span>
          </span>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="">Select role...</option>
            {copy.roleOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>{copy.heardFrom}</span>
          <select name="heardFrom" value={formData.heardFrom} onChange={handleChange}>
            <option value="">Select source...</option>
            {copy.heardFromOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <p className="access-helper ops-span-full">{copy.helper}</p>

        <div className="form-actions ops-span-full access-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? copy.pending : copy.submit}
          </button>
          {onClose && (
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              {copy.cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}