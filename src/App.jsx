import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import SidebarNav from "./components/SidebarNav";
import QuoteForm from "./components/QuoteForm";
import SuppliersPage from "./pages/SuppliersPage";
import CasualEmployeesPage from "./pages/CasualEmployeesPage";
import apolloClient, {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "./lib/apollo";

const GET_PROJECTS = gql`
  query GetProjects($status: String) {
    projects(status: $status) {
      id
      name
      description
      status
      budgetTotal
      budgetSpent
      progressPercent
      startDate
      endDate
      milestones {
        id
        title
        dueDate
        status
      }
    }
  }
`;

function formatCurrency(value) {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatPercent(value) {
  const numericValue = Number(value ?? 0);

  return `${Number.isFinite(numericValue) ? numericValue.toFixed(1) : "0.0"}%`;
}

const PROJECT_TEMPLATES = [
  {
    id: "residential",
    title: "Residential Build",
    budgetBand: "$80k-$450k",
    defaultMilestones: ["Permits", "Foundation", "Structure", "MEP", "Hand-over"],
  },
  {
    id: "commercial",
    title: "Commercial Fit-out",
    budgetBand: "$300k-$2.5M",
    defaultMilestones: ["Design Freeze", "Procurement", "Fit-out", "Commissioning", "Occupancy"],
  },
  {
    id: "infrastructure",
    title: "Infrastructure Works",
    budgetBand: "$1M-$15M",
    defaultMilestones: ["Survey", "Earthworks", "Utilities", "Asphalt/Concrete", "Final Inspection"],
  },
];

const DEMO_PROJECTS = [
  {
    id: 9001,
    name: "Westlands Residential Block A",
    description: "Mid-rise residential development with phased handover and tight procurement controls.",
    status: "active",
    budgetTotal: 420000,
    budgetSpent: 265000,
    progressPercent: 63.1,
    startDate: "2026-01-15",
    endDate: "2026-09-30",
    milestones: [
      { id: 1, title: "Permits Approved", dueDate: "2026-02-01", status: "completed" },
      { id: 2, title: "Structure Complete", dueDate: "2026-06-10", status: "in_progress" },
      { id: 3, title: "MEP First Fix", dueDate: "2026-06-20", status: "not_started" },
    ],
  },
  {
    id: 9002,
    name: "CBD Commercial Fit-out",
    description: "Corporate office fit-out focused on timeline compression and staged commissioning.",
    status: "active",
    budgetTotal: 980000,
    budgetSpent: 905000,
    progressPercent: 82.5,
    startDate: "2025-11-01",
    endDate: "2026-07-15",
    milestones: [
      { id: 4, title: "Design Freeze", dueDate: "2026-02-10", status: "completed" },
      { id: 5, title: "Commissioning", dueDate: "2026-05-10", status: "in_progress" },
      { id: 6, title: "Occupancy Readiness", dueDate: "2026-05-22", status: "not_started" },
    ],
  },
  {
    id: 9003,
    name: "Eastern Bypass Drainage Upgrade",
    description: "Infrastructure package with weather-sensitive sequencing and utility coordination risks.",
    status: "on_hold",
    budgetTotal: 1800000,
    budgetSpent: 1220000,
    progressPercent: 67.8,
    startDate: "2025-08-20",
    endDate: "2026-11-28",
    milestones: [
      { id: 7, title: "Earthworks", dueDate: "2026-03-30", status: "completed" },
      { id: 8, title: "Culvert Installation", dueDate: "2026-05-01", status: "in_progress" },
      { id: 9, title: "Final Inspection", dueDate: "2026-05-05", status: "not_started" },
    ],
  },
];

function getProjectHealth(project) {
  const total = Number(project?.budgetTotal ?? 0);
  const spent = Number(project?.budgetSpent ?? 0);
  const utilization = total > 0 ? spent / total : 0;
  const today = new Date();
  const lateMilestones = (project?.milestones ?? []).filter((milestone) => {
    if (!milestone?.dueDate || milestone?.status === "completed") {
      return false;
    }
    return new Date(milestone.dueDate) < today;
  }).length;

  if (utilization >= 1 || lateMilestones > 0) {
    return { label: "At Risk", tone: "risk" };
  }

  if (utilization >= 0.85) {
    return { label: "Watch", tone: "watch" };
  }

  return { label: "Healthy", tone: "healthy" };
}

function getPortfolioSummary(projects) {
  const total = projects.length;
  const budgetTotal = projects.reduce((sum, item) => sum + Number(item?.budgetTotal ?? 0), 0);
  const budgetSpent = projects.reduce((sum, item) => sum + Number(item?.budgetSpent ?? 0), 0);
  const avgProgress =
    total > 0
      ? projects.reduce((sum, item) => sum + Number(item?.progressPercent ?? 0), 0) / total
      : 0;
  const atRisk = projects.filter((project) => getProjectHealth(project).tone === "risk").length;

  return {
    total,
    active: projects.filter((project) => project?.status === "active").length,
    completed: projects.filter((project) => project?.status === "completed").length,
    atRisk,
    budgetTotal,
    budgetSpent,
    avgProgress,
  };
}

function getMilestoneAlerts(projects) {
  const today = new Date();
  const maxDays = 14;

  const alerts = [];

  projects.forEach((project) => {
    (project?.milestones ?? []).forEach((milestone) => {
      if (!milestone?.dueDate || milestone?.status === "completed") {
        return;
      }

      const dueDate = new Date(milestone.dueDate);
      const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (daysRemaining <= maxDays) {
        alerts.push({
          projectName: project?.name || "Project",
          title: milestone?.title || "Milestone",
          dueDate: milestone.dueDate,
          daysRemaining,
        });
      }
    });
  });

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 6);
}

const COPY = {

  en: {
    languageLabel: "Language",
    sidebar: {
      brand: "JEEA",
      subtitle: "Construction admin",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "projects", label: "Projects", icon: "projects" },
        { id: "suppliers", label: "Suppliers", icon: "suppliers" },
        { id: "employees", label: "Casual Employees", icon: "employees" },
        { id: "finance", label: "Finance", icon: "finance" },
        { id: "reports", label: "Reports", icon: "reports" },
        { id: "settings", label: "Settings", icon: "settings" },
      ],
    },
    hero: {
      eyebrow: "Construction Intelligence",
      title: "JEEA",
      description:
        "Engineering progress, financial clarity, and field execution in one command surface.",
    },
    landing: {
      title: "Construction and Engineering Services",
      subtitle: "Experience and precision.",
      description:
        "JEEA manages complex construction and engineering projects with disciplined planning, clear communication, and financial accountability.",
      quoteCta: "Request a Quote",
      loginCta: "Employee Login",
      safetyNote: "Quotes are reviewed by our team and returned within 24 hours.",
      highlights: [
        {
          title: "Project Planning",
          text: "Clear schedules, defined milestones, coordinated delivery across all disciplines.",
        },
        {
          title: "Engineering Coordination",
          text: "RFI resolution, design verification, and field approvals managed from start to completion.",
        },
        {
          title: "Cost Management",
          text: "Accurate estimates, transparent tracking, and budget discipline on every phase.",
        },
      ],
    },
  },
  zh: {
    languageLabel: "语言",
    sidebar: {
      brand: "JEEA",
      subtitle: "施工管理",
      items: [
        { id: "dashboard", label: "仪表盘", icon: "dashboard" },
        { id: "projects", label: "项目", icon: "projects" },
        { id: "suppliers", label: "供应商", icon: "suppliers" },
        { id: "employees", label: "临时员工", icon: "employees" },
        { id: "finance", label: "财务", icon: "finance" },
        { id: "reports", label: "报表", icon: "reports" },
        { id: "settings", label: "设置", icon: "settings" },
      ],
    },
    hero: {
      eyebrow: "施工智能",
      title: "JEEA",
      description: "将工程进度、财务透明度与现场执行统一到一个指挥界面。",
    },
    landing: {
      title: "建筑与工程服务",
      subtitle: "经验与精准。",
      description:
        "JEEA 通过有序的规划、清晰的沟通和财务问责管理复杂的建筑和工程项目。",
      quoteCta: "申请报价",
      loginCta: "员工登录",
      safetyNote: "报价由我们的团队审核，24 小时内反馈。",
      highlights: [
        {
          title: "项目规划",
          text: "清晰的计划、明确的里程碑、全学科的协同交付。",
        },
        {
          title: "工程协调",
          text: "从始至终管理 RFI 解决、设计验证和现场审批。",
        },
        {
          title: "成本管理",
          text: "精准估算、透明追踪、每个阶段的预算控制。",
        },
      ],
    },
  },
};

