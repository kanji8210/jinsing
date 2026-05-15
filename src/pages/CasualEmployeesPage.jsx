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

function formatKes(value) {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

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
  const activeWorkers = workers.filter((worker) => worker.isActive).length;
  const tradeMix = new Set(workers.map((worker) => worker.skillType).filter(Boolean)).size;
  const averageDailyRate =
    workers.length > 0
      ? workers.reduce((sum, worker) => sum + Number(worker.dailyRate || 0), 0) / workers.length
      : 0;

  return (
    <section className="ops-page">
      <div className="ops-page-header">
        <div>
          <p className="section-kicker">Workforce command</p>
          <h1 className="ops-page-title">Casual Employees</h1>
          <p className="ops-page-copy">
            Track labor availability, trade coverage, and daily-rate exposure from a single site operations view.
          </p>
        </div>
        <button
          type="button"
          className={showForm ? "btn-secondary" : "btn-primary"}
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? "Close form" : "+ Add Employee"}
        </button>
      </div>

      <div className="ops-stat-grid">
        <article className="ops-stat-card">
          <p className="ops-stat-label">Registered workers</p>
          <strong className="ops-stat-value">{workers.length}</strong>
          <span className="ops-stat-note">Labor records in the active roster</span>
        </article>
        <article className="ops-stat-card">
          <p className="ops-stat-label">Active on rotation</p>
          <strong className="ops-stat-value">{activeWorkers}</strong>
          <span className="ops-stat-note">Workers currently marked available</span>
        </article>
        <article className="ops-stat-card">
          <p className="ops-stat-label">Average daily rate</p>
          <strong className="ops-stat-value">{formatKes(averageDailyRate)}</strong>
          <span className="ops-stat-note">Across {tradeMix} documented trade categories</span>
        </article>
      </div>

      {showForm && (
        <section className="panel panel-spacer ops-form-panel">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Labor profile</p>
              <h2>{editingId ? "Edit Employee" : "New Casual Employee"}</h2>
            </div>
            <span className="chip">Field deployment</span>
          </div>

          <form onSubmit={handleSubmit} className="ops-form-grid ops-form-grid-two-column">
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="ops-input"
            />
            <input
              type="text"
              placeholder="National ID"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              className="ops-input"
            />
            <input
              type="text"
              placeholder="NSSF Number"
              value={formData.nssfNumber}
              onChange={(e) => setFormData({ ...formData, nssfNumber: e.target.value })}
              className="ops-input"
            />
            <input
              type="text"
              placeholder="NHIF Number"
              value={formData.nhifNumber}
              onChange={(e) => setFormData({ ...formData, nhifNumber: e.target.value })}
              className="ops-input"
            />
            <select
              value={formData.skillType}
              onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
              className="ops-input"
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
              className="ops-input"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="ops-input"
            />
            <label className="ops-checkbox">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
            <button type="submit" className="btn-primary ops-span-full">
              {editingId ? "Update Employee" : "Add Employee"}
            </button>
          </form>
        </section>
      )}

      {loading && <p className="projects-state-copy">Loading employees...</p>}
      {error && (
        <div className="projects-state-card projects-state-error panel-spacer">
          <h3>Workforce feed unavailable</h3>
          <p>{error.message}</p>
        </div>
      )}

      {workers.length === 0 && !loading ? (
        <div className="empty-state-card panel-spacer">
          <strong>No casual employees registered yet</strong>
          <p>Add the first worker to start tracking labor capacity and rate exposure.</p>
        </div>
      ) : (
        <div className="ops-table-shell panel-spacer">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Skill</th>
                <th className="ops-number-col">Daily Rate</th>
                <th>Phone</th>
                <th>Status</th>
                <th className="ops-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td>
                    <div className="ops-table-primary">
                      <strong>{worker.fullName}</strong>
                      <span>{worker.nationalId || "National ID pending"}</span>
                    </div>
                  </td>
                  <td>{worker.skillType || "-"}</td>
                  <td className="ops-number-col">
                    {worker.dailyRate ? formatKes(worker.dailyRate) : "-"}
                  </td>
                  <td>{worker.phone || "-"}</td>
                  <td>
                    <span className={`status-pill ${worker.isActive ? "active" : "inactive"}`}>
                      {worker.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="ops-actions-cell">
                    <button
                      type="button"
                      onClick={() => handleEdit(worker)}
                      className="btn-secondary ops-action-btn"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(worker.id)}
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
