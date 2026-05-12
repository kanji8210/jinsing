import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const SUBMIT_QUOTE_REQUEST = gql`
  mutation SubmitQuoteRequest($input: SubmitQuoteRequestInput!) {
    submitQuoteRequest(input: $input) {
      success
      requestId
      message
    }
  }
`;

const QUOTE_COPY = {
  en: {
    title: "Request a Project Quote",
    subtitle: "Describe your construction or engineering project for a detailed cost estimate.",
    projectType: "Project Type",
    projectTypeHint: "Select the primary work category",
    typeOptions: [
      { value: "building", label: "Building & Renovation" },
      { value: "civil", label: "Civil Infrastructure" },
      { value: "mechanical", label: "Mechanical & Systems" },
      { value: "electrical", label: "Electrical & Power" },
      { value: "specialized", label: "Specialized/Other" },
    ],
    projectScope: "Project Scope & Description",
    projectScopeHint: "What are you building or improving? Include key objectives.",
    quantities: "Quantities & Specifications",
    quantitiesHint: "Add measurements, volumes, materials, and technical specs.",
    addQuantity: "+ Add Item",
    quantityItem: "Item",
    quantityAmount: "Amount",
    quantityUnit: "Unit (m, m², m³, kg, etc.)",
    qualitativeSpecs: "Quality & Finish Standards",
    qualitativeHint: "Material grades, finish types, compliance requirements, any special constraints.",
    contactInfo: "Your Information",
    contactName: "Full Name",
    contactEmail: "Email Address",
    contactPhone: "Phone Number",
    contactCompany: "Company Name (optional)",
    submitBtn: "Request Quote",
    submitPending: "Submitting...",
    cancelBtn: "Cancel",
    successMsg: "Quote request received. We'll contact you within 24 hours.",
    validationError: "Please complete the required project, quantity, specification, and contact fields.",
    submitError: "Unable to submit your request right now. Please try again shortly.",
  },
  zh: {
    title: "申请项目报价",
    subtitle: "描述您的建筑或工程项目，获取详细的成本估算。",
    projectType: "项目类型",
    projectTypeHint: "选择主要工作类别",
    typeOptions: [
      { value: "building", label: "建筑与装修" },
      { value: "civil", label: "土木基础设施" },
      { value: "mechanical", label: "机械与系统" },
      { value: "electrical", label: "电气与动力" },
      { value: "specialized", label: "专项/其他" },
    ],
    projectScope: "项目范围与描述",
    projectScopeHint: "您要建造或改善什么？请说明关键目标。",
    quantities: "数量与规格",
    quantitiesHint: "添加尺寸、体积、材料和技术规格。",
    addQuantity: "+ 添加项目",
    quantityItem: "项目",
    quantityAmount: "数量",
    quantityUnit: "单位（m、m²、m³、kg 等）",
    qualitativeSpecs: "质量与竣工标准",
    qualitativeHint: "材料等级、竣工类型、合规要求、任何特殊限制。",
    contactInfo: "您的信息",
    contactName: "姓名",
    contactEmail: "电子邮件",
    contactPhone: "电话号码",
    contactCompany: "公司名称（可选）",
    submitBtn: "申请报价",
    submitPending: "提交中...",
    cancelBtn: "取消",
    successMsg: "报价申请已收到。我们将在 24 小时内与您联系。",
    validationError: "请完整填写项目、数量、规格和联系信息等必填字段。",
    submitError: "当前无法提交申请，请稍后再试。",
  },
};

