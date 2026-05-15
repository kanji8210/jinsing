import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_SUPPLIERS = gql`
  query GetSuppliers {
    suppliers {
      id
      name
      kraPin
      contactName
      contactEmail
      contactPhone
      paymentTerms
      notes
    }
  }
`;

const CREATE_SUPPLIER = gql`
  mutation CreateSupplier(
    $name: String!
    $kraPin: String
    $contactName: String
    $contactEmail: String
    $contactPhone: String
    $paymentTerms: String
    $notes: String
  ) {
    createSupplier(
      name: $name
      kraPin: $kraPin
      contactName: $contactName
      contactEmail: $contactEmail
      contactPhone: $contactPhone
      paymentTerms: $paymentTerms
      notes: $notes
    ) {
      id
      name
    }
  }
`;

const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier(
    $id: ID!
    $name: String
    $kraPin: String
    $contactName: String
    $contactEmail: String
    $contactPhone: String
    $paymentTerms: String
    $notes: String
  ) {
    updateSupplier(
      id: $id
      name: $name
      kraPin: $kraPin
      contactName: $contactName
      contactEmail: $contactEmail
      contactPhone: $contactPhone
      paymentTerms: $paymentTerms
      notes: $notes
    ) {
      id
      name
    }
  }
`;

const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id)
  }
`;

export default function SuppliersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    kraPin: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    paymentTerms: "",
    notes: "",
  });

  const { data, loading, error, refetch } = useQuery(GET_SUPPLIERS);
  const [createSupplier] = useMutation(CREATE_SUPPLIER, {
    onCompleted: () => {
      resetForm();
      refetch();
    },
  });
  const [updateSupplier] = useMutation(UPDATE_SUPPLIER, {
    onCompleted: () => {
      resetForm();
      refetch();
    },
  });
  const [deleteSupplier] = useMutation(DELETE_SUPPLIER, {
    onCompleted: () => refetch(),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      kraPin: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      paymentTerms: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateSupplier({
        variables: { id: editingId, ...formData },
      });
    } else {
      createSupplier({ variables: formData });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this supplier?")) {
      deleteSupplier({ variables: { id } });
    }
  };

  const suppliers = data?.suppliers || [];
  const suppliersWithTerms = suppliers.filter((supplier) => supplier.paymentTerms).length;
  const suppliersWithEmail = suppliers.filter((supplier) => supplier.contactEmail).length;

  return (
    <section className="ops-page">
      <div className="ops-page-header">
        <div>
          <p className="section-kicker">Supply chain command</p>
          <h1 className="ops-page-title">Suppliers</h1>
          <p className="ops-page-copy">
            Centralize procurement contacts, payment terms, and vendor records in a field-ready command view.
          </p>
        </div>
        <button
          type="button"
          className={showForm ? "btn-secondary" : "btn-primary"}
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? "Close form" : "+ New Supplier"}
        </button>
      </div>

      <div className="ops-stat-grid">
        <article className="ops-stat-card">
          <p className="ops-stat-label">Total suppliers</p>
          <strong className="ops-stat-value">{suppliers.length}</strong>
          <span className="ops-stat-note">Live vendor records in the system</span>
        </article>
        <article className="ops-stat-card">
          <p className="ops-stat-label">Commercial terms</p>
          <strong className="ops-stat-value">{suppliersWithTerms}</strong>
          <span className="ops-stat-note">Profiles with negotiated payment terms</span>
        </article>
        <article className="ops-stat-card">
          <p className="ops-stat-label">Digital contacts</p>
          <strong className="ops-stat-value">{suppliersWithEmail}</strong>
          <span className="ops-stat-note">Suppliers ready for documented coordination</span>
        </article>
      </div>

      {showForm && (
        <section className="panel panel-spacer ops-form-panel">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Supplier profile</p>
              <h2>{editingId ? "Edit Supplier" : "New Supplier"}</h2>
            </div>
            <span className="chip">Vendor onboarding</span>
          </div>

          <form onSubmit={handleSubmit} className="ops-form-grid">
            <input
              type="text"
              placeholder="Supplier Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="ops-input"
            />
            <input
              type="text"
              placeholder="KRA PIN"
              value={formData.kraPin}
              onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
              className="ops-input"
            />
            <input
              type="text"
              placeholder="Contact Name"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="ops-input"
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="ops-input"
            />
            <input
              type="tel"
              placeholder="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="ops-input"
            />
            <input
              type="text"
              placeholder="Payment Terms (e.g., Net 30)"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="ops-input"
            />
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="ops-input ops-textarea ops-span-full"
            />
            <button type="submit" className="btn-primary ops-span-full">
              {editingId ? "Update Supplier" : "Create Supplier"}
            </button>
          </form>
        </section>
      )}

      {loading && <p className="projects-state-copy">Loading suppliers...</p>}
      {error && (
        <div className="projects-state-card projects-state-error panel-spacer">
          <h3>Supplier feed unavailable</h3>
          <p>{error.message}</p>
        </div>
      )}

      {suppliers.length === 0 && !loading ? (
        <div className="empty-state-card panel-spacer">
          <strong>No suppliers yet</strong>
          <p>Create your first vendor profile to start structuring the supply chain register.</p>
        </div>
      ) : (
        <div className="ops-table-shell panel-spacer">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Terms</th>
                <th className="ops-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="ops-table-primary">
                      <strong>{supplier.name}</strong>
                      <span>{supplier.kraPin || "KRA PIN pending"}</span>
                    </div>
                  </td>
                  <td>{supplier.contactName || "-"}</td>
                  <td>{supplier.contactEmail || "-"}</td>
                  <td>{supplier.contactPhone || "-"}</td>
                  <td>{supplier.paymentTerms || "-"}</td>
                  <td className="ops-actions-cell">
                    <button
                      type="button"
                      onClick={() => handleEdit(supplier)}
                      className="btn-secondary ops-action-btn"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(supplier.id)}
                      className="btn-danger ops-action-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
