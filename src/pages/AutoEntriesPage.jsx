import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

// â”€â”€ FILE REPLACED: full 4-tab scaffold below â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ GraphQL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const GET_WORKERS = gql`
  query GetWorkers {
    workers {
      id fullName nationalId nssfNumber nhifNumber skillType dailyRate phone isActive
    }
  }
`;

const CREATE_WORKER = gql`
  mutation CreateWorker(
    $fullName: String! $nationalId: String $nssfNumber: String $nhifNumber: String
    $skillType: String $dailyRate: Float $phone: String
  ) {
    createWorker(
      fullName: $fullName nationalId: $nationalId nssfNumber: $nssfNumber nhifNumber: $nhifNumber
      skillType: $skillType dailyRate: $dailyRate phone: $phone isActive: true
    ) { id fullName skillType dailyRate phone }
  }
`;

const GET_SUPPLIERS = gql`
  query GetSuppliers {
    suppliers {
      id name kraPin contactName contactEmail contactPhone paymentTerms
    }
  }
`;

const CREATE_SUPPLIER = gql`
  mutation CreateSupplier(
    $name: String! $kraPin: String $contactName: String
    $contactEmail: String $contactPhone: String $paymentTerms: String $notes: String
  ) {
    createSupplier(
      name: $name kraPin: $kraPin contactName: $contactName contactEmail: $contactEmail
      contactPhone: $contactPhone paymentTerms: $paymentTerms notes: $notes
    ) { id name }
  }
`;

// â”€â”€ REST helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const API_BASE = (() => {
  if (typeof window === "undefined") return "/wp-json/jinsing/v1";
  const h = window.location.hostname;
  const isLocal =
    h === "localhost" || h === "127.0.0.1" || h.startsWith("192.168.") || h.startsWith("10.");
  return isLocal
    ? `${window.location.protocol}//${h}/wordpress/wp-json/jinsing/v1`
    : "https://mtj.ivk.mybluehost.me/website_cf306033/wp-json/jinsing/v1";
})();

function getNonce() {
  if (typeof window === "undefined") return "";
  return window.jinsing?.nonce ?? window.wpApiSettings?.nonce ?? "";
}

async function apiFetch(path, options = {}) {
  const nonce = getNonce();
  const headers = { ...(options.headers ?? {}) };
  if (nonce) headers["X-WP-Nonce"] = nonce;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json;
}

// â”€â”€ Demo fallback data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEMO_ENTRIES = [
  { id: 1,  date: "2026-05-15", source: "ocr",            cost_code: "MATERIALS_CEMENT", description: "Cement â€” 50 bags",              amount: 12500, project_id: 9001, auto_status: "auto_approved",  confidence_score: 0.94 },
  { id: 2,  date: "2026-05-15", source: "timesheet_auto", cost_code: "LABOUR",           description: "Labour: Mwangi John â€“ Task #4", amount: 3200,  project_id: 9001, auto_status: "auto_approved",  confidence_score: 1.00 },
  { id: 3,  date: "2026-05-15", source: "ocr",            cost_code: "MATERIALS_STEEL",  description: "Reinforcement bar 12 mm",       amount: 45000, project_id: 9002, auto_status: "auto_approved",  confidence_score: 0.88 },
  { id: 4,  date: "2026-05-14", source: "ocr",            cost_code: "EQUIPMENT_FUEL",   description: "Fuel â€” site generator",         amount: 6800,  project_id: 9001, auto_status: "pending_review", confidence_score: 0.62 },
  { id: 5,  date: "2026-05-14", source: "manual",         cost_code: "LABOUR",           description: "Electrician first fix",         amount: 8000,  project_id: 9002, auto_status: null,             confidence_score: null },
  { id: 6,  date: "2026-05-14", source: "mpesa",          cost_code: "MATERIALS_OTHER",  description: "Plumbing fittings â€” batch",     amount: 23400, project_id: 9003, auto_status: "pending_review", confidence_score: 0.71 },
  { id: 7,  date: "2026-05-13", source: "manual",         cost_code: "MATERIALS_OTHER",  description: "Sand â€” 10 tonnes",              amount: 18000, project_id: 9001, auto_status: null,             confidence_score: null },
  { id: 8,  date: "2026-05-13", source: "mpesa",          cost_code: "LABOUR",           description: "Casual pay â€” week 19",          amount: 54000, project_id: 9003, auto_status: "pending_review", confidence_score: 0.55 },
];

