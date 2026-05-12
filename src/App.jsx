import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import SidebarNav from "./components/SidebarNav";
import QuoteForm from "./components/QuoteForm";
import {
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

const COPY = {

  en: {
    languageLabel: "Language",
    sidebar: {
      brand: "JEEA",
      subtitle: "Construction admin",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "projects", label: "Projects", icon: "projects" },
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
  const isProjectsView = activeNav === "projects";
  const { data, loading, error } = useQuery(GET_PROJECTS, {
    skip: !isProjectsView,
    fetchPolicy: "cache-and-network",
  });

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
    setActiveNav("projects");
  }

  function handleClearToken() {
    clearStoredAuthToken();
    setApiToken("");
    setTokenState("cleared");
  }

  const pageTitle = {
    dashboard: lang === "en" ? "Dashboard" : "仪表盘",
    projects: lang === "en" ? "Projects" : "项目",
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
            </>
          )}

          {activeNav === "projects" && (
            <section className="panel panel-spacer">
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{lang === "en" ? "Delivery" : "交付"}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>

              <div className="projects-live-block">
                <div className="projects-live-head">
                  <h3>{lang === "en" ? "Live Projects" : "实时项目"}</h3>
                  <span className="projects-endpoint-label">
                    {lang === "en" ? "Connected to GraphQL" : "已连接 GraphQL"}
                  </span>
                </div>

                {loading && (
                  <p className="projects-state-copy">
                    {lang === "en" ? "Loading projects..." : "正在加载项目..."}
                  </p>
                )}

                {!loading && error && (
                  <div className="projects-state-card projects-state-error">
                    <h3>{lang === "en" ? "Unable to load projects" : "无法加载项目"}</h3>
                    <p>
                      {lang === "en"
                        ? "The GraphQL endpoint is reachable, but this view needs a WordPress session with project permissions."
                        : "GraphQL 端点可访问，但此页面需要具有项目权限的 WordPress 登录会话。"}
                    </p>
                  </div>
                )}

                {!loading && !error && data?.projects?.length === 0 && (
                  <div className="projects-state-card">
                    <h3>{lang === "en" ? "No projects returned" : "未返回项目"}</h3>
                    <p>
                      {lang === "en"
                        ? "The endpoint responded successfully, but there are no visible projects for this session."
                        : "端点响应成功，但当前会话下没有可见项目。"}
                    </p>
                  </div>
                )}

                {!loading && !error && data?.projects?.length > 0 && (
                  <div className="project-card-list">
                    {data.projects.map((project) => (
                      <article key={project.id} className="project-card">
                        <div className="project-card-head">
                          <h3>{project.name}</h3>
                          <span className="project-status-pill">{project.status || "active"}</span>
                        </div>
                        <p>{project.description || (lang === "en" ? "No description provided." : "暂无项目说明。")}</p>
                        <dl className="project-metrics">
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
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

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