export default function QuoteForm({ lang = "en", onClose, onSubmitted }) {
  const copy = QUOTE_COPY[lang];
  const [formData, setFormData] = useState({
    projectType: "",
    projectScope: "",
    quantities: [{ item: "", amount: "", unit: "" }],
    qualitativeSpecs: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactCompany: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState(copy.successMsg);
  const [error, setError] = useState("");
  const [submitQuoteRequest, { loading: isSubmitting }] = useMutation(SUBMIT_QUOTE_REQUEST);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleQuantityChange = (index, field, value) => {
    const newQuantities = [...formData.quantities];
    newQuantities[index][field] = value;
    setFormData((prev) => ({ ...prev, quantities: newQuantities }));
  };

  const addQuantityItem = () => {
    setFormData((prev) => ({
      ...prev,
      quantities: [...prev.quantities, { item: "", amount: "", unit: "" }],
    }));
  };

  const removeQuantityItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      quantities: prev.quantities.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const hasQuantity = formData.quantities.some(
      (quantity) => quantity.item || quantity.amount || quantity.unit
    );

    if (
      !formData.projectType ||
      !formData.projectScope ||
      !hasQuantity ||
      !formData.qualitativeSpecs ||
      !formData.contactName ||
      !formData.contactEmail ||
      !formData.contactPhone
    ) {
      setError(copy.validationError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");

    try {
      const cleanQuantities = formData.quantities.filter(
        (quantity) => quantity.item || quantity.amount || quantity.unit
      );

      const { data } = await submitQuoteRequest({
        variables: {
          input: {
            projectType: formData.projectType,
            projectScope: formData.projectScope,
            quantities: cleanQuantities,
            qualitativeSpecs: formData.qualitativeSpecs,
            contactName: formData.contactName,
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone,
            contactCompany: formData.contactCompany,
          },
        },
      });

      const result = data?.submitQuoteRequest;
      setSuccessMessage(result?.message || copy.successMsg);
      setSubmitted(true);

      if (onSubmitted) {
        onSubmitted(result);
      }

      setTimeout(() => {
        setSubmitted(false);
        if (onClose) onClose();
      }, 3000);
    } catch (submitError) {
      setError(submitError.message || copy.submitError);
    }
  };

  if (submitted) {
    return (
      <div className="quote-form quote-success">
        <div className="success-message">
          <h3>✓ {successMessage}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-form">
      <div className="form-header">
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Project Type */}
        <fieldset className="form-field">
          <label htmlFor="projectType">
            {copy.projectType} <span className="required">*</span>
          </label>
          <p className="field-hint">{copy.projectTypeHint}</p>
          <select
            id="projectType"
            name="projectType"
            value={formData.projectType}
            onChange={handleInputChange}
            required
          >
            <option value="">
              {lang === "en" ? "Select..." : "选择..."}
            </option>
            {copy.typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </fieldset>

        {/* Project Scope */}
        <fieldset className="form-field">
          <label htmlFor="projectScope">
            {copy.projectScope} <span className="required">*</span>
          </label>
          <p className="field-hint">{copy.projectScopeHint}</p>
          <textarea
            id="projectScope"
            name="projectScope"
            value={formData.projectScope}
            onChange={handleInputChange}
            rows={4}
            required
          />
        </fieldset>

        {/* Quantities */}
        <fieldset className="form-field">
          <label>{copy.quantities}</label>
          <p className="field-hint">{copy.quantitiesHint}</p>
          <div className="quantities-list">
            {formData.quantities.map((qty, idx) => (
              <div key={idx} className="quantity-row">
                <input
                  type="text"
                  placeholder={copy.quantityItem}
                  value={qty.item}
                  onChange={(e) =>
                    handleQuantityChange(idx, "item", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder={copy.quantityAmount}
                  value={qty.amount}
                  onChange={(e) =>
                    handleQuantityChange(idx, "amount", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder={copy.quantityUnit}
                  value={qty.unit}
                  onChange={(e) =>
                    handleQuantityChange(idx, "unit", e.target.value)
                  }
                />
                {formData.quantities.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeQuantityItem(idx)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-add-item"
            onClick={addQuantityItem}
          >
            {copy.addQuantity}
          </button>
        </fieldset>

        {/* Qualitative Specs */}
        <fieldset className="form-field">
          <label htmlFor="qualitativeSpecs">
            {copy.qualitativeSpecs}
          </label>
          <p className="field-hint">{copy.qualitativeHint}</p>
          <textarea
            id="qualitativeSpecs"
            name="qualitativeSpecs"
            value={formData.qualitativeSpecs}
            onChange={handleInputChange}
            rows={3}
            placeholder={lang === "en" ? "E.g., Premium finish, seismic compliance, fire-rated materials..." : "例如：高级竣工、抗震合规、防火材料..."}
          />
        </fieldset>

        {/* Contact Info */}
        <fieldset className="form-field form-contact">
          <legend>{copy.contactInfo}</legend>
          <div className="contact-row">
            <input
              type="text"
              name="contactName"
              placeholder={copy.contactName}
              value={formData.contactName}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="contactEmail"
              placeholder={copy.contactEmail}
              value={formData.contactEmail}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="contact-row">
            <input
              type="tel"
              name="contactPhone"
              placeholder={copy.contactPhone}
              value={formData.contactPhone}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="contactCompany"
              placeholder={copy.contactCompany}
              value={formData.contactCompany}
              onChange={handleInputChange}
            />
          </div>
        </fieldset>

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? copy.submitPending : copy.submitBtn}
          </button>
          {onClose && (
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              {copy.cancelBtn}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
