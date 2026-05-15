import { useState } from "react";

const SECTIONS = [
  {
    id: "getting-started",
    label: "Getting Started",
    articles: [
      {
        id: "gs-overview",
        title: "Platform Overview",
        updated: "2026-05-01",
        body: [
          {
            type: "p",
            content:
              "Jinsing is a construction management platform built for Kenyan project teams. It covers project tracking, cost control, supplier management, field workforce records, and compliance workflows.",
          },
          {
            type: "p",
            content:
              "The platform exposes a GraphQL API that powers the web dashboard and mobile apps. All data is stored in a WordPress-managed MySQL database and served through WPGraphQL.",
          },
          {
            type: "h3",
            content: "Core modules",
          },
          {
            type: "list",
            items: [
              "Projects – milestones, progress, budget vs actual",
              "Suppliers – contact records, categories, payment terms",
              "Casual Employees – skills, daily rates, compliance docs",
              "Automated Entries – expenses, time logs, materials from any source",
              "Finance – cost summaries, forecasts, budget controls",
              "Reports – compliance exports, audit trails, dashboards",
            ],
          },
        ],
      },
      {
        id: "gs-auth",
        title: "Authentication",
        updated: "2026-05-03",
        body: [
          {
            type: "p",
            content:
              "The platform uses WordPress JWT authentication. Obtain a token by posting credentials to the WPGraphQL login mutation, then attach it as a Bearer token on subsequent requests.",
          },
          {
            type: "code",
            lang: "graphql",
            content: `mutation Login {
  login(input: {
    username: "your_username"
    password: "your_password"
  }) {
    authToken
    refreshToken
    user { id name email }
  }
}`,
          },
          {
            type: "p",
            content:
              "The Settings page in the dashboard accepts a JWT token and stores it in localStorage for Apollo Client to attach to all subsequent requests.",
          },
          {
            type: "h3",
            content: "Token expiry",
          },
          {
            type: "p",
            content:
              "Tokens expire after 300 seconds by default. Use the refreshToken mutation to obtain a new authToken without re-entering credentials.",
          },
        ],
      },
      {
        id: "gs-quickstart",
        title: "Quickstart",
        updated: "2026-05-05",
        body: [
          {
            type: "p",
            content:
              "Follow these steps to start working with the Jinsing platform in under five minutes.",
          },
          {
            type: "steps",
            items: [
              {
                n: "1",
                title: "Request access",
                text: "Contact the platform team to get your account provisioned.",
              },
              {
                n: "2",
                title: "Obtain your JWT",
                text: "Use the login mutation or the Settings page to get and store your token.",
              },
              {
                n: "3",
                title: "Open Projects",
                text: "Your live project data will load once the token is authenticated.",
              },
              {
                n: "4",
                title: "Explore the API",
                text: "Use the GraphQL Explorer at /graphql to browse the full schema.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "api-reference",
    label: "API Reference",
    articles: [
      {
        id: "api-schema",
        title: "GraphQL Schema",
        updated: "2026-05-08",
        body: [
          {
            type: "p",
            content:
              "All platform data is accessible through a single WPGraphQL endpoint at /wordpress/graphql. The schema exposes root query fields and mutations for every core entity.",
          },
          {
            type: "h3",
            content: "Root query fields",
          },
          {
            type: "table",
            cols: ["Field", "Type", "Auth required"],
            rows: [
              ["projects", "[Project]", "manage_construction_projects"],
              ["suppliers", "[Supplier]", "manage_construction_projects"],
              ["workers", "[Worker]", "manage_construction_projects"],
              ["entries", "[Entry]", "manage_construction_projects"],
              ["authDebug", "AuthDebug", "None"],
            ],
          },
          {
            type: "h3",
            content: "Available mutations",
          },
          {
            type: "table",
            cols: ["Mutation", "Description"],
            rows: [
              ["createProject", "Create a new project record"],
              ["createMilestone", "Add a milestone to a project"],
              ["createSupplier / updateSupplier / deleteSupplier", "Supplier CRUD"],
              ["createWorker / updateWorker / deleteWorker", "Worker CRUD"],
              ["submitQuoteRequest", "Submit a quote request"],
              ["createEntry", "Add an automated entry (expense/time/material)"],
            ],
          },
        ],
      },
      {
        id: "api-projects",
        title: "Projects API",
        updated: "2026-05-08",
        body: [
          {
            type: "p",
            content:
              "Query projects with optional status filtering. Returns full milestone and budget data.",
          },
          {
            type: "code",
            lang: "graphql",
            content: `query GetProjects($status: String) {
  projects(status: $status) {
    id
    name
    status
    budgetTotal
    budgetSpent
    progressPercent
    milestones {
      id
      title
      dueDate
      status
    }
  }
}`,
          },
          {
            type: "p",
            content:
              "Valid status values: active, on_hold, completed. Omit for all projects.",
          },
        ],
      },
      {
        id: "api-entries",
        title: "Automated Entries API",
        updated: "2026-05-10",
        body: [
          {
            type: "p",
            content:
              "The entries API accepts expense, time, and material records from any source — receipt scanning, M-Pesa callbacks, manual input, and third-party integrations.",
          },
          {
            type: "code",
            lang: "graphql",
            content: `mutation CreateEntry($input: CreateEntryInput!) {
  createEntry(input: $input) {
    id
    type
    source
    amount
    description
    projectId
    status
    createdAt
  }
}

# Input shape
# type: EXPENSE | TIME | MATERIAL
# source: MANUAL | RECEIPT_SCAN | MPESA | API
# amount: Float (KES for expense/material, hours for time)
# projectId: Int (optional, links to project)`,
          },
          {
            type: "h3",
            content: "REST endpoint",
          },
          {
            type: "p",
            content:
              "A REST endpoint is also available for webhook integrations and automated pipelines:",
          },
          {
            type: "code",
            lang: "http",
            content: `POST /wp-json/jinsing/v1/entries
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "type": "EXPENSE",
  "source": "MPESA",
  "amount": 12500,
  "description": "Cement — 50 bags",
  "projectId": 9001
}`,
          },
        ],
      },
      {
        id: "api-rate-limits",
        title: "Rate Limits",
        updated: "2026-05-02",
        body: [
          {
            type: "p",
            content:
              "The API enforces per-IP and per-user rate limits to protect platform stability.",
          },
          {
            type: "table",
            cols: ["Endpoint", "Limit", "Window"],
            rows: [
              ["/graphql (read)", "120 requests", "per minute"],
              ["/graphql (mutation)", "30 requests", "per minute"],
              ["/wp-json/jinsing/v1/*", "60 requests", "per minute"],
              ["Authentication", "10 attempts", "per 15 minutes"],
            ],
          },
          {
            type: "p",
            content:
              "Rate limit errors return HTTP 429 with a Retry-After header. Implement exponential back-off in any integration that calls mutations in bulk.",
          },
        ],
      },
    ],
  },
  {
    id: "guides",
    label: "Guides",
    articles: [
      {
        id: "g-mpesa",
        title: "M-Pesa Integration",
        updated: "2026-05-06",
        body: [
          {
            type: "p",
            content:
              "Jinsing integrates with Safaricom M-Pesa Daraja API to automatically record payments and supplier transactions as expense entries.",
          },
          {
            type: "h3",
            content: "Setup steps",
          },
          {
            type: "steps",
            items: [
              {
                n: "1",
                title: "Register a Daraja app",
                text: "Create an app at developer.safaricom.co.ke and obtain Consumer Key and Secret.",
              },
              {
                n: "2",
                title: "Configure in Jinsing settings",
                text: "Enter your Daraja credentials in the Integration Settings panel.",
              },
              {
                n: "3",
                title: "Register the callback URL",
                text: "Set /wp-json/jinsing/v1/mpesa/callback as your C2B or B2C result URL in Daraja.",
              },
              {
                n: "4",
                title: "Test with sandbox",
                text: "Use Daraja sandbox credentials first to verify the entry pipeline before going live.",
              },
            ],
          },
          {
            type: "p",
            content:
              "Once configured, every M-Pesa confirmation triggers an automated EXPENSE entry with the transaction code, amount, and phone number pre-populated.",
          },
        ],
      },
      {
        id: "g-receipts",
        title: "Receipt Scanning",
        updated: "2026-05-07",
        body: [
          {
            type: "p",
            content:
              "The mobile app supports camera-based receipt scanning using an OCR pipeline. Scanned receipts are parsed and submitted as EXPENSE entries with the vendor name, line items, and total amount extracted automatically.",
          },
          {
            type: "h3",
            content: "Supported receipt formats",
          },
          {
            type: "list",
            items: [
              "Hardware store receipts (handwritten or printed)",
              "Fuel station receipts",
              "Supplier invoices (A4 PDF or photo)",
              "Till slips from Nairobi-area suppliers",
            ],
          },
          {
            type: "p",
            content:
              "Review extracted data before confirming the entry. The confidence score is shown next to each field — low-confidence fields are highlighted for manual review.",
          },
        ],
      },
      {
        id: "g-offline",
        title: "Mobile Offline Mode",
        updated: "2026-05-09",
        body: [
          {
            type: "p",
            content:
              "Field teams often operate in low-connectivity environments. The Jinsing mobile app stores entries locally and syncs when connectivity is restored.",
          },
          {
            type: "h3",
            content: "What works offline",
          },
          {
            type: "list",
            items: [
              "Creating expense, time, and material entries",
              "Viewing the last synced project list and milestones",
              "Completing daily work logs",
              "Scanning and queuing receipts for OCR processing",
            ],
          },
          {
            type: "p",
            content:
              "Offline entries are queued with a PENDING status and processed automatically when the device reconnects. Conflict resolution uses server-side timestamps.",
          },
        ],
      },
    ],
  },
  {
    id: "tutorials",
    label: "Tutorials",
    articles: [
      {
        id: "t-first-project",
        title: "Create Your First Project",
        updated: "2026-05-04",
        body: [
          {
            type: "p",
            content:
              "This tutorial walks through creating a project, adding milestones, and inviting team members from the Jinsing dashboard.",
          },
          {
            type: "steps",
            items: [
              {
                n: "1",
                title: "Open Projects",
                text: "Navigate to Projects in the sidebar.",
              },
              {
                n: "2",
                title: "Choose a template",
                text: "Select Residential Build, Commercial Fit-out, or Infrastructure Works as a starting point.",
              },
              {
                n: "3",
                title: "Fill in project details",
                text: "Enter the project name, budget, start and end dates.",
              },
              {
                n: "4",
                title: "Add milestones",
                text: "Adjust or add the default milestones from the template.",
              },
              {
                n: "5",
                title: "Save and track",
                text: "The project appears on your portfolio dashboard with live progress tracking.",
              },
            ],
          },
        ],
      },
      {
        id: "t-bulk-entry",
        title: "Bulk Entry Import",
        updated: "2026-05-10",
        body: [
          {
            type: "p",
            content:
              "Import historical expense or time records by uploading a CSV to the Automated Entries page.",
          },
          {
            type: "h3",
            content: "CSV format",
          },
          {
            type: "code",
            lang: "csv",
            content: `date,type,source,description,amount,project_id
2026-05-01,EXPENSE,MANUAL,Cement 50 bags,12500,9001
2026-05-01,TIME,MANUAL,Mason labour,8,9001
2026-05-02,MATERIAL,MANUAL,Reinforcement bar 12mm,45000,9002`,
          },
          {
            type: "p",
            content:
              "Required columns: date (YYYY-MM-DD), type, source, description, amount. project_id is optional. Rows with validation errors are skipped and listed in the import report.",
          },
        ],
      },
      {
        id: "t-compliance",
        title: "Compliance Exports",
        updated: "2026-05-11",
        body: [
          {
            type: "p",
            content:
              "Generate NCA, KRA, and audit-ready reports from the Reports page. All exports include timestamped audit trails.",
          },
          {
            type: "list",
            items: [
              "NCA contractor register export (XLSX)",
              "KRA P9 form for casual employee tax witholding",
              "Project cost audit trail (PDF)",
              "Supplier payment summary (CSV)",
            ],
          },
          {
            type: "p",
            content:
              "Reports are generated server-side and delivered as downloadable files. Large reports (>1000 rows) are queued and emailed when ready.",
          },
        ],
      },
    ],
  },
];

function ArticleBody({ body }) {
  return (
    <div className="doc-article-body">
      {body.map((block, i) => {
        if (block.type === "p") {
          return <p key={i} className="doc-p">{block.content}</p>;
        }
        if (block.type === "h3") {
          return <h3 key={i} className="doc-h3">{block.content}</h3>;
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="doc-list">
              {block.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          );
        }
        if (block.type === "code") {
          return (
            <div key={i} className="doc-code-block">
              <div className="doc-code-header">
                <span className="doc-code-lang">{block.lang}</span>
              </div>
              <pre><code>{block.content}</code></pre>
            </div>
          );
        }
        if (block.type === "table") {
          return (
            <div key={i} className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>{block.cols.map((c) => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "steps") {
          return (
            <ol key={i} className="doc-steps">
              {block.items.map((step) => (
                <li key={step.n} className="doc-step">
                  <span className="doc-step-n">{step.n}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function DocsPage() {
  const [activeSectionId, setActiveSectionId] = useState("getting-started");
  const [activeArticleId, setActiveArticleId] = useState("gs-overview");
  const [search, setSearch] = useState("");

  const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];

  const filteredArticles = search.trim()
    ? SECTIONS.flatMap((s) =>
        s.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.body.some(
              (b) =>
                b.content?.toLowerCase().includes(search.toLowerCase()) ||
                b.items?.some((item) =>
                  (typeof item === "string" ? item : item.text)
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
            )
        ).map((a) => ({ ...a, sectionLabel: s.label }))
      )
    : null;

  const displayArticles = filteredArticles ?? activeSection.articles;
  const activeArticle =
    (filteredArticles
      ? filteredArticles.find((a) => a.id === activeArticleId)
      : activeSection.articles.find((a) => a.id === activeArticleId)) ||
    displayArticles[0];

  function selectArticle(id, sectionId) {
    if (sectionId) setActiveSectionId(sectionId);
    setActiveArticleId(id);
    setSearch("");
  }

  return (
    <div className="docs-page">
      {/* Left sidebar */}
      <aside className="docs-sidebar panel">
        <div className="docs-search-wrap">
          <input
            className="docs-search"
            type="search"
            placeholder="Search docs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search documentation"
          />
        </div>

        {search.trim() ? (
          <div className="docs-nav-section">
            <p className="docs-nav-category">Results ({filteredArticles.length})</p>
            {filteredArticles.length === 0 && (
              <p className="docs-empty">No results for "{search}"</p>
            )}
            {filteredArticles.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`docs-nav-link ${activeArticle?.id === a.id ? "active" : ""}`}
                onClick={() => setActiveArticleId(a.id)}
              >
                <span>{a.title}</span>
                <span className="docs-nav-section-label">{a.sectionLabel}</span>
              </button>
            ))}
          </div>
        ) : (
          SECTIONS.map((section) => (
            <div key={section.id} className="docs-nav-section">
              <button
                type="button"
                className={`docs-nav-category-btn ${activeSectionId === section.id ? "active" : ""}`}
                onClick={() => {
                  setActiveSectionId(section.id);
                  setActiveArticleId(section.articles[0].id);
                }}
              >
                {section.label}
              </button>
              {activeSectionId === section.id &&
                section.articles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`docs-nav-link ${activeArticleId === a.id ? "active" : ""}`}
                    onClick={() => setActiveArticleId(a.id)}
                  >
                    {a.title}
                  </button>
                ))}
            </div>
          ))
        )}
      </aside>

      {/* Main content */}
      <div className="docs-main">
        {activeArticle ? (
          <article className="panel docs-article">
            <header className="docs-article-header">
              <div>
                <p className="docs-breadcrumb">
                  {search.trim()
                    ? activeArticle.sectionLabel
                    : activeSection.label}
                </p>
                <h2 className="docs-article-title">{activeArticle.title}</h2>
              </div>
              <span className="docs-updated">Updated {activeArticle.updated}</span>
            </header>
            <ArticleBody body={activeArticle.body} />
          </article>
        ) : (
          <div className="panel docs-empty-main">
            <p>Select an article from the sidebar.</p>
          </div>
        )}

        {/* Article list for current section */}
        {!search.trim() && (
          <div className="docs-article-list">
            {activeSection.articles
              .filter((a) => a.id !== activeArticle?.id)
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="docs-article-card panel"
                  onClick={() => setActiveArticleId(a.id)}
                >
                  <strong>{a.title}</strong>
                  <span>Updated {a.updated}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
