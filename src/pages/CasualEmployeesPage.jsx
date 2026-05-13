import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_WORKERS = gql`
  query GetWorkers {
    workers {
      id
      fullName
      nationalId
      nssfNumber
      nhifNumber
      skillType
      dailyRate
      phone
      isActive
    }
  }
`;

const CREATE_WORKER = gql`
  mutation CreateWorker(
    $fullName: String!
    $nationalId: String
    $nssfNumber: String
    $nhifNumber: String
    $skillType: String
    $dailyRate: Float
    $phone: String
    $isActive: Boolean
  ) {
    createWorker(
      fullName: $fullName
      nationalId: $nationalId
      nssfNumber: $nssfNumber
      nhifNumber: $nhifNumber
      skillType: $skillType
      dailyRate: $dailyRate
      phone: $phone
      isActive: $isActive
    ) {
      id
      fullName
    }
  }
`;

const UPDATE_WORKER = gql`
  mutation UpdateWorker(
    $id: ID!
    $fullName: String
    $nationalId: String
    $nssfNumber: String
    $nhifNumber: String
    $skillType: String
    $dailyRate: Float
    $phone: String
    $isActive: Boolean
  ) {
    updateWorker(
      id: $id
      fullName: $fullName
      nationalId: $nationalId
      nssfNumber: $nssfNumber
      nhifNumber: $nhifNumber
      skillType: $skillType
      dailyRate: $dailyRate
      phone: $phone
      isActive: $isActive
    ) {
      id
      fullName
    }
  }
`;

const DELETE_WORKER = gql`
  mutation DeleteWorker($id: ID!) {
    deleteWorker(id: $id)
  }
`;

const SKILL_TYPES = [
  "Laborer",
  "Carpenter",
  "Mason",
  "Plumber",
  "Electrician",
  "Welder",
  "Heavy Equipment Operator",
  "Foreman",
  "Safety Officer",
  "Other",
];

export default function CasualEmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    nationalId: "",
    nssfNumber: "",
    nhifNumber: "",
    skillType: "Laborer",
    dailyRate: "",
    phone: "",
    isActive: true,
  });

  const { data, loading, error, refetch } = useQuery(GET_WORKERS);
  const [createWorker] = useMutation(CREATE_WORKER, {
    onCompleted: () => {
      resetForm();
      refetch();
    },
  });
  const [updateWorker] = useMutation(UPDATE_WORKER, {
    onCompleted: () => {
      resetForm();
      refetch();
    },
  });
  const [deleteWorker] = useMutation(DELETE_WORKER, {
    onCompleted: () => refetch(),
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      nationalId: "",
      nssfNumber: "",
      nhifNumber: "",
      skillType: "Laborer",
      dailyRate: "",
      phone: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (worker) => {
    setFormData(worker);
    setEditingId(worker.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const variables = {
      ...formData,
      dailyRate: parseFloat(formData.dailyRate) || 0,
    };
    if (editingId) {
      updateWorker({
        variables: { id: editingId, ...variables },
      });
    } else {
      createWorker({ variables });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this employee?")) {
      deleteWorker({ variables: { id } });
    }
  };

  const workers = data?.workers || [];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Casual Employees</h1>
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
          {showForm ? "Cancel" : "+ Add Employee"}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? "Edit Employee" : "New Casual Employee"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="National ID"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="NSSF Number"
              value={formData.nssfNumber}
              onChange={(e) => setFormData({ ...formData, nssfNumber: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="NHIF Number"
              value={formData.nhifNumber}
              onChange={(e) => setFormData({ ...formData, nhifNumber: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <select
              value={formData.skillType}
              onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              {SKILL_TYPES.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Daily Rate (KES)"
              value={formData.dailyRate}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              step="0.01"
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              Active
            </label>
            <button
              type="submit"
              style={{
                gridColumn: "1 / -1",
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {editingId ? "Update Employee" : "Add Employee"}
            </button>
          </form>
        </div>
      )}

      {loading && <p>Loading employees...</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      {workers.length === 0 && !loading ? (
        <p style={{ color: "#666" }}>No casual employees registered yet.</p>
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
                <th style={{ padding: "12px", textAlign: "left" }}>Skill</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Daily Rate</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>{worker.fullName}</td>
                  <td style={{ padding: "12px" }}>{worker.skillType || "-"}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {worker.dailyRate ? `KES ${parseFloat(worker.dailyRate).toFixed(2)}` : "-"}
                  </td>
                  <td style={{ padding: "12px" }}>{worker.phone || "-"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: worker.isActive ? "#d4edda" : "#f8d7da",
                        color: worker.isActive ? "#155724" : "#856404",
                      }}
                    >
                      {worker.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(worker)}
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
                      onClick={() => handleDelete(worker.id)}
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