export default function App() {
  const [lang, setLang] = useState("en");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [tokenState, setTokenState] = useState("idle");
  const t = COPY[lang];
  const isPortfolioView = activeNav === "projects" || activeNav === "dashboard";
  const { data, loading, error } = useQuery(GET_PROJECTS, {
    skip: !isPortfolioView,
    fetchPolicy: "cache-and-network",
  });
  const projects = data?.projects ?? [];
  const hasLiveProjects = projects.length > 0;
  const displayProjects = hasLiveProjects ? projects : DEMO_PROJECTS;
  const isDemoMode = !loading && !hasLiveProjects;
  const portfolioSummary = getPortfolioSummary(displayProjects);
  const milestoneAlerts = getMilestoneAlerts(displayProjects);

  useEffect(() => {
    const existingToken = getStoredAuthToken();
    setApiToken(existingToken);
  }, []);

  function handleSaveToken() {
    const trimmedToken = apiToken.trim();

    if (!trimmedToken) {
      clearStoredAuthToken();
      setTokenState("cleared");
      return;
    }

    setStoredAuthToken(trimmedToken);
    setTokenState("saved");
    apolloClient.resetStore().catch(() => {});
    setActiveNav("projects");
  }

  function handleClearToken() {
    clearStoredAuthToken();
    setApiToken("");
    setTokenState("cleared");
    apolloClient.resetStore().catch(() => {});
  }

  const pageTitle = {
    dashboard: lang === "en" ? "Dashboard" : "仪表盘",
    projects: lang === "en" ? "Projects" : "项目",
    suppliers: lang === "en" ? "Suppliers" : "供应商",
    employees: lang === "en" ? "Casual Employees" : "临时员工",
    finance: lang === "en" ? "Finance" : "财务",
    reports: lang === "en" ? "Reports" : "报表",
    settings: lang === "en" ? "Settings" : "设置",
  }[activeNav];

  const pageBlurb = {
    dashboard:
      lang === "en"
        ? "At-a-glance operational overview for engineering and finance teams."
        : "面向工程与财务团队的一览式运营总览。",
    projects:
      lang === "en"
        ? "Project planning, delivery, and milestones will be detailed here."
        : "项目策划、交付和里程碑将在这里展示。",
    suppliers:
      lang === "en"
        ? "Manage supplier information, contact details, and payment terms."
        : "管理供应商信息、联系方式和支付条款。",
    employees:
      lang === "en"
        ? "Manage casual employees, skills, daily rates, and compliance documentation."
        : "管理临时员工、技能、日工资和合规文件。",
    finance:
      lang === "en"
        ? "Budget controls, costs, and forecasts will be tracked here."
        : "预算控制、成本和预测将在这里跟踪。",
    reports:
      lang === "en"
        ? "Executive summaries and reporting views will live here."
        : "管理层摘要和报表视图将在这里呈现。",
    settings:
      lang === "en"
        ? "System preferences and access controls will be configured here."
        : "系统偏好和访问控制将在这里配置。",
  }[activeNav];

  function ProjectView({ project, viewMode }) {
    if (viewMode === "sneak") {
      return (
        <div className="project-sneak-view">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
      );
    }

    if (viewMode === "full") {
      return (
        <div className="project-full-view">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <dl>
            <div>
              <dt>{lang === "en" ? "Budget" : "预算"}</dt>
              <dd>{formatCurrency(project.budgetTotal)}</dd>
            </div>
            <div>
              <dt>{lang === "en" ? "Spent" : "已支出"}</dt>
              <dd>{formatCurrency(project.budgetSpent)}</dd>
            </div>
            <div>
              <dt>{lang === "en" ? "Progress" : "进度"}</dt>
              <dd>{formatPercent(project.progressPercent)}</dd>
            </div>
          </dl>
          <ul>
            {project.milestones.map((milestone) => (
              <li key={milestone.id}>{milestone.title} - {milestone.status}</li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  }

  function DocumentView({ documents }) {
    return (
      <div className="document-view">
        <h3>Project Documents</h3>
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                {doc.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function ProjectGrid({ projects }) {
    return (
      <div className="project-grid">
        {projects.map((project) => {
          const health = getProjectHealth(project);
          const actionRequired = project.milestones.some(
            (milestone) => milestone.status === "not_started" && new Date(milestone.dueDate) < new Date()
          );

          return (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`project-health ${health.tone}`}>{health.label}</span>
              </div>
              <p className="project-status">Status: {project.status}</p>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${project.progressPercent}%` }}
                ></div>
              </div>
              <p className="project-supervisor">Site Supervisor: {project.supervisor || "N/A"}</p>
              {actionRequired && <p className="action-required">Action Required!</p>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <main className="app">
      <div className="dashboard-layout">
        <SidebarNav
          brand={t.sidebar.brand}
          subtitle={t.sidebar.subtitle}
          items={t.sidebar.items}
          activeId={activeNav}
          onSelect={setActiveNav}
        />

        <div className="dashboard-shell">
          <div className="language-row">
            <span className="language-label">{t.languageLabel}</span>
            <div className="language-switch" role="group" aria-label={t.languageLabel}>
              <button
                type="button"
                className={`lang-btn ${lang === "en" ? "active" : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === "zh" ? "active" : ""}`}
                onClick={() => setLang("zh")}
              >
                中文
              </button>
            </div>
          </div>

          {activeNav === "dashboard" && (
            <>
              {showQuoteForm && (
                <div className="quote-form-modal-overlay">
                  <div className="quote-form-modal">
                    <button
                      className="modal-close"
                      onClick={() => setShowQuoteForm(false)}
                      aria-label="Close form"
                    >
                      ✕
                    </button>
                    <QuoteForm
                      lang={lang}
                      onClose={() => setShowQuoteForm(false)}
                    />
                  </div>
                </div>
              )}

              <section className="landing-hero panel">
                <p className="eyebrow">{t.hero.eyebrow}</p>
                <h1>{t.landing.title}</h1>
                <p className="hero-subtitle">{t.landing.subtitle}</p>
                <p className="hero-copy">{t.landing.description}</p>
                <div className="landing-cta-row">
                  <button
                    type="button"
                    className="cta-btn cta-primary"
                    onClick={() => setShowQuoteForm(true)}
                  >
                    {t.landing.quoteCta}
                  </button>
                  <button
                    type="button"
                    className="cta-btn cta-secondary"
                    onClick={() => setActiveNav("settings")}
                  >
                    {t.landing.loginCta}
                  </button>
                </div>
                <p className="safe-note">{t.landing.safetyNote}</p>
              </section>

              <section className="landing-showcase-grid">
                {t.landing.highlights.map((item) => (
                  <article key={item.title} className="showcase-card">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </section>

              <section className="panel panel-spacer">
                <div className="panel-head">
                  <h2>{lang === "en" ? "Portfolio Health" : "项目组合健康"}</h2>
                  <span className="chip">{lang === "en" ? "Multi-Project" : "多项目"}</span>
                </div>
                {isDemoMode && (
                  <div className="demo-mode-banner">
                    {lang === "en"
                      ? "Showing demo portfolio data. Connect your GraphQL permissions to switch to live project health."
                      : "当前显示演示组合数据。连接 GraphQL 权限后将自动切换为实时项目健康数据。"}
                  </div>
                )}
                {loading ? (
                  <p className="projects-state-copy">{lang === "en" ? "Loading portfolio metrics..." : "正在加载组合指标..."}</p>
                ) : (
                  <div className="kpi-grid">
                    <article className="kpi-card">
                      <p className="kpi-label">{lang === "en" ? "Total Projects" : "项目总数"}</p>
                      <p className="kpi-value">{portfolioSummary.total}</p>
                      <p className="kpi-note">{lang === "en" ? `${portfolioSummary.active} active` : `${portfolioSummary.active} 个进行中`}</p>
                    </article>
                    <article className="kpi-card">
                      <p className="kpi-label">{lang === "en" ? "At Risk" : "风险项目"}</p>
                      <p className="kpi-value">{portfolioSummary.atRisk}</p>
                      <p className="kpi-note">{lang === "en" ? `${portfolioSummary.completed} completed` : `${portfolioSummary.completed} 个已完成`}</p>
                    </article>
                    <article className="kpi-card">
                      <p className="kpi-label">{lang === "en" ? "Budget Performance" : "预算表现"}</p>
                      <p className="kpi-value">{formatPercent(portfolioSummary.budgetTotal > 0 ? (portfolioSummary.budgetSpent / portfolioSummary.budgetTotal) * 100 : 0)}</p>
                      <p className="kpi-note">{`${formatCurrency(portfolioSummary.budgetSpent)} / ${formatCurrency(portfolioSummary.budgetTotal)}`}</p>
                    </article>
                    <article className="kpi-card">
                      <p className="kpi-label">{lang === "en" ? "Average Progress" : "平均进度"}</p>
                      <p className="kpi-value">{formatPercent(portfolioSummary.avgProgress)}</p>
                      <p className="kpi-note">{lang === "en" ? "Cross-project timeline trend" : "跨项目进度趋势"}</p>
                    </article>
                  </div>
                )}

                {milestoneAlerts.length > 0 && (
                  <div className="milestone-alert-strip">
                    {milestoneAlerts.map((alert) => (
                      <article key={`${alert.projectName}-${alert.title}-${alert.dueDate}`} className={`milestone-alert-card ${alert.daysRemaining < 0 ? "overdue" : "upcoming"}`}>
                        <strong>{alert.projectName}</strong>
                        <p>{alert.title}</p>
                        <span>
                          {alert.daysRemaining < 0
                            ? lang === "en"
                              ? `${Math.abs(alert.daysRemaining)} days overdue`
                              : `已逾期 ${Math.abs(alert.daysRemaining)} 天`
                            : lang === "en"
                              ? `Due in ${alert.daysRemaining} days`
                              : `${alert.daysRemaining} 天后到期`}
                        </span>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="panel panel-spacer">
                <div className="panel-head">
                  <h2>{lang === "en" ? "Project Templates" : "项目模板"}</h2>
                  <span className="chip">{lang === "en" ? "Standardized Delivery" : "标准化交付"}</span>
                </div>
                <div className="template-grid">
                  {PROJECT_TEMPLATES.map((template) => (
                    <article key={template.id} className="template-card">
                      <h3>{template.title}</h3>
                      <p>{lang === "en" ? "Typical budget band" : "典型预算区间"}: {template.budgetBand}</p>
                      <ul>
                        {template.defaultMilestones.map((milestone) => (
                          <li key={milestone}>{milestone}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeNav === "projects" && (
            <section className="panel panel-spacer">
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{lang === "en" ? "Delivery" : "交付"}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>

              <ProjectGrid projects={displayProjects} />
              <DocumentView documents={[
                { id: 1, name: "Project Report", url: "/docs/report.pdf" },
                { id: 2, name: "License Document", url: "/docs/license.pdf" },
                { id: 3, name: "Render Design", url: "/docs/render.pdf" },
              ]} />
            </section>
          )}

          {activeNav === "suppliers" && <SuppliersPage />}

          {activeNav === "employees" && <CasualEmployeesPage />}

          {activeNav === "finance" && (
            <section className="panel panel-spacer">
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{lang === "en" ? "Controls" : "控制"}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>
            </section>
          )}

          {activeNav === "reports" && (
            <section className="panel panel-spacer">
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{lang === "en" ? "Overview" : "概览"}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>
            </section>
          )}

          {activeNav === "settings" && (
            <section className="panel panel-spacer">
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{lang === "en" ? "System" : "系统"}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>

              <div className="auth-panel">
                <div className="auth-panel-head">
                  <div>
                    <h3>{lang === "en" ? "GraphQL Access Token" : "GraphQL 访问令牌"}</h3>
                    <p>
                      {lang === "en"
                        ? "Paste a WordPress JWT here to authenticate Apollo requests without a browser session."
                        : "粘贴 WordPress JWT 后，Apollo 请求可在没有浏览器会话的情况下进行身份验证。"}
                    </p>
                  </div>
                  <span className={`auth-status ${apiToken.trim() ? "active" : "inactive"}`}>
                    {apiToken.trim()
                      ? lang === "en"
                        ? "Token stored"
                        : "令牌已保存"
                      : lang === "en"
                        ? "No token"
                        : "未设置令牌"}
                  </span>
                </div>

                <label className="form-field auth-token-field">
                  <span>{lang === "en" ? "JWT Token" : "JWT 令牌"}</span>
                  <textarea
                    rows="4"
                    value={apiToken}
                    onChange={(event) => setApiToken(event.target.value)}
                    placeholder={
                      lang === "en"
                        ? "eyJhbGciOiJIUzI1NiIs..."
                        : "eyJhbGciOiJIUzI1NiIs..."
                    }
                  />
                </label>

                <div className="auth-actions">
                  <button type="button" className="btn-primary" onClick={handleSaveToken}>
                    {lang === "en" ? "Save Token" : "保存令牌"}
                  </button>
                  <button type="button" className="cta-btn cta-secondary" onClick={handleClearToken}>
                    {lang === "en" ? "Clear" : "清除"}
                  </button>
                  <button type="button" className="cta-btn cta-secondary" onClick={() => {
                    setApiToken("");
                    setTokenState("cleared");
                    apolloClient.resetStore().catch(() => {});
                  }}>
                    {lang === "en" ? "Clear Demo Data" : "清除演示数据"}
                  </button>
                </div>

                <p className="auth-help">
                  {lang === "en"
                    ? "Use a token from a WordPress user that has read_projects or manage_construction_projects capability."
                    : "请使用具有 read_projects 或 manage_construction_projects 权限的 WordPress 用户令牌。"}
                </p>

                {tokenState !== "idle" && (
                  <p className="auth-feedback">
                    {tokenState === "saved"
                      ? lang === "en"
                        ? "Token saved. Open Projects to use it."
                        : "令牌已保存。打开项目页即可使用。"
                      : lang === "en"
                        ? "Token cleared."
                        : "令牌已清除。"}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
