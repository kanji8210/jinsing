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

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Suppliers</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          style={{
            padding: "8px 16px",
            backgroundColor: "#1a5490",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {showForm ? "Cancel" : "+ New Supplier"}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? "Edit Supplier" : "New Supplier"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
            <input
              type="text"
              placeholder="Supplier Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="KRA PIN"
              value={formData.kraPin}
              onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Contact Name"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="tel"
              placeholder="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Payment Terms (e.g., Net 30)"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "80px" }}
            />
            <button
              type="submit"
              style={{
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {editingId ? "Update Supplier" : "Create Supplier"}
            </button>
          </form>
        </div>
      )}

      {loading && <p>Loading suppliers...</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      {suppliers.length === 0 && !loading ? (
        <p style={{ color: "#666" }}>No suppliers yet. Create one to get started.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              border: "1px solid #ddd",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Contact</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Terms</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>{supplier.name}</td>
                  <td style={{ padding: "12px" }}>{supplier.contactName || "-"}</td>
                  <td style={{ padding: "12px" }}>{supplier.contactEmail || "-"}</td>
                  <td style={{ padding: "12px" }}>{supplier.contactPhone || "-"}</td>
                  <td style={{ padding: "12px" }}>{supplier.paymentTerms || "-"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(supplier)}
                      style={{
                        marginRight: "8px",
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
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
    </div>
  );
}