// â”€â”€ Shared utils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatKES(n) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency", currency: "KES", maximumFractionDigits: 0,
  }).format(n);
}

function ConfidencePill({ score }) {
  if (score === null || score === undefined) return null;
  const pct = Math.round(score * 100);
  const cls = pct >= 85 ? "chip-success" : pct >= 60 ? "chip-warn" : "chip-risk";
  return <span className={`chip chip-sm ${cls}`}>{pct}%</span>;
}

const SOURCE_LABEL = {
  ocr: "Receipt OCR", timesheet_auto: "Timesheet", manual: "Manual",
  mpesa: "M-Pesa", api: "API",
};

// â”€â”€ Tab: Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EMPTY_EXPENSE = { date: "", cost_code: "MATERIALS_OTHER", description: "", amount: "", project_id: "" };

function ExpensesTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState("ALL");
  const [filterCode, setFilterCode] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_EXPENSE);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    apiFetch("/auto/entries?per_page=100")
      .then((rows) => setEntries(Array.isArray(rows) ? rows : []))
      .catch(() => setEntries(DEMO_ENTRIES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterSource !== "ALL") list = list.filter((e) => e.source === filterSource);
    if (filterCode !== "ALL") list = list.filter((e) => e.cost_code === filterCode);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => (e.description ?? "").toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      let va = a[sortKey] ?? "", vb = b[sortKey] ?? "";
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      return sortDir === "asc" ? (va < vb ? -1 : 1) : va > vb ? -1 : 1;
    });
  }, [entries, filterSource, filterCode, search, sortKey, sortDir]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: entries.length,
      today: entries.filter((e) => e.date === today).length,
      pending: entries.filter((e) => e.auto_status === "pending_review").length,
      auto: entries.filter((e) => e.source !== "manual").length,
      totalKES: entries.reduce((s, e) => s + parseFloat(e.amount || 0), 0),
    };
  }, [entries]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.date || !form.description.trim() || !form.amount) {
      setFormErr("Date, description, and amount are required.");
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch("/auto/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          cost_code: form.cost_code,
          source: "manual",
          description: form.description.trim(),
          amount: parseFloat(form.amount),
          project_id: form.project_id ? parseInt(form.project_id) : null,
        }),
      });
      setEntries((prev) => [created, ...prev]);
    } catch {
      setEntries((prev) => [{
        id: Date.now(), date: form.date, cost_code: form.cost_code, source: "manual",
        description: form.description.trim(), amount: parseFloat(form.amount),
        project_id: form.project_id || null, auto_status: null, confidence_score: null,
      }, ...prev]);
    }
    setForm(EMPTY_EXPENSE);
    setShowForm(false);
    setSaving(false);
  }

  const SortArrow = ({ k }) => (
    <span className={`sort-arrow${sortKey === k ? " active" : ""}`}>
      {sortKey !== k ? "â†•" : sortDir === "asc" ? "â†‘" : "â†“"}
    </span>
  );

  return (
    <>
      <div className="entries-stats">
        {[
          { label: "Total expenses", value: stats.total },
          { label: "Today", value: stats.today },
          { label: "Pending review", value: stats.pending, cls: "entries-stat-warn" },
          { label: "Auto-captured", value: stats.auto },
          { label: "Total spend", value: formatKES(stats.totalKES) },
        ].map(({ label, value, cls }) => (
          <article key={label} className="entries-stat panel">
            <p className="entries-stat-label">{label}</p>
            <strong className={`entries-stat-value${cls ? ` ${cls}` : ""}`}>{value}</strong>
          </article>
        ))}
      </div>

      <div className="entries-toolbar panel">
        <div className="entries-filters">
          <input
            className="entries-search" type="search" placeholder="Search expensesâ€¦"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <select className="entries-filter-select" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
            <option value="ALL">All sources</option>
            <option value="ocr">Receipt OCR</option>
            <option value="timesheet_auto">Timesheet</option>
            <option value="manual">Manual</option>
            <option value="mpesa">M-Pesa</option>
          </select>
          <select className="entries-filter-select" value={filterCode} onChange={(e) => setFilterCode(e.target.value)}>
            <option value="ALL">All cost codes</option>
            <option value="LABOUR">Labour</option>
            <option value="MATERIALS_CEMENT">Cement</option>
            <option value="MATERIALS_STEEL">Steel</option>
            <option value="MATERIALS_TIMBER">Timber</option>
            <option value="EQUIPMENT_FUEL">Fuel</option>
            <option value="EQUIPMENT_HIRE">Equipment hire</option>
            <option value="TRANSPORT">Transport</option>
            <option value="MATERIALS_OTHER">Other materials</option>
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add expense"}
        </button>
      </div>

      {showForm && (
        <form className="entries-add-form panel" onSubmit={handleSave} noValidate>
          <div className="entries-form-grid">
            <label className="form-field">
              <span>Date <span className="required">*</span></span>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Cost code</span>
              <select value={form.cost_code} onChange={(e) => setForm((f) => ({ ...f, cost_code: e.target.value }))}>
                <option value="LABOUR">Labour</option>
                <option value="MATERIALS_CEMENT">Cement</option>
                <option value="MATERIALS_STEEL">Steel</option>
                <option value="MATERIALS_TIMBER">Timber</option>
                <option value="EQUIPMENT_FUEL">Fuel</option>
                <option value="EQUIPMENT_HIRE">Equipment hire</option>
                <option value="TRANSPORT">Transport</option>
                <option value="MATERIALS_OTHER">Other materials</option>
              </select>
            </label>
            <label className="form-field">
              <span>Amount (KES) <span className="required">*</span></span>
              <input type="number" min="0" step="0.01" value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Project ID</span>
              <input type="number" min="1" value={form.project_id} placeholder="Optional"
                onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))} />
            </label>
            <label className="form-field entries-form-desc">
              <span>Description <span className="required">*</span></span>
              <input type="text" value={form.description} placeholder="e.g. Cement 50 bags â€“ site A"
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
          </div>
          {formErr && <p className="form-error">{formErr}</p>}
          <div className="entries-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Savingâ€¦" : "Save expense"}</button>
            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setForm(EMPTY_EXPENSE); setFormErr(""); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="entries-table-wrap panel">
        <div className="entries-table-meta">
          <span>{filtered.length} {filtered.length === 1 ? "expense" : "expenses"}</span>
          <span style={{ fontSize: "0.64rem", color: "var(--muted)" }}>
            {loading ? "Loadingâ€¦" : "GET /wp-json/jinsing/v1/auto/entries"}
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="entries-empty">No expenses match the current filters.</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table entries-table">
              <thead>
                <tr>
                  <th><button className="sort-btn" onClick={() => toggleSort("date")}>Date <SortArrow k="date" /></button></th>
                  <th>Cost code</th>
                  <th>Source</th>
                  <th><button className="sort-btn" onClick={() => toggleSort("description")}>Description <SortArrow k="description" /></button></th>
                  <th><button className="sort-btn" onClick={() => toggleSort("amount")}>Amount <SortArrow k="amount" /></button></th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="entries-date">{e.date}</td>
                    <td><code className="ae-code">{e.cost_code}</code></td>
                    <td className="entries-source">{SOURCE_LABEL[e.source] ?? e.source}</td>
                    <td className="entries-desc">{e.description}</td>
                    <td className="entries-amount">{formatKES(parseFloat(e.amount || 0))}</td>
                    <td><ConfidencePill score={e.confidence_score} /></td>
                    <td>
                      {e.auto_status ? (
                        <span className={`chip chip-sm ${e.auto_status === "auto_approved" ? "chip-success" : e.auto_status === "pending_review" ? "chip-warn" : "chip-risk"}`}>
                          {e.auto_status === "auto_approved" ? "Approved" : e.auto_status === "pending_review" ? "Review" : "Rejected"}
                        </span>
                      ) : (
                        <span className="ae-manual-tag">Manual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// â”€â”€ Tab: Receipt Scan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function ReceiptTab() {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  function handleFiles(fileList) {
    const f = fileList?.[0];
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) {
      setErrMsg("Unsupported file type. Upload JPEG, PNG, WebP, or PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrMsg("File exceeds 10 MB limit.");
      return;
    }
    setFile(f);
    setErrMsg("");
    setStatus("idle");
    setResult(null);
  }

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setStatus("uploading");
    setErrMsg("");
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      if (projectId) fd.append("project_id", projectId);
      const nonce = getNonce();
      const headers = {};
      if (nonce) headers["X-WP-Nonce"] = nonce;
      const res = await fetch(`${API_BASE}/auto/process-receipt`, {
        method: "POST", credentials: "include", headers, body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
      setResult(json);
      setStatus("success");
    } catch (err) {
      setErrMsg(err.message || "Upload failed.");
      setStatus("error");
    }
  }

  function reset() {
    setFile(null); setProjectId(""); setStatus("idle"); setResult(null); setErrMsg("");
  }

  return (
    <div className="ae-receipt-wrap">
      <div className="ae-receipt-info panel">
        <p className="ae-receipt-info-title">Automatic Receipt Processing</p>
        <p className="ae-receipt-info-body">
          Upload a receipt image or PDF. The engine extracts vendor, amount, date, and VAT using OCR,
          categorises the cost code automatically, and creates an expense linked to your project.
        </p>
        <div className="ae-flow-steps">
          {["Upload receipt", "OCR extraction", "Auto-categorise", "Expense created"].map((s, i) => (
            <div key={s} className="ae-flow-step">
              <span className="ae-flow-n">{i + 1}</span>
              <span className="ae-flow-label">{s}</span>
              {i < 3 && <span className="ae-flow-arrow">â†’</span>}
            </div>
          ))}
        </div>
      </div>

      {status === "success" ? (
        <div className="ae-receipt-result panel">
          <p className="ae-result-title">âœ“ Receipt processed</p>
          {result?.expense_id ? (
            <p className="ae-result-body">
              Expense <strong>#{result.expense_id}</strong> created. Queue ID: <code>{result.queue_id}</code>
            </p>
          ) : (
            <p className="ae-result-body">
              Queued as <code>{result?.queue_id}</code> â€” OCR extraction pending.
            </p>
          )}
          <button type="button" className="btn-secondary" onClick={reset} style={{ marginTop: "0.875rem" }}>
            Process another
          </button>
        </div>
      ) : (
        <form className="ae-receipt-form panel" onSubmit={handleUpload} noValidate>
          <div
            className={`ae-drop-zone${dragOver ? " drag-over" : ""}${file ? " has-file" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            aria-label="Upload receipt"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {file ? (
              <>
                <span className="ae-drop-icon">ðŸ“„</span>
                <strong className="ae-drop-filename">{file.name}</strong>
                <span className="ae-drop-size">{(file.size / 1024).toFixed(0)} KB</span>
              </>
            ) : (
              <>
                <span className="ae-drop-icon">ðŸ§¾</span>
                <strong className="ae-drop-cta">Drop receipt here or click to browse</strong>
                <span className="ae-drop-sub">JPEG, PNG, WebP, PDF &middot; max 10 MB</span>
              </>
            )}
          </div>

          <div className="ae-camera-row">
            <button
              type="button"
              className="ae-camera-btn"
              onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
              aria-label="Take photo with camera"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Take photo
            </button>
            <span className="ae-camera-hint">Uses device camera on mobile</span>
          </div>

          <div className="ae-receipt-fields">
            <label className="form-field" style={{ maxWidth: 220 }}>
              <span>Project ID (optional)</span>
              <input type="number" min="1" value={projectId} placeholder="e.g. 42"
                onChange={(e) => setProjectId(e.target.value)} />
            </label>
          </div>

          {errMsg && <p className="form-error">{errMsg}</p>}

          <div className="entries-form-actions" style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn-primary" disabled={!file || status === "uploading"}>
              {status === "uploading" ? "Processingâ€¦" : "Process receipt"}
            </button>
            {file && <button type="button" className="btn-secondary" onClick={reset}>Clear</button>}
          </div>
        </form>
      )}
    </div>
  );
}

// â”€â”€ Tab: Workers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EMPTY_WORKER = { fullName: "", nationalId: "", nssfNumber: "", nhifNumber: "", skillType: "", dailyRate: "", phone: "" };

function WorkersTab() {
  const { data, loading, error, refetch } = useQuery(GET_WORKERS, { fetchPolicy: "cache-and-network" });
  const [createWorker, { loading: creating }] = useMutation(CREATE_WORKER, {
    onCompleted: () => { setShowForm(false); setForm(EMPTY_WORKER); setFormErr(""); refetch(); },
    onError: (e) => setFormErr(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_WORKER);
  const [formErr, setFormErr] = useState("");
  const [search, setSearch] = useState("");

  const workers = data?.workers ?? [];
  const filtered = search.trim()
    ? workers.filter((w) =>
        (w.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (w.skillType ?? "").toLowerCase().includes(search.toLowerCase()))
    : workers;

  const active = workers.filter((w) => w.isActive !== false).length;
  const avgRate = workers.length
    ? Math.round(workers.reduce((s, w) => s + (w.dailyRate ?? 0), 0) / workers.length)
    : 0;

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName.trim()) { setFormErr("Full name is required."); return; }
    setFormErr("");
    createWorker({
      variables: {
        fullName: form.fullName.trim(),
        nationalId: form.nationalId || null,
        nssfNumber: form.nssfNumber || null,
        nhifNumber: form.nhifNumber || null,
        skillType: form.skillType || null,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : null,
        phone: form.phone || null,
      },
    });
  }

  return (
    <>
      <div className="entries-stats">
        <article className="entries-stat panel">
          <p className="entries-stat-label">Total workers</p>
          <strong className="entries-stat-value">{workers.length}</strong>
        </article>
        <article className="entries-stat panel">
          <p className="entries-stat-label">Active</p>
          <strong className="entries-stat-value">{active}</strong>
        </article>
        <article className="entries-stat panel">
          <p className="entries-stat-label">Avg daily rate</p>
          <strong className="entries-stat-value">{formatKES(avgRate)}</strong>
        </article>
      </div>

      <div className="entries-toolbar panel">
        <input
          className="entries-search" type="search" placeholder="Search workersâ€¦"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add worker"}
        </button>
      </div>

      {showForm && (
        <form className="entries-add-form panel" onSubmit={handleSubmit} noValidate>
          <div className="entries-form-grid">
            <label className="form-field entries-form-desc">
              <span>Full name <span className="required">*</span></span>
              <input type="text" value={form.fullName} onChange={field("fullName")}
                placeholder="e.g. Kamau Njoroge" autoFocus />
            </label>
            <label className="form-field">
              <span>National ID</span>
              <input type="text" value={form.nationalId} onChange={field("nationalId")} placeholder="12345678" />
            </label>
            <label className="form-field">
              <span>Skill type</span>
              <select value={form.skillType} onChange={field("skillType")}>
                <option value="">â€” Select â€”</option>
                {["Mason","Carpenter","Electrician","Plumber","Welder","Painter",
                  "General Labour","Foreman","Surveyor","Driver"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Daily rate (KES)</span>
              <input type="number" min="0" step="50" value={form.dailyRate}
                onChange={field("dailyRate")} placeholder="e.g. 1200" />
            </label>
            <label className="form-field">
              <span>Phone</span>
              <input type="tel" value={form.phone} onChange={field("phone")} placeholder="+254 7XX XXX XXX" />
            </label>
            <label className="form-field">
              <span>NSSF No.</span>
              <input type="text" value={form.nssfNumber} onChange={field("nssfNumber")} />
            </label>
            <label className="form-field">
              <span>NHIF No.</span>
              <input type="text" value={form.nhifNumber} onChange={field("nhifNumber")} />
            </label>
          </div>
          {formErr && <p className="form-error">{formErr}</p>}
          <div className="entries-form-actions">
            <button type="submit" className="btn-primary" disabled={creating}>{creating ? "Savingâ€¦" : "Add worker"}</button>
            <button type="button" className="btn-secondary"
              onClick={() => { setShowForm(false); setForm(EMPTY_WORKER); setFormErr(""); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="entries-table-wrap panel">
        <div className="entries-table-meta">
          <span>{filtered.length} {filtered.length === 1 ? "worker" : "workers"}</span>
          {error && <span style={{ color: "var(--danger)", fontSize: "0.68rem" }}>GraphQL error â€” check auth</span>}
        </div>
        {loading && !workers.length ? (
          <p className="entries-empty">Loading workersâ€¦</p>
        ) : filtered.length === 0 ? (
          <p className="entries-empty">No workers yet. Add your first worker above.</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table entries-table">
              <thead>
                <tr>
                  <th>Name</th><th>Skill</th><th>Daily rate</th>
                  <th>Phone</th><th>NSSF</th><th>NHIF</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600, fontSize: "0.76rem" }}>{w.fullName}</td>
                    <td className="entries-source">{w.skillType ?? "â€”"}</td>
                    <td className="entries-amount">{w.dailyRate ? formatKES(w.dailyRate) : "â€”"}</td>
                    <td className="entries-source">{w.phone ?? "â€”"}</td>
                    <td className="entries-source">{w.nssfNumber ?? "â€”"}</td>
                    <td className="entries-source">{w.nhifNumber ?? "â€”"}</td>
                    <td>
                      <span className={`chip chip-sm ${w.isActive !== false ? "chip-success" : "chip-risk"}`}>
                        {w.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// â”€â”€ Tab: Suppliers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EMPTY_SUPPLIER = { name: "", kraPin: "", contactName: "", contactEmail: "", contactPhone: "", paymentTerms: "", notes: "" };

function SuppliersTab() {
  const { data, loading, error, refetch } = useQuery(GET_SUPPLIERS, { fetchPolicy: "cache-and-network" });
  const [createSupplier, { loading: creating }] = useMutation(CREATE_SUPPLIER, {
    onCompleted: () => { setShowForm(false); setForm(EMPTY_SUPPLIER); setFormErr(""); refetch(); },
    onError: (e) => setFormErr(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_SUPPLIER);
  const [formErr, setFormErr] = useState("");
  const [search, setSearch] = useState("");

  const suppliers = data?.suppliers ?? [];
  const filtered = search.trim()
    ? suppliers.filter((s) =>
        (s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (s.contactName ?? "").toLowerCase().includes(search.toLowerCase()))
    : suppliers;

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr("Supplier name is required."); return; }
    setFormErr("");
    createSupplier({
      variables: {
        name: form.name.trim(),
        kraPin: form.kraPin || null,
        contactName: form.contactName || null,
        contactEmail: form.contactEmail || null,
        contactPhone: form.contactPhone || null,
        paymentTerms: form.paymentTerms || null,
        notes: form.notes || null,
      },
    });
  }

  return (
    <>
      <div className="entries-toolbar panel">
        <input
          className="entries-search" type="search" placeholder="Search suppliersâ€¦"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add supplier"}
        </button>
      </div>

      {showForm && (
        <form className="entries-add-form panel" onSubmit={handleSubmit} noValidate>
          <div className="entries-form-grid">
            <label className="form-field entries-form-desc">
              <span>Supplier name <span className="required">*</span></span>
              <input type="text" value={form.name} onChange={field("name")}
                placeholder="e.g. Bamburi Cement Ltd" autoFocus />
            </label>
            <label className="form-field">
              <span>KRA PIN</span>
              <input type="text" value={form.kraPin} onChange={field("kraPin")} placeholder="A012345678B" />
            </label>
            <label className="form-field">
              <span>Contact name</span>
              <input type="text" value={form.contactName} onChange={field("contactName")} />
            </label>
            <label className="form-field">
              <span>Contact email</span>
              <input type="email" value={form.contactEmail} onChange={field("contactEmail")} autoComplete="email" />
            </label>
            <label className="form-field">
              <span>Contact phone</span>
              <input type="tel" value={form.contactPhone} onChange={field("contactPhone")} placeholder="+254 7XX XXX XXX" />
            </label>
            <label className="form-field">
              <span>Payment terms</span>
              <select value={form.paymentTerms} onChange={field("paymentTerms")}>
                <option value="">â€” Select â€”</option>
                {["Net 7","Net 14","Net 30","Net 45","Net 60","Cash on delivery","Advance payment"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="form-field entries-form-desc">
              <span>Notes</span>
              <input type="text" value={form.notes} onChange={field("notes")} placeholder="Optional" />
            </label>
          </div>
          {formErr && <p className="form-error">{formErr}</p>}
          <div className="entries-form-actions">
            <button type="submit" className="btn-primary" disabled={creating}>{creating ? "Savingâ€¦" : "Add supplier"}</button>
            <button type="button" className="btn-secondary"
              onClick={() => { setShowForm(false); setForm(EMPTY_SUPPLIER); setFormErr(""); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="entries-table-wrap panel">
        <div className="entries-table-meta">
          <span>{filtered.length} {filtered.length === 1 ? "supplier" : "suppliers"}</span>
          {error && <span style={{ color: "var(--danger)", fontSize: "0.68rem" }}>GraphQL error â€” check auth</span>}
        </div>
        {loading && !suppliers.length ? (
          <p className="entries-empty">Loading suppliersâ€¦</p>
        ) : filtered.length === 0 ? (
          <p className="entries-empty">No suppliers yet. Add your first supplier above.</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table entries-table">
              <thead>
                <tr>
                  <th>Name</th><th>KRA PIN</th><th>Contact</th>
                  <th>Email</th><th>Phone</th><th>Payment terms</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontSize: "0.76rem" }}>{s.name}</td>
                    <td><code className="ae-code">{s.kraPin ?? "â€”"}</code></td>
                    <td className="entries-source">{s.contactName ?? "â€”"}</td>
                    <td className="entries-source">{s.contactEmail ?? "â€”"}</td>
                    <td className="entries-source">{s.contactPhone ?? "â€”"}</td>
                    <td className="entries-source">{s.paymentTerms ?? "â€”"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TABS = [
  { id: "expenses",  label: "Expenses" },
  { id: "receipt",   label: "Receipt Scan" },
  { id: "workers",   label: "Workers" },
  { id: "suppliers", label: "Suppliers" },
];

export default function AutoEntriesPage() {
  const [tab, setTab] = useState("expenses");

  return (
    <div className="entries-page">
      <nav className="ae-tabs panel" aria-label="Entries sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ae-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "expenses"  && <ExpensesTab />}
      {tab === "receipt"   && <ReceiptTab />}
      {tab === "workers"   && <WorkersTab />}
      {tab === "suppliers" && <SuppliersTab />}
    </div>
  );
}
