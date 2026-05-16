import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import SidebarNav from "./components/SidebarNav";
import KpiCards from "./components/KpiCards";
import SuppliersPage from "./pages/SuppliersPage";
import CasualEmployeesPage from "./pages/CasualEmployeesPage";
import DocsPage from "./pages/DocsPage";
import AutoEntriesPage from "./pages/AutoEntriesPage";
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
      brand: "Jinsing",
      subtitle: "Docs and demo access",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "projects", label: "Projects", icon: "projects" },
        { id: "suppliers", label: "Suppliers", icon: "suppliers" },
        { id: "employees", label: "Casual Employees", icon: "employees" },
        { id: "finance", label: "Finance", icon: "finance" },
        { id: "reports", label: "Reports", icon: "reports" },
        { id: "docs", label: "Documentation", icon: "docs" },
        { id: "entries", label: "Auto Entries", icon: "entries" },
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
      brand: "Jinsing",
      subtitle: "文档与演示访问",
      items: [
        { id: "dashboard", label: "仪表盘", icon: "dashboard" },
        { id: "projects", label: "项目", icon: "projects" },
        { id: "供应商", label: "供应商", icon: "suppliers" },
        { id: "employees", label: "临时员工", icon: "employees" },
        { id: "finance", label: "财务", icon: "finance" },
        { id: "reports", label: "报表", icon: "reports" },
        { id: "docs", label: "文档", icon: "docs" },
        { id: "entries", label: "自动录入", icon: "entries" },
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

const LANDING_CONTENT = {
  en: {
    topbar: {
      docs: "Documentation",
      login: "Login",
    },
    hero: {
      eyebrow: "JINSING Construction Platform",
      title: "Project management for JINSING.",
      description:
        "Track projects, costs, suppliers, and field teams. Log in to access your workspace.",
      cta: "Login to Platform",
    },
    capabilities: [
      { code: "PRJ", title: "Project Tracking", text: "Milestones, progress, and budget in one view." },
      { code: "CST", title: "Cost Management", text: "Accurate estimates and transparent spend tracking." },
      { code: "SUP", title: "Suppliers", text: "Supplier records, contacts, and payment terms." },
      { code: "FLD", title: "Field Teams", text: "Casual employee records, skills, and daily rates." },
    ],
    docsTitle: "Documentation",
    docs: [
      "API Reference - GraphQL schema, authentication, and rate limits",
      "Mobile App Guide - Offline setup, receipt scanning, and daily logs",
      "Integration Tutorials - M-Pesa, OCR, and weather data flows",
      "Compliance Workflows - NCA, KRA, audit trails, and exports",
      "Database Schema - Jinsing tables and operational entities explained",
      "Video Walkthroughs - Short tours for onboarding and technical teams",
    ],
    docsCta: "Browse Documentation",
    footerCta: "Log in to access all platform features.",
    footerLogin: "Login",
    // keep for other pages
    signals: [
      {
        label: "Access model",
        value: "JINSING",
        note: "Provisioned accounts for JINSING project teams",
      },
      {
        label: "API surface",
        value: "GraphQL",
        note: "Authentication, schema patterns, and workflow examples",
      },
      {
        label: "Demo projects",
        value: "Live",
        note: "Preloaded sample data for feature walkthroughs",
      },
      {
        label: "Feedback loop",
        value: "Direct",
        note: "Feature requests and bug reports go to the product team",
      },
    ],
    metrics: [
      { label: "Documentation modules", value: "6", note: "API, mobile, compliance, integrations" },
      { label: "Project teams", value: "JINSING", note: "Construction, engineering, and PM personnel" },
      { label: "Demo projects", value: "3", note: "Preloaded scenarios to explore core workflows" },
      { label: "Response window", value: "24h", note: "Fast onboarding and feedback turnaround" },
    ],
    featuresTitle: "Your Access Includes",
    features: [
      {
        code: "DOC",
        title: "Complete Documentation",
        text: "API guides, integration tutorials, workflow examples, and implementation notes.",
      },
      {
        code: "KEY",
        title: "Login Credentials",
        text: "A guided onboarding flow for dashboard and sandbox access.",
      },
      {
        code: "DEM",
        title: "Demo Project",
        text: "Preloaded project data so teams can explore without setup overhead.",
      },
      {
        code: "COM",
        title: "Team Collaboration",
        text: "JINSING project members share a common workspace for updates and discussion.",
      },
      {
        code: "UPD",
        title: "Update Notifications",
        text: "Be first to know when integrations, guides, and workflows ship.",
      },
      {
        code: "BUG",
        title: "Bug Reporting",
        text: "Send product issues directly to the build team while the platform evolves.",
      },
    ],
    stepsTitle: "Get Started in 2 Minutes",
    steps: [
      { step: "01", title: "Request Access", text: "Submit your name, email, and role. Requests are reviewed and onboarded by the platform team." },
      { step: "02", title: "Verify", text: "Confirm your email and receive onboarding links for docs and platform credentials." },
      { step: "03", title: "Login & Explore", text: "Open the dashboard, browse docs, and test with JINSING demo project data." },
    ],
    docsTitle: "What's Inside Our Documentation?",
    docs: [
      "API Reference - GraphQL schema, authentication, and rate limits",
      "Mobile App Guide - Offline setup, receipt scanning, and daily logs",
      "Integration Tutorials - M-Pesa, OCR, and weather data flows",
      "Compliance Workflows - NCA, KRA, audit trails, and exports",
      "Database Schema - Jinsing tables and operational entities explained",
      "Video Walkthroughs - Short tours for onboarding and technical teams",
    ],
    docsCta: "Browse Public Docs",
    audiencesTitle: "JINSING Roles",
    audiences: [
      { role: "Site Manager", text: "Track expenses, documentation, and site teams with local-first workflows." },
      { role: "Systems Team", text: "Integrate Jinsing into JINSING's existing systems through a documented GraphQL surface." },
      { role: "Architect / Engineer", text: "Collaborate on RFIs, inspections, and technical submissions." },
      { role: "Project Manager", text: "Review dashboards, forecasts, and compliance snapshots in one place." },
    ],
    roadmapTitle: "Platform Roadmap",
    roadmapCopy:
      "Jinsing is under active development. Feedback from JINSING project teams directly shapes priority features and integrations.",
    roadmap: [
      { status: "Live", title: "AI receipt scanning", detail: "Beta workflows available in the demo environment" },
      { status: "Next", title: "M-Pesa integration", detail: "Payment and reconciliation flows in the current roadmap" },
      { status: "Next", title: "Mobile offline forms", detail: "Field capture designed for low-connectivity site operations" },
      { status: "Later", title: "NCA direct filing", detail: "Compliance automation planned after core feedback rounds" },
    ],
    feedbackCta: "Request Feature",
    testimonialsTitle: "Platform Capabilities",
    testimonials: [
      {
        quote: "The documentation is specific enough that integration teams can map the approach in two days.",
        author: "Platform Team",
        role: "Documentation & API surface",
      },
      {
        quote: "The demo environment is preloaded with realistic Kenyan construction project data for immediate evaluation.",
        author: "Platform Team",
        role: "Demo environment",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        question: "Who can request access?",
        answer: "Access is provisioned for JINSING project personnel. Submit your request and our team will onboard you directly.",
      },
      {
        question: "What do I get after registering?",
        answer: "You receive onboarding links, documentation access, sandbox credentials, and a demo environment with preloaded JINSING-relevant project data.",
      },
      {
        question: "Can I use Jinsing for live JINSING projects?",
        answer: "Yes for documentation, reporting, and workflow evaluation. Full rollout depends on your team's operational readiness review.",
      },
      {
        question: "How do I report issues or request features?",
        answer: "Use the feature request link or contact the platform team directly so we can triage feedback from JINSING teams.",
      },
    ],
    finalTitle: "Request Platform Access",
    finalCopy: "Submit your request and get onboarding links, documentation access, and demo credentials.",
    finalPrimary: "Request Access",
    finalSecondary: "Browse Documentation",
    finalNote: "Access is provisioned for authorised JINSING project personnel.",
  },
};

LANDING_CONTENT.zh = LANDING_CONTENT.en;

export default function App() {
  const [lang, setLang] = useState("en");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [apiToken, setApiToken] = useState("");
  const [tokenState, setTokenState] = useState("idle");
  const [selectedProject, setSelectedProject] = useState(null);
  const t = COPY[lang];
  const landing = LANDING_CONTENT[lang] || LANDING_CONTENT.en;
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
  const featuredProjects = displayProjects.slice(0, 3);
  const demoProject = featuredProjects[0] || DEMO_PROJECTS[0];

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

  function scrollToSection(id) {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleFeatureRequest() {
    if (typeof window === "undefined") {
      return;
    }

    window.location.href = "mailto:support@jinsing.com?subject=Jinsing%20Feature%20Request";
  }

  const pageTitle = {
    dashboard: lang === "en" ? "Dashboard" : "仪表盘",
    projects: lang === "en" ? "Projects" : "项目",
    suppliers: lang === "en" ? "Suppliers" : "供应商",
    employees: lang === "en" ? "Casual Employees" : "临时员工",
    finance: lang === "en" ? "Finance" : "财务",
    reports: lang === "en" ? "Reports" : "报表",
    docs: lang === "en" ? "Documentation" : "文档",
    entries: lang === "en" ? "Auto Entries" : "自动录入",
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
    docs:
      lang === "en"
        ? "Guides, API references, and tutorials for the Jinsing platform."
        : "Jinsing 平台的指南、API 参考和教程。",
    entries:
      lang === "en"
        ? "Automated expense, time, and material entries from all sources."
        : "来自所有来源的自动费用、时间和材料记录。",
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

  // Derive admin manage URL for a project row ID
  function getManageUrl(projectId) {
    const base =
      typeof window !== "undefined" && window.jinsing?.adminUrl
        ? window.jinsing.adminUrl
        : "/wp-admin/";
    return `${base}admin.php?page=construction-mgmt-project-management&id=${projectId}`;
  }

  // Derive public view URL for a project (CPT post)
  function getViewUrl(project) {
    if (project?.publicUrl) return project.publicUrl;
    if (typeof window !== "undefined" && window.jinsing?.siteUrl) {
      return `${window.jinsing.siteUrl}/projects/`;
    }
    return null;
  }

  function ProjectCard({ project, onDetail }) {
    const health = getProjectHealth(project);
    const actionRequired = project.milestones.some(
      (ms) => ms.status !== "completed" && new Date(ms.dueDate) < new Date()
    );
    const viewUrl = getViewUrl(project);
    const manageUrl = getManageUrl(project.id);

    return (
      <div className="project-card">
        <div className="project-card-header">
          <h3 className="project-card-name">{project.name}</h3>
          <span className={`project-health ${health.tone}`}>{health.label}</span>
        </div>

        <p className="project-status">
          <span className={`proj-status-pill proj-status-pill--${project.status}`}>
            {project.status.replace(/_/g, " ")}
          </span>
        </p>

        <div className="proj-progress-row">
          <div className="progress-bar" role="progressbar"
            aria-valuenow={project.progressPercent}
            aria-valuemin={0} aria-valuemax={100}
            aria-label={`${project.progressPercent.toFixed(1)}% complete`}>
            <div className="progress-bar-fill" style={{ width: `${project.progressPercent}%` }} />
          </div>
          <span className="proj-pct">{formatPercent(project.progressPercent)}</span>
        </div>

        {actionRequired && (
          <p className="action-required">⚠ Action Required</p>
        )}

        <div className="project-card-actions">
          <button
            type="button"
            className="pc-btn pc-btn--primary"
            onClick={() => onDetail(project)}
          >
            View Project
          </button>
          <a
            href={manageUrl}
            className="pc-btn pc-btn--secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage Project
          </a>
        </div>
      </div>
    );
  }

  function ProjectDetailPanel({ project, onClose }) {
    if (!project) return null;
    const health = getProjectHealth(project);
    const viewUrl = getViewUrl(project);
    const manageUrl = getManageUrl(project.id);
    const msTotal = project.milestones.length;
    const msDone  = project.milestones.filter((m) => m.status === "completed").length;

    const statusIcon = { completed: "✓", in_progress: "◎", not_started: "○", blocked: "✕" };

    return (
      <div className="pd-overlay" role="dialog" aria-modal="true"
        aria-label={project.name}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="pd-panel">
          <div className="pd-panel-head">
            <div className="pd-panel-title-group">
              <span className={`proj-status-pill proj-status-pill--${project.status}`}>
                {project.status.replace(/_/g, " ")}
              </span>
              <h2 className="pd-title">{project.name}</h2>
              <span className={`project-health ${health.tone}`}>{health.label}</span>
            </div>
            <button type="button" className="pd-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          {project.description && (
            <p className="pd-description">{project.description}</p>
          )}

          <div className="pd-stats">
            <div className="pd-stat">
              <span className="pd-stat-label">Budget</span>
              <span className="pd-stat-value">{formatCurrency(project.budgetTotal)}</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-label">Spent</span>
              <span className="pd-stat-value">{formatCurrency(project.budgetSpent)}</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-label">Progress</span>
              <span className="pd-stat-value gold">{formatPercent(project.progressPercent)}</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-label">Milestones</span>
              <span className="pd-stat-value">{msDone}/{msTotal}</span>
            </div>
          </div>

          <div className="pd-dates">
            <span>Start: <strong>{project.startDate || "—"}</strong></span>
            <span>End: <strong>{project.endDate || "—"}</strong></span>
          </div>

          <div className="pd-progress-row">
            <div className="progress-bar pd-progress-bar" role="progressbar"
              aria-valuenow={project.progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar-fill" style={{ width: `${project.progressPercent}%` }} />
            </div>
            <span className="proj-pct gold">{formatPercent(project.progressPercent)}</span>
          </div>

          {project.milestones.length > 0 && (
            <div className="pd-milestones">
              <h3 className="pd-section-title">Milestones</h3>
              <ul className="pd-ms-list">
                {project.milestones.map((ms) => (
                  <li key={ms.id} className={`pd-ms pd-ms--${ms.status}`}>
                    <span className="pd-ms-icon">{statusIcon[ms.status] ?? "○"}</span>
                    <span className="pd-ms-title">{ms.title}</span>
                    <span className="pd-ms-date">{ms.dueDate}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pd-actions">
            {viewUrl && (
              <a href={viewUrl} target="_blank" rel="noopener noreferrer"
                className="pc-btn pc-btn--primary pd-action-btn">
                View Public Page ↗
              </a>
            )}
            <a href={manageUrl} target="_blank" rel="noopener noreferrer"
              className="pc-btn pc-btn--secondary pd-action-btn">
              Manage Project ↗
            </a>
            <button type="button" className="pc-btn pc-btn--ghost pd-action-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ProjectGrid({ projects }) {
    return (
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDetail={setSelectedProject}
          />
        ))}
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
              {/* Topbar */}
              <section className="lp-topbar panel">
                <div className="lp-brand">
                  <strong>Jinsing</strong>
                  <span>Construction Platform</span>
                </div>
                <div className="lp-topbar-actions">
                  <button
                    type="button"
                    className="topbar-link"
                    onClick={() => scrollToSection("lp-docs")}
                  >
                    {landing.topbar.docs}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setActiveNav("settings")}
                  >
                    {landing.topbar.login}
                  </button>
                </div>
              </section>

              {/* Hero */}
              <section className="lp-hero panel">
                <p className="lp-eyebrow">{landing.hero.eyebrow}</p>
                <h1 className="lp-title">{landing.hero.title}</h1>
                <p className="lp-desc">{landing.hero.description}</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setActiveNav("settings")}
                >
                  {landing.hero.cta}
                </button>
              </section>

              {/* Capability cards */}
              <div className="lp-caps-grid">
                {landing.capabilities.map((cap) => (
                  <article key={cap.code} className="lp-cap-card panel">
                    <span className="lp-cap-code">{cap.code}</span>
                    <h3 className="lp-cap-title">{cap.title}</h3>
                    <p className="lp-cap-text">{cap.text}</p>
                  </article>
                ))}
              </div>

              {/* Documentation */}
              <section id="lp-docs" className="panel lp-docs-section">
                <div className="panel-head">
                  <h2 className="lp-section-title">{landing.docsTitle}</h2>
                  <span className="chip">Public</span>
                </div>
                <div className="lp-docs-list">
                  {landing.docs.map((item) => (
                    <article key={item} className="lp-doc-item">
                      <strong>{item.split(" - ")[0]}</strong>
                      <span>{item.split(" - ")[1]}</span>
                    </article>
                  ))}
                </div>
              </section>

              {/* Login CTA footer */}
              <section className="lp-footer-cta panel">
                <p>{landing.footerCta}</p>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setActiveNav("settings")}
                >
                  {landing.footerLogin}
                </button>
              </section>
            </>
          )}

          {selectedProject && (
            <ProjectDetailPanel
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
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

          {activeNav === "docs" && <DocsPage />}

          {activeNav === "entries" && <AutoEntriesPage />}

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
