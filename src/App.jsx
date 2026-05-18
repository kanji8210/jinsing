import { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import SidebarNav from "./components/SidebarNav";
import KpiCards from "./components/KpiCards";
import SuppliersPage from "./pages/SuppliersPage";
import CasualEmployeesPage from "./pages/CasualEmployeesPage";
import DocsPage from "./pages/DocsPage";
import AutoEntriesPage from "./pages/AutoEntriesPage";
import apolloClient, {
  GRAPHQL_ENDPOINT,
  clearStoredAuthToken,
  clearStoredUser,
  getStoredAuthToken,
  getStoredUser,
  setStoredAuthToken,
  setStoredUser,
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
      metadata {
        clientName
        location
      }
      milestones {
        id
        title
        dueDate
        status
      }
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: Int!
    $name: String
    $description: String
    $status: String
    $budgetTotal: Float
    $budgetSpent: Float
    $startDate: String
    $endDate: String
    $clientName: String
    $location: String
    $contractType: String
    $currency: String
    $budgetContingencyPct: Float
    $qualityStandard: String
  ) {
    updateProject(
      input: {
        id: $id
        name: $name
        description: $description
        status: $status
        budgetTotal: $budgetTotal
        budgetSpent: $budgetSpent
        startDate: $startDate
        endDate: $endDate
        clientName: $clientName
        location: $location
        contractType: $contractType
        currency: $currency
        budgetContingencyPct: $budgetContingencyPct
        qualityStandard: $qualityStandard
      }
    ) {
      success
      message
      project {
        id
        name
        description
        status
        budgetTotal
        budgetSpent
        progressPercent
        startDate
        endDate
        metadata {
          clientName
          location
        }
        milestones {
          id
          title
          dueDate
          status
        }
      }
    }
  }
`;

const GET_PROJECT_MANAGEMENT = gql`
  query GetProjectManagement($id: Int!) {
    project(id: $id) {
      id
      milestones {
        id
        title
        description
        phase
        dueDate
        completionDate
        status
        deliverables
      }
      team: teamMembers {
        id
        userId
        userLogin
        userEmail
        displayName
        role
        responsibility
      }
      documents {
        id
        documentType
        title
        fileUrl
        version
        status
        createdAt
      }
    }
  }
`;

const CREATE_MILESTONE = gql`
  mutation CreateMilestone(
    $projectId: Int!
    $title: String!
    $dueDate: String!
    $phase: String
    $description: String
    $deliverables: String
  ) {
    createMilestone(
      input: {
        projectId: $projectId
        title: $title
        dueDate: $dueDate
        phase: $phase
        description: $description
        deliverables: $deliverables
      }
    ) {
      success
      message
      milestone {
        id
        title
        dueDate
        status
        phase
      }
    }
  }
`;

const UPDATE_MILESTONE = gql`
  mutation UpdateMilestone(
    $id: Int!
    $title: String
    $description: String
    $phase: String
    $dueDate: String
    $completionDate: String
    $status: String
    $deliverables: String
  ) {
    updateMilestone(
      input: {
        id: $id
        title: $title
        description: $description
        phase: $phase
        dueDate: $dueDate
        completionDate: $completionDate
        status: $status
        deliverables: $deliverables
      }
    ) {
      success
      message
      milestone {
        id
        title
        dueDate
        completionDate
        status
        phase
      }
    }
  }
`;

const DELETE_MILESTONE = gql`
  mutation DeleteMilestone($id: Int!) {
    deleteMilestone(input: { id: $id }) {
      success
      deletedId
      message
    }
  }
`;

const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
      id
      userLogin
      userEmail
      displayName
    }
  }
`;

const ASSIGN_TEAM_MEMBER = gql`
  mutation AssignTeamMember(
    $projectId: Int!
    $userId: Int!
    $role: String
    $responsibility: String
  ) {
    assignTeamMember(
      input: {
        projectId: $projectId
        userId: $userId
        role: $role
        responsibility: $responsibility
      }
    ) {
      success
      message
      teamMember {
        id
        userId
        displayName
        userLogin
        userEmail
        role
        responsibility
      }
    }
  }
`;

const REMOVE_TEAM_MEMBER = gql`
  mutation RemoveTeamMember($projectId: Int!, $userId: Int!) {
    removeTeamMember(input: { projectId: $projectId, userId: $userId }) {
      success
      message
    }
  }
`;

const CREATE_PROJECT_DOCUMENT = gql`
  mutation CreateProjectDocument(
    $projectId: Int!
    $title: String!
    $documentType: String
    $fileUrl: String
    $version: String
    $status: String
  ) {
    createProjectDocument(
      input: {
        projectId: $projectId
        title: $title
        documentType: $documentType
        fileUrl: $fileUrl
        version: $version
        status: $status
      }
    ) {
      success
      message
      document {
        id
        title
        documentType
        fileUrl
        version
        status
      }
    }
  }
`;

const UPDATE_PROJECT_DOCUMENT = gql`
  mutation UpdateProjectDocument(
    $id: Int!
    $title: String
    $documentType: String
    $fileUrl: String
    $version: String
    $status: String
  ) {
    updateProjectDocument(
      input: {
        id: $id
        title: $title
        documentType: $documentType
        fileUrl: $fileUrl
        version: $version
        status: $status
      }
    ) {
      success
      message
      document {
        id
        title
        documentType
        fileUrl
        version
        status
      }
    }
  }
`;

const DELETE_PROJECT_DOCUMENT = gql`
  mutation DeleteProjectDocument($id: Int!) {
    deleteProjectDocument(input: { id: $id }) {
      success
      deletedId
      message
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $description: String
    $budgetTotal: Float
  ) {
    createProject(input: { name: $name, description: $description, budgetTotal: $budgetTotal }) {
      project {
        id
        name
        description
        status
        budgetTotal
        budgetSpent
        progressPercent
        startDate
        endDate
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

function getAuthLoginEndpoint() {
  if (typeof window !== "undefined" && window.jinsing?.siteUrl) {
    return `${window.jinsing.siteUrl}/wp-json/jinsing/v1/auth/login`;
  }

  if (GRAPHQL_ENDPOINT && GRAPHQL_ENDPOINT.endsWith("/graphql")) {
    return GRAPHQL_ENDPOINT.replace(/\/graphql$/, "/wp-json/jinsing/v1/auth/login");
  }

  return "/wp-json/jinsing/v1/auth/login";
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
    ui: {
      healthy: "Healthy",
      watch: "Watch",
      atRisk: "At Risk",
      loginRequiredTitle: "Login Required",
      loginRequiredBody: "This section is restricted. Please log in with your backend access key to continue.",
      loginNow: "Go to Login",
      selfRegistrationDisabled: "Self-registration is currently disabled.",
      loginWithCredentials: "Sign in",
      usernameLabel: "Username",
      passwordLabel: "Password",
      loginButton: "Sign In",
      loggingIn: "Signing in...",
      loginSuccess: "Login successful. Access is now unlocked.",
      loginFailed: "Login failed. Check your username and password.",
      accessKeyStored: "Access key stored",
      noAccessKey: "No access key",
      saveAccessKey: "Save Access Key",
      clearAccessKey: "Clear Access Key",
      clearDemoData: "Clear Demo Data",
      actionRequired: "\u26a0 Action Required",
      viewProject: "View Project",
      manageProject: "Manage Project",
      viewPublicPage: "View Public Page \u2197",
      close: "Close",
      budget: "Budget",
      spent: "Spent",
      progress: "Progress",
      milestones: "Milestones",
      start: "Start",
      end: "End",
      projectDocuments: "Project Documents",
      constructionPlatform: "Construction Platform",
      publicChip: "Public",
      deliveryChip: "Delivery",
      controlsChip: "Controls",
      overviewChip: "Overview",
      systemChip: "System",
      status: {
        active: "Active",
        on_hold: "On Hold",
        planning: "Planning",
        completed: "Completed",
        archived: "Archived",
        in_progress: "In Progress",
        not_started: "Not Started",
        blocked: "Blocked",
      },
      docNames: ["Project Report", "License Document", "Render Design"],
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
        { id: "suppliers", label: "供应商", icon: "suppliers" },
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
    ui: {
      healthy: "健康",
      watch: "关注",
      atRisk: "有风险",
      loginRequiredTitle: "需要登录",
      loginRequiredBody: "此版块受限。请使用后端访问密钥登录后继续。",
      loginNow: "前往登录",
      selfRegistrationDisabled: "当前暂不开放自行注册。",
      loginWithCredentials: "登录",
      usernameLabel: "用户名",
      passwordLabel: "密码",
      loginButton: "登录",
      loggingIn: "正在登录...",
      loginSuccess: "登录成功，访问已解锁。",
      loginFailed: "登录失败，请检查用户名和密码。",
      accessKeyStored: "访问密钥已保存",
      noAccessKey: "未设置访问密钥",
      saveAccessKey: "保存访问密钥",
      clearAccessKey: "清除访问密钥",
      clearDemoData: "清除演示数据",
      actionRequired: "\u26a0 需要处理",
      viewProject: "查看项目",
      manageProject: "管理项目",
      viewPublicPage: "查看公开页面 \u2197",
      close: "关闭",
      budget: "预算",
      spent: "已支出",
      progress: "进度",
      milestones: "里程碑",
      start: "开始",
      end: "结束",
      projectDocuments: "项目文件",
      constructionPlatform: "施工平台",
      publicChip: "公开",
      deliveryChip: "交付",
      controlsChip: "控制",
      overviewChip: "概览",
      systemChip: "系统",
      status: {
        active: "进行中",
        on_hold: "暂停",
        planning: "规划中",
        completed: "已完成",
        archived: "已归档",
        in_progress: "进行中",
        not_started: "未开始",
        blocked: "受阻",
      },
      docNames: ["项目报告", "许可证文件", "渲染设计"],
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

LANDING_CONTENT.zh = {
  topbar: {
    docs: "文档",
    login: "登录",
  },
  hero: {
    eyebrow: "Jinsing 施工平台",
    title: "面向 Jinsing 的项目管理",
    description: "追踪项目、成本、供应商和现场团队。登录即可访问您的工作台。",
    cta: "登录平台",
  },
  capabilities: [
    { code: "PRJ", title: "项目追踪", text: "一览里程碑、进度和预算。" },
    { code: "CST", title: "成本管理", text: "精准估算和透明支出追踪。" },
    { code: "SUP", title: "供应商", text: "供应商记录、联系方式和付款条款。" },
    { code: "FLD", title: "现场团队", text: "临时员工记录、技能和日薪。" },
  ],
  docsTitle: "文档",
  docs: [
    "API 参考 - GraphQL 架构、身份验证和速率限制",
    "移动应用指南 - 离线设置、收据扫描和每日日志",
    "集成教程 - M-Pesa、OCR 和天气数据流",
    "合规工作流 - NCA、KRA、审计追踪和导出",
    "数据库架构 - Jinsing 数据表与运营实体说明",
    "视频演练 - 入职培训和技术团队的简短导览",
  ],
  docsCta: "浏览文档",
  footerCta: "登录以访问所有平台功能。",
  footerLogin: "登录",
  signals: [
    { label: "访问模式", value: "Jinsing", note: "为 Jinsing 项目团队提供的账号" },
    { label: "API 接口", value: "GraphQL", note: "身份验证、架构模式和工作流示例" },
    { label: "演示项目", value: "在线", note: "预加载的示例数据用于功能演示" },
    { label: "反馈机制", value: "直接", note: "功能请求和错误报告直达产品团队" },
  ],
  metrics: [
    { label: "文档模块", value: "6", note: "API、移动端、合规、集成" },
    { label: "项目团队", value: "Jinsing", note: "施工、工程和项目管理人员" },
    { label: "演示项目", value: "3", note: "预加载场景以探索核心工作流" },
    { label: "响应时间", value: "24小时", note: "快速入职和反馈周期" },
  ],
  featuresTitle: "您的访问权限包括",
  features: [
    { code: "DOC", title: "完整文档", text: "API 指南、集成教程、工作流示例和实施说明。" },
    { code: "KEY", title: "登录凭证", text: "仪表盘和沙盒访问的引导式入职流程。" },
    { code: "DEM", title: "演示项目", text: "预加载的项目数据，让团队无需配置即可探索。" },
    { code: "COM", title: "团队协作", text: "Jinsing 项目成员共享一个工作台，用于更新和讨论。" },
    { code: "UPD", title: "更新通知", text: "第一时间了解集成、指南和工作流的最新动态。" },
    { code: "BUG", title: "错误报告", text: "在平台演进过程中，直接向开发团队报告产品问题。" },
  ],
  stepsTitle: "2 分钟快速开始",
  steps: [
    { step: "01", title: "申请访问", text: "提交您的姓名、邮箱和职位，请求将由平台团队审核并完成入职。" },
    { step: "02", title: "验证", text: "确认您的邮箱并收到文档和平台凭证的入职链接。" },
    { step: "03", title: "登录并探索", text: "打开仪表盘，浏览文档，并使用 Jinsing 演示项目数据进行测试。" },
  ],
  audiencesTitle: "Jinsing 角色",
  audiences: [
    { role: "现场经理", text: "使用本地优先的工作流追踪费用、文档和现场团队。" },
    { role: "系统团队", text: "通过文档化的 GraphQL 接口将 Jinsing 集成到现有系统。" },
    { role: "建筑师/工程师", text: "在 RFI、检查和技术提交上进行协作。" },
    { role: "项目经理", text: "在一处查看仪表盘、预测和合规快照。" },
  ],
  roadmapTitle: "平台路线图",
  roadmapCopy: "Jinsing 正处于积极开发中。来自 Jinsing 项目团队的反馈直接影响优先功能和集成方向。",
  roadmap: [
    { status: "已上线", title: "AI 收据扫描", detail: "Beta 工作流在演示环境中可用" },
    { status: "下一步", title: "M-Pesa 集成", detail: "当前路线图中的支付和对账流程" },
    { status: "下一步", title: "移动端离线表单", detail: "为低网络连接现场环境设计的数据采集" },
    { status: "未来", title: "NCA 直接申报", detail: "合规自动化计划在核心反馈轮次后推进" },
  ],
  feedbackCta: "申请功能",
  testimonialsTitle: "平台能力",
  testimonials: [
    { quote: "文档足够具体，集成团队可以在两天内完成方案规划。", author: "平台团队", role: "文档与 API 接口" },
    { quote: "演示环境预加载了真实的肯尼亚建筑项目数据，可供即时评估。", author: "平台团队", role: "演示环境" },
  ],
  faqTitle: "常见问题",
  faq: [
    { question: "谁可以申请访问？", answer: "访问权限为 Jinsing 项目人员提供。提交申请后，我们的团队将直接完成入职。" },
    { question: "注册后我能获得什么？", answer: "您将收到入职链接、文档访问权限、沙盒凭证以及预加载了 Jinsing 相关项目数据的演示环境。" },
    { question: "我可以将 Jinsing 用于实际项目吗？", answer: "文档、报告和工作流评估可以。全面推广取决于团队的运营准备评审。" },
    { question: "如何报告问题或申请功能？", answer: "使用功能申请链接或直接联系平台团队，以便我们对反馈进行分类处理。" },
  ],
  finalTitle: "申请平台访问",
  finalCopy: "提交申请，获取入职链接、文档访问权限和演示凭证。",
  finalPrimary: "申请访问",
  finalSecondary: "浏览文档",
  finalNote: "访问权限仅向授权的 Jinsing 项目人员提供。",
};

function getUserInitials(user) {
  const source =
    (user?.displayName && user.displayName.trim()) ||
    (user?.username && user.username.trim()) ||
    "";

  if (!source) {
    return "?";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatUserRole(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.length === 0) {
    return "";
  }

  return roles[0]
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function UserBadge({ user, lang, onLogout }) {
  const displayName =
    (user?.displayName && user.displayName.trim()) ||
    (user?.username && user.username.trim()) ||
    (lang === "en" ? "there" : "用户");
  const role = formatUserRole(user);
  const initials = getUserInitials(user);
  const welcomeLabel = lang === "en" ? "Welcome" : "欢迎";
  const logoutLabel = lang === "en" ? "Sign out" : "退出";

  return (
    <div
      className="user-badge"
      aria-label={`${welcomeLabel}, ${displayName}`}
    >
      <span className="user-badge-avatar" aria-hidden="true">{initials}</span>
      <span className="user-badge-meta">
        <span className="user-badge-welcome">
          <svg
            className="user-badge-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M18.5 2.5a2.12 2.12 0 0 1 3 3l-7.3 7.3-3.3.3.3-3.3 7.3-7.3zm-7.7 3.2-1.4 1.4-5 5a3 3 0 0 0 0 4.2l.6.6-2.1 2.1 1.4 1.4 2.1-2.1.6.6a3 3 0 0 0 4.2 0l5-5-1.4-1.4-5 5a1 1 0 0 1-1.4 0l-2.8-2.8a1 1 0 0 1 0-1.4l5-5z"
            />
          </svg>
          <span>
            {welcomeLabel},&nbsp;
            <strong className="user-badge-name">{displayName}</strong>
          </span>
        </span>
        {role && <span className="user-badge-role">{role}</span>}
      </span>
      <button
        type="button"
        className="user-badge-logout"
        onClick={onLogout}
        title={logoutLabel}
        aria-label={logoutLabel}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M10 17l1.4-1.4L8.8 13H20v-2H8.8l2.6-2.6L10 7l-5 5 5 5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5z"
          />
        </svg>
        <span className="user-badge-logout-text">{logoutLabel}</span>
      </button>
    </div>
  );
}

const PORTFOLIO_GRADIENTS = [
  "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #f59e0b 100%)",
  "linear-gradient(135deg, #052e2b 0%, #0f766e 55%, #fbbf24 100%)",
  "linear-gradient(135deg, #1a0b2e 0%, #6d28d9 55%, #f97316 100%)",
  "linear-gradient(135deg, #0b1e3a 0%, #1d4ed8 50%, #f59e0b 100%)",
  "linear-gradient(135deg, #1f1300 0%, #b45309 55%, #fde68a 100%)",
  "linear-gradient(135deg, #0a1f1c 0%, #047857 50%, #f59e0b 100%)",
];

function getPortfolioGradient(project) {
  const key = String(project?.id ?? project?.name ?? "0");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PORTFOLIO_GRADIENTS[hash % PORTFOLIO_GRADIENTS.length];
}

function getProjectInitials(name) {
  if (!name) return "JS";
  const parts = String(name).split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "JS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDateRange(start, end, lang) {
  const localeMap = { en: "en-US", zh: "zh-CN" };
  const locale = localeMap[lang] || "en-US";
  const fmt = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };
  const tbd = lang === "en" ? "TBD" : "待定";
  return { start: fmt(start) || tbd, end: fmt(end) || tbd };
}

function ProjectPortfolioCard({
  project,
  lang,
  canEdit,
  onOpen,
  onEdit,
  onQuickStatusChange,
  quickStatusBusy,
  t,
}) {
  const gradient = getPortfolioGradient(project);
  const initials = getProjectInitials(project?.name);
  const statusLabel =
    t.ui.status?.[project?.status] ??
    String(project?.status || "").replace(/_/g, " ");
  const progress = Number(project?.progressPercent ?? 0);
  const { start, end } = formatDateRange(project?.startDate, project?.endDate, lang);
  const clientName = project?.metadata?.clientName || "";
  const location = project?.metadata?.location || "";
  const description = project?.description || "";

  const labels = lang === "en"
    ? {
        client: "Client",
        location: "Location",
        start: "Start",
        completion: "Completion",
        progress: "Progress",
        view: "View details",
        edit: "Edit details",
        quickStatus: "Quick status",
      }
    : {
        client: "客户",
        location: "地点",
        start: "开始",
        completion: "完成",
        progress: "进度",
        view: "查看详情",
        edit: "编辑详情",
        quickStatus: "快速状态",
      };

  return (
    <article className="portfolio-card panel">
      <div
        className="portfolio-card-hero"
        style={{ backgroundImage: gradient }}
        aria-hidden="true"
      >
        <span className="portfolio-card-initials">{initials}</span>
        <span className={`portfolio-card-status portfolio-card-status--${project?.status}`}>
          {statusLabel}
        </span>
      </div>

      <div className="portfolio-card-body">
        <h3 className="portfolio-card-title">{project?.name}</h3>
        {description && (
          <p className="portfolio-card-desc">{description}</p>
        )}

        <dl className="portfolio-card-meta">
          {clientName && (
            <div>
              <dt>{labels.client}</dt>
              <dd>{clientName}</dd>
            </div>
          )}
          {location && (
            <div>
              <dt>{labels.location}</dt>
              <dd>{location}</dd>
            </div>
          )}
          <div>
            <dt>{labels.start}</dt>
            <dd>{start}</dd>
          </div>
          <div>
            <dt>{labels.completion}</dt>
            <dd>{end}</dd>
          </div>
        </dl>

        <div className="portfolio-card-progress">
          <div className="portfolio-card-progress-head">
            <span>{labels.progress}</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar" role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>

        <div className="portfolio-card-actions">
          <button
            type="button"
            className="pc-btn pc-btn--primary"
            onClick={() => onOpen?.(project)}
          >
            {labels.view}
          </button>
          {canEdit && (
            <button
              type="button"
              className="pc-btn pc-btn--secondary"
              onClick={() => onEdit?.(project)}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path fill="currentColor" d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.84 1.83 3.75 3.75 1.84-1.83z"/>
              </svg>
              {labels.edit}
            </button>
          )}
          {canEdit && (
            <label className="portfolio-quick-status">
              <span>{labels.quickStatus}</span>
              <select
                value={project?.status || "planning"}
                disabled={quickStatusBusy}
                onChange={(e) => onQuickStatusChange?.(project, e.target.value)}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t.ui.status?.[status] ?? status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </article>
  );
}

function LoggedInDashboard({
  user,
  lang,
  loading,
  error,
  projects,
  isDemoMode,
  canEditProjects,
  onOpenProject,
  onEditProject,
  onAddProject,
  onQuickStatusChange,
  quickStatusBusyId,
  t,
}) {
  const displayName =
    (user?.displayName && user.displayName.trim()) ||
    (user?.username && user.username.trim()) ||
    (lang === "en" ? "there" : "用户");

  const heading = lang === "en"
    ? `Welcome back, ${displayName}`
    : `欢迎回来，${displayName}`;
  const subhead = lang === "en"
    ? "Here is a portfolio snapshot of the projects you can access."
    : "以下是您可访问项目的组合概览。";
  const portfolioTitle = lang === "en" ? "Project Portfolio" : "项目组合";
  const emptyState = lang === "en"
    ? "No projects to display yet."
    : "暂无可显示的项目。";
  const demoNote = lang === "en"
    ? "Showing demo data. Live projects will appear here once available."
    : "显示演示数据。一旦有可用项目，将显示在此处。";
  const loadingText = lang === "en" ? "Loading projects…" : "加载项目中…";
  const errorText = lang === "en"
    ? "Unable to load live projects. Showing the latest snapshot instead."
    : "无法加载实时项目。改为显示最近的快照。";

  return (
    <section className="logged-in-dashboard">
      <header className="logged-in-header panel">
        <div>
          <p className="eyebrow">{lang === "en" ? "Dashboard" : "仪表盘"}</p>
          <h2 className="logged-in-title">{heading}</h2>
          <p className="logged-in-sub">{subhead}</p>
        </div>
        {canEditProjects && (
          <button type="button" className="btn-primary add-project-btn" onClick={onAddProject}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ marginRight: "6px" }}>
              <path fill="currentColor" d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/>
            </svg>
            {lang === "en" ? "New Project" : "新建项目"}
          </button>
        )}
      </header>

      <section className="portfolio-section panel">
        <div className="panel-head">
          <h3 className="lp-section-title">{portfolioTitle}</h3>
          {isDemoMode && (
            <span className="chip chip--warn" title={demoNote}>
              {lang === "en" ? "Demo data" : "演示数据"}
            </span>
          )}
        </div>

        {loading && <p className="panel-copy">{loadingText}</p>}
        {error && !loading && <p className="panel-copy">{errorText}</p>}

        {projects.length === 0 ? (
          <p className="panel-copy">{emptyState}</p>
        ) : (
          <div className="portfolio-grid">
            {projects.map((project) => (
              <ProjectPortfolioCard
                key={project.id}
                project={project}
                lang={lang}
                canEdit={canEditProjects}
                onOpen={onOpenProject}
                onEdit={onEditProject}
                onQuickStatusChange={onQuickStatusChange}
                quickStatusBusy={Number(quickStatusBusyId) === Number(project.id)}
                t={t}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

const PROJECT_STATUSES = ["planning", "active", "on_hold", "completed", "archived"];
const CONTRACT_TYPES = ["fixed_price", "time_materials", "design_build", "other"];

function ToastStack({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.kind || "info"}`}>
          <span className="toast-msg">{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

const MILESTONE_STATUSES = ["not_started", "in_progress", "on_hold", "completed", "at_risk"];

function getMilestoneLabels(lang) {
  return lang === "en"
    ? {
        not_started: "Not started",
        in_progress: "In progress",
        on_hold: "On hold",
        completed: "Completed",
        at_risk: "At risk",
      }
    : {
        not_started: "未开始",
        in_progress: "进行中",
        on_hold: "已暂停",
        completed: "已完成",
        at_risk: "存在风险",
      };
}

function EditProjectDrawer({ project, lang, onClose, onSaved, pushToast }) {
  const [tab, setTab] = useState("details");
  const [unsavedDetails, setUnsavedDetails] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    if (unsavedDetails) {
      const ok = window.confirm(
        lang === "en"
          ? "Discard unsaved changes?"
          : "放弃未保存的更改？"
      );
      if (!ok) return;
    }
    onClose?.();
  }

  const tabLabels = lang === "en"
    ? { details: "Details", milestones: "Milestones", team: "Team", documents: "Documents" }
    : { details: "详情", milestones: "里程碑", team: "团队", documents: "文档" };

  const headerTitle = lang === "en" ? "Manage Project" : "管理项目";
  const headerSub = lang === "en"
    ? "Edit project details, plan milestones, and manage the team."
    : "编辑项目详情、规划里程碑并管理团队。";

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <aside
        className="drawer-panel drawer-panel--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-project-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <p className="eyebrow">{lang === "en" ? "Admin" : "管理员"}</p>
            <h2 id="edit-project-title" className="drawer-title">
              {headerTitle}
            </h2>
            <p className="drawer-sub">
              {project?.name ? <strong>{project.name}</strong> : null}
              {project?.name ? " — " : ""}
              {headerSub}
            </p>
          </div>
          <button
            type="button"
            className="drawer-close"
            onClick={handleClose}
            aria-label={lang === "en" ? "Close" : "关闭"}
          >
            ×
          </button>
        </header>

        <nav className="drawer-tabs" role="tablist">
          {(["details", "milestones", "team", "documents"]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`drawer-tab ${tab === id ? "drawer-tab--active" : ""}`}
              onClick={() => setTab(id)}
            >
              {tabLabels[id]}
              {id === "details" && unsavedDetails && (
                <span className="drawer-tab-dot" aria-label="unsaved" />
              )}
            </button>
          ))}
        </nav>

        <div className="drawer-body">
          {tab === "details" && (
            <DetailsTab
              project={project}
              lang={lang}
              onSaved={onSaved}
              onClose={onClose}
              pushToast={pushToast}
              onDirtyChange={setUnsavedDetails}
            />
          )}
          {tab === "milestones" && (
            <MilestonesTab
              project={project}
              lang={lang}
              pushToast={pushToast}
            />
          )}
          {tab === "team" && (
            <TeamTab
              project={project}
              lang={lang}
              pushToast={pushToast}
            />
          )}
          {tab === "documents" && (
            <DocumentsTab
              project={project}
              lang={lang}
              pushToast={pushToast}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function BudgetBurnDownMini({ budgetTotal, budgetSpent, startDate, endDate, lang }) {
  const total = Math.max(0, Number(budgetTotal || 0));
  const spent = Math.max(0, Number(budgetSpent || 0));
  const spentRatio = total > 0 ? Math.min(1, spent / total) : 0;

  const elapsedRatio = (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
    return Math.min(1, Math.max(0, (now - start) / (end - start)));
  })();

  const labels = lang === "en"
    ? { title: "Budget burn-down", planned: "Planned burn", actual: "Actual spend" }
    : { title: "预算消耗", planned: "计划消耗", actual: "实际支出" };

  return (
    <section className="burn-card" aria-label={labels.title}>
      <div className="burn-head">
        <strong>{labels.title}</strong>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="burn-track">
        <span className="burn-marker burn-marker--planned" style={{ left: `${elapsedRatio * 100}%` }} />
        <span className="burn-marker burn-marker--actual" style={{ left: `${spentRatio * 100}%` }} />
      </div>
      <div className="burn-legend">
        <span><i className="dot dot--planned" />{labels.planned}</span>
        <span><i className="dot dot--actual" />{labels.actual}</span>
      </div>
    </section>
  );
}

function DetailsTab({ project, lang, onSaved, onClose, pushToast, onDirtyChange }) {
  const [updateProject, { loading: saving }] = useMutation(UPDATE_PROJECT);
  const [archiving, setArchiving] = useState(false);
  const [form, setForm] = useState(() => ({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "planning",
    budgetTotal: project?.budgetTotal ?? "",
    startDate: project?.startDate || "",
    endDate: project?.endDate || "",
    clientName: project?.metadata?.clientName || "",
    location: project?.metadata?.location || "",
    contractType: project?.metadata?.contractType || "fixed_price",
    currency: project?.metadata?.currency || "USD",
  }));
  const [errors, setErrors] = useState({});
  const [dirty, setDirtyState] = useState(false);

  const setDirty = (next) => {
    setDirtyState(next);
    onDirtyChange?.(next);
  };

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) {
      next.name = lang === "en" ? "Name is required" : "名称为必填项";
    }
    if (form.budgetTotal !== "" && Number.isNaN(Number(form.budgetTotal))) {
      next.budgetTotal = lang === "en" ? "Must be a number" : "必须为数字";
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = lang === "en" ? "End must be after start" : "结束必须在开始之后";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await updateProject({
        variables: {
          id: Number(project.id),
          name: form.name.trim(),
          description: form.description,
          status: form.status,
          budgetTotal: form.budgetTotal === "" ? null : Number(form.budgetTotal),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          clientName: form.clientName,
          location: form.location,
          contractType: form.contractType,
          currency: form.currency,
        },
        refetchQueries: [{ query: GET_PROJECTS }],
        awaitRefetchQueries: true,
      });
      const payload = result?.data?.updateProject;
      if (payload?.success) {
        pushToast?.({
          kind: "success",
          message:
            lang === "en"
              ? `Saved "${form.name.trim()}"`
              : `已保存"${form.name.trim()}"`,
        });
        setDirty(false);
        onSaved?.(payload.project);
        onClose?.();
      } else {
        pushToast?.({
          kind: "error",
          message: payload?.message || (lang === "en" ? "Save failed" : "保存失败"),
        });
      }
    } catch (err) {
      pushToast?.({
        kind: "error",
        message:
          err?.message || (lang === "en" ? "Network error" : "网络错误"),
      });
    }
  }

  const labels = lang === "en"
    ? {
        name: "Project name",
        description: "Description",
        status: "Status",
        budget: "Total budget",
        startDate: "Start date",
        endDate: "Completion date",
        client: "Client name",
        location: "Location",
        contract: "Contract type",
        currency: "Currency",
        cancel: "Cancel",
        archive: "Archive",
        archiving: "Archiving…",
        save: "Save changes",
        saving: "Saving…",
        sectionInfo: "Project information",
        sectionSchedule: "Schedule & budget",
        sectionMeta: "Client & contract",
      }
    : {
        name: "项目名称",
        description: "描述",
        status: "状态",
        budget: "总预算",
        startDate: "开始日期",
        endDate: "完成日期",
        client: "客户名称",
        location: "地点",
        contract: "合同类型",
        currency: "货币",
        cancel: "取消",
        archive: "归档",
        archiving: "归档中…",
        save: "保存更改",
        saving: "保存中…",
        sectionInfo: "项目信息",
        sectionSchedule: "进度与预算",
        sectionMeta: "客户与合同",
      };

  const statusLabel = (s) => {
    const map = lang === "en"
      ? { planning: "Planning", active: "Active", on_hold: "On hold", completed: "Completed", archived: "Archived" }
      : { planning: "规划中", active: "进行中", on_hold: "已暂停", completed: "已完成", archived: "已归档" };
    return map[s] || s;
  };
  const contractLabel = (c) => {
    const map = lang === "en"
      ? { fixed_price: "Fixed price", time_materials: "Time & materials", design_build: "Design–build", other: "Other" }
      : { fixed_price: "固定价格", time_materials: "工时与材料", design_build: "设计-建造", other: "其他" };
    return map[c] || c;
  };

  async function handleArchive() {
    const ok = window.confirm(
      lang === "en"
        ? "Archive this project? It will be hidden from active worklists."
        : "确认归档此项目？它将从活动列表中隐藏。"
    );
    if (!ok) return;

    setArchiving(true);
    try {
      const result = await updateProject({
        variables: { id: Number(project.id), status: "archived" },
        refetchQueries: [{ query: GET_PROJECTS }],
        awaitRefetchQueries: true,
      });
      const payload = result?.data?.updateProject;
      if (!payload?.success) {
        throw new Error(payload?.message || "Archive failed");
      }
      pushToast?.({
        kind: "success",
        message: lang === "en" ? "Project archived." : "项目已归档。",
      });
      onSaved?.(payload.project);
      onClose?.();
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    } finally {
      setArchiving(false);
    }
  }

  return (
    <form className="drawer-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="drawer-section">
        <legend>{labels.sectionInfo}</legend>

        <label className="field">
          <span className="field-label">{labels.name} *</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => validate()}
            required
            autoFocus
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>

        <label className="field">
          <span className="field-label">{labels.description}</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">{labels.status}</span>
          <select
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="drawer-section">
        <legend>{labels.sectionSchedule}</legend>

        <div className="field-grid">
          <label className="field">
            <span className="field-label">{labels.startDate}</span>
            <input
              type="date"
              value={form.startDate || ""}
              onChange={(e) => setField("startDate", e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">{labels.endDate}</span>
            <input
              type="date"
              value={form.endDate || ""}
              onChange={(e) => setField("endDate", e.target.value)}
              onBlur={() => validate()}
            />
            {errors.endDate && <span className="field-error">{errors.endDate}</span>}
          </label>
        </div>

        <div className="field-grid">
          <label className="field">
            <span className="field-label">{labels.budget}</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.budgetTotal ?? ""}
              onChange={(e) => setField("budgetTotal", e.target.value)}
              onBlur={() => validate()}
            />
            {errors.budgetTotal && (
              <span className="field-error">{errors.budgetTotal}</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">{labels.currency}</span>
            <input
              type="text"
              maxLength={3}
              value={form.currency || ""}
              onChange={(e) => setField("currency", e.target.value.toUpperCase())}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="drawer-section">
        <legend>{labels.sectionMeta}</legend>

        <label className="field">
          <span className="field-label">{labels.client}</span>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => setField("clientName", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">{labels.location}</span>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">{labels.contract}</span>
          <select
            value={form.contractType}
            onChange={(e) => setField("contractType", e.target.value)}
          >
            {CONTRACT_TYPES.map((c) => (
              <option key={c} value={c}>{contractLabel(c)}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <BudgetBurnDownMini
        budgetTotal={form.budgetTotal}
        budgetSpent={project?.budgetSpent}
        startDate={form.startDate}
        endDate={form.endDate}
        lang={lang}
      />

      <footer className="drawer-footer">
        {form.status !== "archived" && (
          <button
            type="button"
            className="pc-btn pc-btn--danger"
            onClick={handleArchive}
            disabled={saving || archiving}
          >
            {archiving ? labels.archiving : labels.archive}
          </button>
        )}
        <button
          type="button"
          className="pc-btn pc-btn--secondary"
          onClick={onClose}
          disabled={saving || archiving}
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          className="pc-btn pc-btn--primary"
          disabled={saving || archiving || !dirty}
        >
          {saving ? labels.saving : labels.save}
        </button>
      </footer>

    </form>
  );
}

function MilestonesTab({ project, lang, pushToast }) {
  const { data, loading, error, refetch } = useQuery(GET_PROJECT_MANAGEMENT, {
    variables: { id: Number(project.id) },
    fetchPolicy: "cache-and-network",
  });
  const [createMilestone, { loading: creating }] = useMutation(CREATE_MILESTONE);
  const [updateMilestone] = useMutation(UPDATE_MILESTONE);
  const [deleteMilestone] = useMutation(DELETE_MILESTONE);

  const [form, setForm] = useState({ title: "", dueDate: "", phase: "" });
  const [busyId, setBusyId] = useState(null);
  const [manualOrder, setManualOrder] = useState([]);

  const labels = lang === "en"
    ? {
        title: "Milestones",
        sub: "Plan and track key project milestones.",
        addHead: "Add milestone",
        nameField: "Title",
        dueField: "Due date",
        phaseField: "Phase",
        add: "Add",
        adding: "Adding…",
        empty: "No milestones yet. Add the first one above.",
        loading: "Loading milestones…",
        error: "Unable to load milestones.",
        delete: "Delete",
        confirmDelete: "Delete this milestone?",
        overdue: "Overdue",
        complete: "Mark complete",
        up: "Move up",
        down: "Move down",
      }
    : {
        title: "里程碑",
        sub: "规划并跟踪关键项目里程碑。",
        addHead: "添加里程碑",
        nameField: "标题",
        dueField: "截止日期",
        phaseField: "阶段",
        add: "添加",
        adding: "添加中…",
        empty: "暂无里程碑。在上方添加第一个。",
        loading: "加载中…",
        error: "无法加载里程碑。",
        delete: "删除",
        confirmDelete: "删除此里程碑？",
        overdue: "已逾期",
        complete: "标记完成",
        up: "上移",
        down: "下移",
      };

  const statusMap = getMilestoneLabels(lang);
  const milestones = data?.project?.milestones || [];
  const milestoneKey = `milestone-order-${project?.id}`;

  useEffect(() => {
    const ids = milestones.map((m) => Number(m.id));
    if (ids.length === 0) {
      setManualOrder([]);
      return;
    }

    let nextOrder = ids;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(milestoneKey);
        const saved = raw ? JSON.parse(raw) : [];
        if (Array.isArray(saved) && saved.length > 0) {
          const validSaved = saved.filter((id) => ids.includes(Number(id))).map((id) => Number(id));
          const missing = ids.filter((id) => !validSaved.includes(id));
          nextOrder = [...validSaved, ...missing];
        }
      } catch {
        nextOrder = ids;
      }
    }
    setManualOrder(nextOrder);
  }, [milestones, milestoneKey]);

  const orderedMilestones = useMemo(() => {
    if (!manualOrder.length) return milestones;
    const byId = new Map(milestones.map((m) => [Number(m.id), m]));
    const sorted = manualOrder.map((id) => byId.get(Number(id))).filter(Boolean);
    const leftovers = milestones.filter((m) => !manualOrder.includes(Number(m.id)));
    return [...sorted, ...leftovers];
  }, [milestones, manualOrder]);

  const today = new Date().toISOString().slice(0, 10);

  function moveMilestone(id, direction) {
    setManualOrder((prev) => {
      const copy = prev.length ? [...prev] : milestones.map((m) => Number(m.id));
      const index = copy.indexOf(Number(id));
      if (index < 0) return copy;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return copy;
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(milestoneKey, JSON.stringify(copy));
      }
      return copy;
    });
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) {
      pushToast?.({
        kind: "error",
        message: lang === "en" ? "Title and due date are required." : "标题和截止日期为必填项。",
      });
      return;
    }
    try {
      const r = await createMilestone({
        variables: {
          projectId: Number(project.id),
          title: form.title.trim(),
          dueDate: form.dueDate,
          phase: form.phase || null,
        },
      });
      if (r?.data?.createMilestone?.success) {
        pushToast?.({
          kind: "success",
          message: lang === "en" ? "Milestone added." : "里程碑已添加。",
        });
        setForm({ title: "", dueDate: "", phase: "" });
        await refetch();
      } else {
        throw new Error(r?.data?.createMilestone?.message || "Failed");
      }
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    }
  }

  async function handleStatusChange(milestone, status) {
    setBusyId(milestone.id);
    try {
      const r = await updateMilestone({
        variables: { id: Number(milestone.id), status },
      });
      if (r?.data?.updateMilestone?.success) {
        pushToast?.({
          kind: "success",
          message: lang === "en" ? "Milestone updated." : "里程碑已更新。",
        });
        await refetch();
      } else {
        throw new Error(r?.data?.updateMilestone?.message || "Failed");
      }
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(milestone) {
    if (!window.confirm(labels.confirmDelete)) return;
    setBusyId(milestone.id);
    try {
      const r = await deleteMilestone({ variables: { id: Number(milestone.id) } });
      if (r?.data?.deleteMilestone?.success) {
        pushToast?.({
          kind: "success",
          message: lang === "en" ? "Milestone deleted." : "里程碑已删除。",
        });
        await refetch();
      } else {
        throw new Error(r?.data?.deleteMilestone?.message || "Failed");
      }
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="drawer-tabpanel">
      <div className="drawer-tabpanel-head">
        <h3>{labels.title}</h3>
        <p>{labels.sub}</p>
      </div>

      <form className="manage-add-row" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder={labels.nameField}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder={labels.phaseField}
          value={form.phase}
          onChange={(e) => setForm({ ...form, phase: e.target.value })}
        />
        <button
          type="submit"
          className="pc-btn pc-btn--primary"
          disabled={creating}
        >
          {creating ? labels.adding : labels.add}
        </button>
      </form>

      {loading && milestones.length === 0 && (
        <p className="panel-copy">{labels.loading}</p>
      )}
      {error && <p className="panel-copy field-error">{labels.error}</p>}
      {!loading && milestones.length === 0 && (
        <p className="panel-copy">{labels.empty}</p>
      )}

      <ul className="manage-list">
        {orderedMilestones.map((m, index) => {
          const overdue = m.dueDate && m.dueDate < today && m.status !== "completed";
          const busy = busyId === m.id;
          return (
            <li key={m.id} className={`manage-item ${overdue ? "manage-item--risk" : ""}`}>
              <div className="manage-item-main">
                <div className="manage-item-title">{m.title}</div>
                <div className="manage-item-meta">
                  <span>{m.dueDate}</span>
                  {m.phase && <span>· {m.phase}</span>}
                  {overdue && (
                    <span className="chip chip--warn">{labels.overdue}</span>
                  )}
                </div>
              </div>
              <div className="manage-item-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => moveMilestone(m.id, "up")}
                  disabled={busy || index === 0}
                  title={labels.up}
                  aria-label={labels.up}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => moveMilestone(m.id, "down")}
                  disabled={busy || index === orderedMilestones.length - 1}
                  title={labels.down}
                  aria-label={labels.down}
                >
                  ↓
                </button>
                <select
                  value={m.status}
                  onChange={(e) => handleStatusChange(m, e.target.value)}
                  disabled={busy}
                  className={`status-select status-select--${m.status}`}
                  aria-label={lang === "en" ? "Status" : "状态"}
                >
                  {MILESTONE_STATUSES.map((s) => (
                    <option key={s} value={s}>{statusMap[s]}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleDelete(m)}
                  disabled={busy}
                  title={labels.delete}
                  aria-label={labels.delete}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm-2 6h10l-1 11a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 9z"/>
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TeamTab({ project, lang, pushToast }) {
  const { data, loading, error, refetch } = useQuery(GET_PROJECT_MANAGEMENT, {
    variables: { id: Number(project.id) },
    fetchPolicy: "cache-and-network",
  });
  const [searchUsers, { data: searchData, loading: searching }] = useLazyQuery(SEARCH_USERS, {
    fetchPolicy: "no-cache",
  });
  const [assignMember, { loading: assigning }] = useMutation(ASSIGN_TEAM_MEMBER);
  const [removeMember] = useMutation(REMOVE_TEAM_MEMBER);

  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null);
  const [role, setRole] = useState("");
  const [responsibility, setResponsibility] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Debounced search.
  useEffect(() => {
    if (picked) return;
    if (query.trim().length < 2) return;
    const h = setTimeout(() => {
      searchUsers({ variables: { query: query.trim(), limit: 8 } });
    }, 250);
    return () => clearTimeout(h);
  }, [query, picked, searchUsers]);

  const labels = lang === "en"
    ? {
        title: "Team",
        sub: "Assign members and define their roles on this project.",
        searchPlaceholder: "Search users by name, login, or email…",
        roleField: "Role (e.g. Project Manager)",
        respField: "Responsibility (optional)",
        addBtn: "Assign",
        adding: "Assigning…",
        empty: "No team members yet. Search above to assign someone.",
        loading: "Loading team…",
        error: "Unable to load team.",
        remove: "Remove",
        confirmRemove: "Remove this team member?",
        searching: "Searching…",
        noResults: "No users found.",
        clear: "Clear",
      }
    : {
        title: "团队",
        sub: "为此项目分配成员并定义其角色。",
        searchPlaceholder: "按姓名、用户名或邮箱搜索…",
        roleField: "角色（如项目经理）",
        respField: "职责（可选）",
        addBtn: "分配",
        adding: "分配中…",
        empty: "暂无团队成员。在上方搜索以分配某人。",
        loading: "加载中…",
        error: "无法加载团队。",
        remove: "移除",
        confirmRemove: "移除此团队成员？",
        searching: "搜索中…",
        noResults: "未找到用户。",
        clear: "清除",
      };

  const team = data?.project?.team || [];
  const results = searchData?.searchUsers || [];

  async function handleAssign(e) {
    e.preventDefault();
    if (!picked) {
      pushToast?.({
        kind: "error",
        message: lang === "en" ? "Please select a user first." : "请先选择用户。",
      });
      return;
    }
    try {
      const r = await assignMember({
        variables: {
          projectId: Number(project.id),
          userId: Number(picked.id),
          role: role.trim() || null,
          responsibility: responsibility.trim() || null,
        },
      });
      if (r?.data?.assignTeamMember?.success) {
        pushToast?.({
          kind: "success",
          message: lang === "en"
            ? `Assigned ${picked.displayName || picked.userLogin}`
            : `已分配 ${picked.displayName || picked.userLogin}`,
        });
        setPicked(null);
        setQuery("");
        setRole("");
        setResponsibility("");
        await refetch();
      } else {
        throw new Error(r?.data?.assignTeamMember?.message || "Failed");
      }
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    }
  }

  async function handleRemove(member) {
    if (!window.confirm(labels.confirmRemove)) return;
    setBusyId(member.userId);
    try {
      const r = await removeMember({
        variables: { projectId: Number(project.id), userId: Number(member.userId) },
      });
      if (r?.data?.removeTeamMember?.success) {
        pushToast?.({
          kind: "success",
          message: lang === "en" ? "Member removed." : "成员已移除。",
        });
        await refetch();
      } else {
        throw new Error(r?.data?.removeTeamMember?.message || "Failed");
      }
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    } finally {
      setBusyId(null);
    }
  }

  function getInitials(name) {
    const safe = (name || "?").trim();
    return safe.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";
  }

  return (
    <div className="drawer-tabpanel">
      <div className="drawer-tabpanel-head">
        <h3>{labels.title}</h3>
        <p>{labels.sub}</p>
      </div>

      <form className="manage-team-form" onSubmit={handleAssign}>
        {picked ? (
          <div className="picked-user">
            <span className="picked-user-avatar">{getInitials(picked.displayName)}</span>
            <div>
              <strong>{picked.displayName || picked.userLogin}</strong>
              <div className="picked-user-sub">{picked.userEmail}</div>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setPicked(null)}
              aria-label={labels.clear}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="user-search">
            <input
              type="search"
              placeholder={labels.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query.trim().length >= 2 && (
              <div className="user-search-results">
                {searching && (
                  <div className="user-search-empty">{labels.searching}</div>
                )}
                {!searching && results.length === 0 && (
                  <div className="user-search-empty">{labels.noResults}</div>
                )}
                {results.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    className="user-search-item"
                    onClick={() => setPicked(u)}
                  >
                    <span className="picked-user-avatar">
                      {getInitials(u.displayName)}
                    </span>
                    <span>
                      <strong>{u.displayName || u.userLogin}</strong>
                      <small>{u.userEmail}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="field-grid">
          <input
            type="text"
            placeholder={labels.roleField}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <input
            type="text"
            placeholder={labels.respField}
            value={responsibility}
            onChange={(e) => setResponsibility(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="pc-btn pc-btn--primary"
          disabled={assigning || !picked}
        >
          {assigning ? labels.adding : labels.addBtn}
        </button>
      </form>

      {loading && team.length === 0 && (
        <p className="panel-copy">{labels.loading}</p>
      )}
      {error && <p className="panel-copy field-error">{labels.error}</p>}
      {!loading && team.length === 0 && (
        <p className="panel-copy">{labels.empty}</p>
      )}

      <ul className="manage-list">
        {team.map((m) => {
          const busy = busyId === m.userId;
          return (
            <li key={m.id} className="manage-item">
              <span className="picked-user-avatar">
                {getInitials(m.displayName || m.userLogin)}
              </span>
              <div className="manage-item-main">
                <div className="manage-item-title">
                  {m.displayName || m.userLogin}
                </div>
                <div className="manage-item-meta">
                  {m.role && <span>{m.role}</span>}
                  {m.responsibility && <span>· {m.responsibility}</span>}
                  {!m.role && !m.responsibility && (
                    <span className="text-muted">{m.userEmail}</span>
                  )}
                </div>
              </div>
              <div className="manage-item-actions">
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleRemove(m)}
                  disabled={busy}
                  title={labels.remove}
                  aria-label={labels.remove}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm-2 6h10l-1 11a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 9z"/>
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DocumentsTab({ project, lang, pushToast }) {
  const { data, loading, error, refetch } = useQuery(GET_PROJECT_MANAGEMENT, {
    variables: { id: Number(project.id) },
    fetchPolicy: "cache-and-network",
  });
  const [createDocument, { loading: creating }] = useMutation(CREATE_PROJECT_DOCUMENT);
  const [updateDocument] = useMutation(UPDATE_PROJECT_DOCUMENT);
  const [deleteDocument] = useMutation(DELETE_PROJECT_DOCUMENT);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    fileUrl: "",
    documentType: "other",
    version: "1.0",
  });

  const labels = lang === "en"
    ? {
        title: "Documents",
        sub: "Track project documents, links, and approval status.",
        add: "Add document",
        adding: "Adding…",
        nameField: "Title",
        urlField: "URL",
        typeField: "Type",
        versionField: "Version",
        empty: "No documents yet.",
        loading: "Loading documents…",
        error: "Unable to load documents.",
        remove: "Delete",
        open: "Open",
        confirmDelete: "Delete this document?",
      }
    : {
        title: "文档",
        sub: "跟踪项目文档、链接与审批状态。",
        add: "添加文档",
        adding: "添加中…",
        nameField: "标题",
        urlField: "链接",
        typeField: "类型",
        versionField: "版本",
        empty: "暂无文档。",
        loading: "加载文档中…",
        error: "无法加载文档。",
        remove: "删除",
        open: "打开",
        confirmDelete: "删除此文档？",
      };

  const statusLabels = lang === "en"
    ? { draft: "Draft", approved: "Approved", archived: "Archived" }
    : { draft: "草稿", approved: "已批准", archived: "已归档" };

  const documents = data?.project?.documents || [];

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      pushToast?.({
        kind: "error",
        message: lang === "en" ? "Document title is required." : "文档标题为必填项。",
      });
      return;
    }
    try {
      const result = await createDocument({
        variables: {
          projectId: Number(project.id),
          title: form.title.trim(),
          fileUrl: form.fileUrl.trim() || null,
          documentType: form.documentType,
          version: form.version.trim() || "1.0",
          status: "draft",
        },
      });
      if (!result?.data?.createProjectDocument?.success) {
        throw new Error(result?.data?.createProjectDocument?.message || "Failed");
      }
      pushToast?.({
        kind: "success",
        message: lang === "en" ? "Document created." : "文档已创建。",
      });
      setForm({ title: "", fileUrl: "", documentType: "other", version: "1.0" });
      await refetch();
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    }
  }

  async function handleStatus(doc, status) {
    setBusyId(doc.id);
    try {
      const result = await updateDocument({
        variables: { id: Number(doc.id), status },
      });
      if (!result?.data?.updateProjectDocument?.success) {
        throw new Error(result?.data?.updateProjectDocument?.message || "Failed");
      }
      await refetch();
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(doc) {
    if (!window.confirm(labels.confirmDelete)) return;
    setBusyId(doc.id);
    try {
      const result = await deleteDocument({ variables: { id: Number(doc.id) } });
      if (!result?.data?.deleteProjectDocument?.success) {
        throw new Error(result?.data?.deleteProjectDocument?.message || "Failed");
      }
      pushToast?.({ kind: "success", message: lang === "en" ? "Document deleted." : "文档已删除。" });
      await refetch();
    } catch (err) {
      pushToast?.({ kind: "error", message: err?.message || "Network error" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="drawer-tabpanel">
      <div className="drawer-tabpanel-head">
        <h3>{labels.title}</h3>
        <p>{labels.sub}</p>
      </div>

      <form className="manage-add-row manage-add-row--docs" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder={labels.nameField}
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
        <input
          type="url"
          placeholder={labels.urlField}
          value={form.fileUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
        />
        <input
          type="text"
          placeholder={labels.typeField}
          value={form.documentType}
          onChange={(e) => setForm((prev) => ({ ...prev, documentType: e.target.value }))}
        />
        <input
          type="text"
          placeholder={labels.versionField}
          value={form.version}
          onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
        />
        <button type="submit" className="pc-btn pc-btn--primary" disabled={creating}>
          {creating ? labels.adding : labels.add}
        </button>
      </form>

      {loading && documents.length === 0 && <p className="panel-copy">{labels.loading}</p>}
      {error && <p className="panel-copy field-error">{labels.error}</p>}
      {!loading && documents.length === 0 && <p className="panel-copy">{labels.empty}</p>}

      <ul className="manage-list">
        {documents.map((doc) => {
          const busy = busyId === doc.id;
          return (
            <li key={doc.id} className="manage-item">
              <div className="manage-item-main">
                <div className="manage-item-title">{doc.title}</div>
                <div className="manage-item-meta">
                  <span>{doc.documentType || "other"}</span>
                  <span>· v{doc.version || "1.0"}</span>
                  {doc.fileUrl && <span className="text-muted">· {doc.fileUrl}</span>}
                </div>
              </div>
              <div className="manage-item-actions">
                <select
                  value={doc.status || "draft"}
                  onChange={(e) => handleStatus(doc, e.target.value)}
                  disabled={busy}
                  className={`status-select status-select--${doc.status || "draft"}`}
                >
                  {Object.keys(statusLabels).map((status) => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-btn"
                    aria-label={labels.open}
                    title={labels.open}
                  >
                    ↗
                  </a>
                )}
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleDelete(doc)}
                  disabled={busy}
                  aria-label={labels.remove}
                  title={labels.remove}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm-2 6h10l-1 11a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 9z"/>
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [apiToken, setApiToken] = useState("");
  const [tokenState, setTokenState] = useState("idle");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [quickStatusBusyId, setQuickStatusBusyId] = useState(null);
  const [quickUpdateProject] = useMutation(UPDATE_PROJECT);
  const [createProjectMutation] = useMutation(CREATE_PROJECT);

  const pushToast = (toast) => {
    const id = Math.random().toString(36).slice(2);
    const next = { id, kind: "info", ...toast };
    setToasts((prev) => [...prev, next]);
    const ttl = next.kind === "error" ? 6000 : 3500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ttl);
  };
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  async function handleQuickStatusChange(project, nextStatus) {
    if (!project?.id || !nextStatus || nextStatus === project.status) return;
    setQuickStatusBusyId(project.id);
    try {
      const result = await quickUpdateProject({
        variables: { id: Number(project.id), status: nextStatus },
        refetchQueries: [{ query: GET_PROJECTS }],
        awaitRefetchQueries: true,
      });
      const payload = result?.data?.updateProject;
      if (!payload?.success) {
        throw new Error(payload?.message || "Status update failed");
      }
      if (selectedProject && Number(selectedProject.id) === Number(project.id)) {
        setSelectedProject(payload.project);
      }
      if (editingProject && Number(editingProject.id) === Number(project.id)) {
        setEditingProject(payload.project);
      }
      pushToast({
        kind: "success",
        message: lang === "en" ? "Status updated." : "状态已更新。",
      });
    } catch (err) {
      pushToast({ kind: "error", message: err?.message || "Network error" });
    } finally {
      setQuickStatusBusyId(null);
    }
  }

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
  const isLoggedIn = Boolean(apiToken.trim());
  const canEditProjects = Boolean(
    capabilities?.admin ||
    capabilities?.manageProjects ||
    capabilities?.createProjects ||
    currentUser?.roles?.includes('administrator') ||
    currentUser?.roles?.includes('construction_director') ||
    currentUser?.roles?.includes('construction_project_manager')
  );
  const protectedNavIds = ["dashboard", "projects", "suppliers", "employees", "finance", "reports", "docs", "entries"];
  const requiresLogin = protectedNavIds.includes(activeNav);
  const isDemoMode = !loading && !hasLiveProjects;
  const portfolioSummary = getPortfolioSummary(displayProjects);
  const milestoneAlerts = getMilestoneAlerts(displayProjects);
  const featuredProjects = displayProjects.slice(0, 3);
  const demoProject = featuredProjects[0] || DEMO_PROJECTS[0];

  useEffect(() => {
    const existingToken = getStoredAuthToken();
    setApiToken(existingToken);
    if (existingToken) {
      const storedUser = getStoredUser();
      setCurrentUser(storedUser);
      if (storedUser && storedUser.__capabilities) {
        setCapabilities(storedUser.__capabilities);
      }
    }
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
    clearStoredUser();
    setApiToken("");
    setCurrentUser(null);
    setCapabilities(null);
    setTokenState("cleared");
    apolloClient.resetStore().catch(() => {});
  }

  async function handleFrontendLogin() {
    const username = loginUsername.trim();
    const password = loginPassword;

    if (!username || !password) {
      setLoginError(t.ui.loginFailed);
      return;
    }

    setLoginBusy(true);
    setLoginError("");

    try {
      const response = await fetch(getAuthLoginEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.token) {
        const message = payload?.message || payload?.error || t.ui.loginFailed;
        setLoginError(message);
        return;
      }

      setStoredAuthToken(payload.token);
      setApiToken(payload.token);
      setTokenState("saved");
      if (payload.user && typeof payload.user === "object") {
        const enrichedUser = {
          ...payload.user,
          __capabilities: payload.capabilities || null,
        };
        setStoredUser(enrichedUser);
        setCurrentUser(enrichedUser);
        setCapabilities(payload.capabilities || null);
      }
      setLoginPassword("");
      setActiveNav("dashboard");
      apolloClient.resetStore().catch(() => {});
    } catch (_error) {
      setLoginError(t.ui.loginFailed);
    } finally {
      setLoginBusy(false);
    }
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
        <h3>{t.ui.projectDocuments}</h3>
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

  // Derive public view URL for a project (CPT post)
  function getViewUrl(project) {
    if (project?.publicUrl) return project.publicUrl;
    if (typeof window !== "undefined" && window.jinsing?.siteUrl) {
      return `${window.jinsing.siteUrl}/projects/`;
    }
    return null;
  }

  function getManageUrl(projectId) {
    const base =
      typeof window !== "undefined" && window.jinsing?.adminUrl
        ? window.jinsing.adminUrl
        : "/wp-admin/";
    return `${base}admin.php?page=construction-mgmt-project-management&id=${projectId}`;
  }

  function openManageProject(project, options = {}) {
    if (!project?.id) return;
    if (options.closeDetail) {
      setSelectedProject(null);
    }
    setEditingProject(project);

    if (typeof window === "undefined") return;

    window.setTimeout(() => {
      const drawerOpen = Boolean(document.querySelector(".drawer-overlay"));
      if (drawerOpen) return;

      const manageUrl = getManageUrl(project.id);
      window.open(manageUrl, "_blank", "noopener,noreferrer");
      pushToast({
        kind: "info",
        message:
          lang === "en"
            ? "Opened classic admin manager as fallback."
            : "已回退到经典后台管理页面。",
      });
    }, 350);
  }

  async function handleCreateProject(fields) {
    try {
      const result = await createProjectMutation({
        variables: {
          name: fields.name.trim(),
          description: fields.description?.trim() || "",
          budgetTotal: fields.budgetTotal ? parseFloat(fields.budgetTotal) : 0,
        },
        refetchQueries: [{ query: GET_PROJECTS }],
        awaitRefetchQueries: true,
      });
      const newProject = result?.data?.createProject?.project;
      setShowNewProject(false);
      pushToast({
        kind: "success",
        message: lang === "en" ? `Project "${fields.name}" created.` : `项目"${fields.name}"已创建。`,
      });
      if (newProject) {
        openManageProject(newProject);
      }
    } catch (err) {
      pushToast({
        kind: "error",
        message: lang === "en"
          ? `Failed to create project: ${err.message}`
          : `创建项目失败：${err.message}`,
      });
    }
  }

  function NewProjectModal({ onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [budgetTotal, setBudgetTotal] = useState("");
    const [busy, setBusy] = useState(false);
    const isEn = lang === "en";

    const labels = isEn
      ? {
          title: "New Project",
          nameLbl: "Project Name",
          namePh: "Enter project name",
          descLbl: "Description",
          descPh: "Brief project description (optional)",
          budgetLbl: "Budget (USD)",
          budgetPh: "0",
          cancel: "Cancel",
          create: "Create Project",
          creating: "Creating…",
          required: "Project name is required.",
        }
      : {
          title: "新建项目",
          nameLbl: "项目名称",
          namePh: "输入项目名称",
          descLbl: "描述",
          descPh: "简短描述（可选）",
          budgetLbl: "预算（美元）",
          budgetPh: "0",
          cancel: "取消",
          create: "创建项目",
          creating: "创建中…",
          required: "项目名称必填。",
        };

    async function handleSubmit(e) {
      e.preventDefault();
      if (!name.trim()) return;
      setBusy(true);
      try {
        await onSubmit({ name, description, budgetTotal });
      } finally {
        setBusy(false);
      }
    }

    return (
      <div
        className="drawer-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="new-project-modal panel">
          <div className="drawer-header">
            <h2 className="drawer-title">{labels.title}</h2>
            <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <form className="new-project-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="form-label" htmlFor="np-name">{labels.nameLbl} <span aria-hidden="true">*</span></label>
              <input
                id="np-name"
                type="text"
                className="form-input"
                placeholder={labels.namePh}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                autoComplete="off"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="np-desc">{labels.descLbl}</label>
              <textarea
                id="np-desc"
                className="form-input"
                placeholder={labels.descPh}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="np-budget">{labels.budgetLbl}</label>
              <input
                id="np-budget"
                type="number"
                className="form-input"
                placeholder={labels.budgetPh}
                min="0"
                step="1000"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
              />
            </div>
            <p className="new-project-hint">
              {isEn
                ? "Additional fields (dates, client, location) can be filled in after creation."
                : "其他字段（日期、客户、地点）可在创建后填写。"}
            </p>
            <div className="drawer-footer">
              <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>{labels.cancel}</button>
              <button type="submit" className="btn-primary" disabled={busy || !name.trim()}>
                {busy ? labels.creating : labels.create}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function ProjectCard({ project, onDetail, onManage, canManage }) {
    const health = getProjectHealth(project);
    const healthLabel = { risk: t.ui.atRisk, watch: t.ui.watch, healthy: t.ui.healthy }[health.tone] ?? health.label;
    const actionRequired = project.milestones.some(
      (ms) => ms.status !== "completed" && new Date(ms.dueDate) < new Date()
    );
    const statusLabel = t.ui.status[project.status] ?? project.status.replace(/_/g, " ");

    return (
      <div className="project-card">
        <div className="project-card-header">
          <h3 className="project-card-name">{project.name}</h3>
          <span className={`project-health ${health.tone}`}>{healthLabel}</span>
        </div>

        <p className="project-status">
          <span className={`proj-status-pill proj-status-pill--${project.status}`}>
            {statusLabel}
          </span>
        </p>

        <div className="proj-progress-row">
          <div className="progress-bar" role="progressbar"
            aria-valuenow={project.progressPercent}
            aria-valuemin={0} aria-valuemax={100}
            aria-label={`${project.progressPercent.toFixed(1)}%`}>
            <div className="progress-bar-fill" style={{ width: `${project.progressPercent}%` }} />
          </div>
          <span className="proj-pct">{formatPercent(project.progressPercent)}</span>
        </div>

        {actionRequired && (
          <p className="action-required">{t.ui.actionRequired}</p>
        )}

        <div className="project-card-actions">
          <button
            type="button"
            className="pc-btn pc-btn--primary"
            onClick={() => onDetail(project)}
          >
            {t.ui.viewProject}
          </button>
          {canManage && (
            <button
              type="button"
              className="pc-btn pc-btn--secondary"
              onClick={() => onManage?.(project)}
            >
              {t.ui.manageProject}
            </button>
          )}
        </div>
      </div>
    );
  }

  function ProjectDetailPanel({ project, onClose, onManage, canManage }) {
    if (!project) return null;
    const health = getProjectHealth(project);
    const healthLabel = { risk: t.ui.atRisk, watch: t.ui.watch, healthy: t.ui.healthy }[health.tone] ?? health.label;
    const viewUrl = getViewUrl(project);
    const msTotal = project.milestones.length;
    const msDone  = project.milestones.filter((m) => m.status === "completed").length;
    const statusLabel = t.ui.status[project.status] ?? project.status.replace(/_/g, " ");
    const statusIcon = { completed: "\u2713", in_progress: "\u25ce", not_started: "\u25cb", blocked: "\u2715" };

    return (
      <div className="pd-overlay" role="dialog" aria-modal="true"
        aria-label={project.name}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="pd-panel">
          <div className="pd-panel-head">
            <div className="pd-panel-title-group">
              <span className={`proj-status-pill proj-status-pill--${project.status}`}>
                {statusLabel}
              </span>
              <h2 className="pd-title">{project.name}</h2>
              <span className={`project-health ${health.tone}`}>{healthLabel}</span>
            </div>
            <button type="button" className="pd-close" onClick={onClose} aria-label={t.ui.close}>
              \u2715
            </button>
          </div>

          {project.description && (
            <p className="pd-description">{project.description}</p>
          )}

          <div className="pd-stats">
            <div className="pd-stat">
              <span className="pd-stat-label">{t.ui.budget}</span>
              <span className="pd-stat-value">{formatCurrency(project.budgetTotal)}</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-label">{t.ui.spent}</span>
              <span className="pd-stat-value">{formatCurrency(project.budgetSpent)}</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-label">{t.ui.progress}</span>
              <span className="pd-stat-value gold">{formatPercent(project.progressPercent)}</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-label">{t.ui.milestones}</span>
              <span className="pd-stat-value">{msDone}/{msTotal}</span>
            </div>
          </div>

          <div className="pd-dates">
            <span>{t.ui.start}: <strong>{project.startDate || "\u2014"}</strong></span>
            <span>{t.ui.end}: <strong>{project.endDate || "\u2014"}</strong></span>
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
              <h3 className="pd-section-title">{t.ui.milestones}</h3>
              <ul className="pd-ms-list">
                {project.milestones.map((ms) => {
                  const msStatusLabel = t.ui.status[ms.status] ?? ms.status.replace(/_/g, " ");
                  return (
                    <li key={ms.id} className={`pd-ms pd-ms--${ms.status}`}>
                      <span className="pd-ms-icon">{statusIcon[ms.status] ?? "\u25cb"}</span>
                      <span className="pd-ms-title">{ms.title}</span>
                      <span className="pd-ms-date">{ms.dueDate}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="pd-actions">
            {viewUrl && (
              <a href={viewUrl} target="_blank" rel="noopener noreferrer"
                className="pc-btn pc-btn--primary pd-action-btn">
                {t.ui.viewPublicPage}
              </a>
            )}
            {canManage && (
              <button
                type="button"
                className="pc-btn pc-btn--secondary pd-action-btn"
                onClick={() => onManage?.(project)}
              >
                {t.ui.manageProject}
              </button>
            )}
            <button type="button" className="pc-btn pc-btn--ghost pd-action-btn" onClick={onClose}>
              {t.ui.close}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ProjectGrid({ projects, onManage, canManage }) {
    return (
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDetail={setSelectedProject}
            onManage={onManage}
            canManage={canManage}
          />
        ))}
      </div>
    );
  }

  function LoginRequiredOverlay() {
    return (
      <div className="login-lock-overlay" role="alert" aria-live="polite">
        <div className="login-lock-card">
          <h3>{t.ui.loginRequiredTitle}</h3>
          <p>{t.ui.loginRequiredBody}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActiveNav("settings")}
          >
            {t.ui.loginNow}
          </button>
          <p className="login-lock-note">{t.ui.selfRegistrationDisabled}</p>
        </div>
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
            {isLoggedIn && (
              <UserBadge
                user={currentUser}
                lang={lang}
                onLogout={handleClearToken}
              />
            )}
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

          {activeNav === "dashboard" && isLoggedIn && (
            <LoggedInDashboard
              user={currentUser}
              lang={lang}
              loading={loading}
              error={error}
              projects={displayProjects}
              isDemoMode={isDemoMode}
              canEditProjects={canEditProjects}
              onOpenProject={setSelectedProject}
              onEditProject={openManageProject}
              onQuickStatusChange={handleQuickStatusChange}
              quickStatusBusyId={quickStatusBusyId}
              getViewUrl={getViewUrl}
              t={t}
            />
          )}

          {activeNav === "dashboard" && !isLoggedIn && (
            <section className="gated-panel">
              {requiresLogin && <LoginRequiredOverlay />}
              <div className={requiresLogin ? "gated-blur" : undefined}>
              {/* Topbar */}
              <section className="lp-topbar panel">
                <div className="lp-brand">
                  <strong>Jinsing</strong>
                  <span>{t.ui.constructionPlatform}</span>
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
                  <span className="chip">{t.ui.publicChip}</span>
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
              </div>
            </section>
          )}

          {selectedProject && (
            <ProjectDetailPanel
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
              onManage={(project) => openManageProject(project, { closeDetail: true })}
              canManage={canEditProjects}
            />
          )}

          {editingProject && (
            <EditProjectDrawer
              project={editingProject}
              lang={lang}
              onClose={() => setEditingProject(null)}
              onSaved={(updated) => {
                if (selectedProject && updated && selectedProject.id === updated.id) {
                  setSelectedProject(updated);
                }
              }}
              pushToast={pushToast}
            />
          )}

          <ToastStack toasts={toasts} onDismiss={dismissToast} />

          {activeNav === "projects" && (
            <section className="panel panel-spacer gated-panel">
              {!isLoggedIn && <LoginRequiredOverlay />}
              <div className={!isLoggedIn && requiresLogin ? "gated-blur" : undefined}>
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{t.ui.deliveryChip}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>

              <ProjectGrid
                projects={displayProjects}
                onManage={openManageProject}
                canManage={canEditProjects}
              />
              <DocumentView documents={[
                { id: 1, name: t.ui.docNames[0], url: "/docs/report.pdf" },
                { id: 2, name: t.ui.docNames[1], url: "/docs/license.pdf" },
                { id: 3, name: t.ui.docNames[2], url: "/docs/render.pdf" },
              ]} />
              </div>
            </section>
          )}

          {activeNav === "suppliers" && (
            <section className="gated-panel">
              {!isLoggedIn && requiresLogin && <LoginRequiredOverlay />}
              <div className={!isLoggedIn && requiresLogin ? "gated-blur" : undefined}>
                <SuppliersPage />
              </div>
            </section>
          )}

          {activeNav === "employees" && (
            <section className="gated-panel">
              {!isLoggedIn && requiresLogin && <LoginRequiredOverlay />}
              <div className={!isLoggedIn && requiresLogin ? "gated-blur" : undefined}>
                <CasualEmployeesPage />
              </div>
            </section>
          )}

          {activeNav === "docs" && (
            <section className="gated-panel">
              {!isLoggedIn && requiresLogin && <LoginRequiredOverlay />}
              <div className={!isLoggedIn && requiresLogin ? "gated-blur" : undefined}>
                <DocsPage />
              </div>
            </section>
          )}

          {activeNav === "entries" && (
            <section className="gated-panel">
              {!isLoggedIn && requiresLogin && <LoginRequiredOverlay />}
              <div className={!isLoggedIn && requiresLogin ? "gated-blur" : undefined}>
                <AutoEntriesPage />
              </div>
            </section>
          )}

          {activeNav === "finance" && (
            <section className="panel panel-spacer gated-panel">
              {!isLoggedIn && <LoginRequiredOverlay />}
              <div className={!isLoggedIn && requiresLogin ? "gated-blur" : undefined}>
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{t.ui.controlsChip}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>
              </div>
            </section>
          )}

          {activeNav === "reports" && (
            <section className="panel panel-spacer gated-panel">
              {!isLoggedIn && <LoginRequiredOverlay />}
              <div className={!isLoggedIn && requiresLogin ? "gated-blur" : undefined}>
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{t.ui.overviewChip}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>
              </div>
            </section>
          )}

          {activeNav === "settings" && (
            <section className="panel panel-spacer">
              <div className="panel-head">
                <h2>{pageTitle}</h2>
                <span className="chip">{t.ui.systemChip}</span>
              </div>
              <p className="panel-copy">{pageBlurb}</p>

              <div className="auth-panel">
                <div className="auth-panel-head">
                  <div>
                    <h3>{t.ui.loginWithCredentials}</h3>
                    <p>
                      {lang === "en"
                        ? "Use your platform username and password to sign in from the frontend."
                        : "使用您的平台用户名和密码从前端登录。"}
                    </p>
                  </div>
                </div>

                <div className="contact-row">
                  <label className="form-field">
                    <span>{t.ui.usernameLabel}</span>
                    <input
                      type="text"
                      autoComplete="username"
                      value={loginUsername}
                      onChange={(event) => setLoginUsername(event.target.value)}
                      placeholder={lang === "en" ? "Enter username" : "输入用户名"}
                    />
                  </label>
                  <label className="form-field">
                    <span>{t.ui.passwordLabel}</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder={lang === "en" ? "Enter password" : "输入密码"}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleFrontendLogin();
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="auth-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleFrontendLogin}
                    disabled={loginBusy}
                  >
                    {loginBusy ? t.ui.loggingIn : t.ui.loginButton}
                  </button>
                </div>

                {loginError && (
                  <p className="auth-feedback">{loginError}</p>
                )}

                <div className="auth-panel-head">
                  <div>
                    <h3>{lang === "en" ? "Backend Access Key" : "后端访问密钥"}</h3>
                    <p>
                      {lang === "en"
                        ? "Paste your backend access key here to authenticate platform requests without an active browser session."
                        : "在此粘贴后端访问密钥，以便在没有活动浏览器会话时验证平台请求。"}
                    </p>
                  </div>
                  <span className={`auth-status ${apiToken.trim() ? "active" : "inactive"}`}>
                    {apiToken.trim()
                      ? t.ui.accessKeyStored
                      : t.ui.noAccessKey}
                  </span>
                </div>

                <label className="form-field auth-token-field">
                  <span>{lang === "en" ? "Access Key" : "访问密钥"}</span>
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
                    {t.ui.saveAccessKey}
                  </button>
                  <button type="button" className="cta-btn cta-secondary" onClick={handleClearToken}>
                    {t.ui.clearAccessKey}
                  </button>
                  <button type="button" className="cta-btn cta-secondary" onClick={() => {
                    setApiToken("");
                    setTokenState("cleared");
                    apolloClient.resetStore().catch(() => {});
                  }}>
                    {t.ui.clearDemoData}
                  </button>
                </div>

                <p className="auth-help">
                  {lang === "en"
                    ? "Use a key tied to an account with project read/manage permissions."
                    : "请使用绑定到具有项目读取/管理权限账户的访问密钥。"}
                </p>

                {tokenState !== "idle" && (
                  <p className="auth-feedback">
                    {tokenState === "saved"
                      ? t.ui.loginSuccess
                      : lang === "en"
                        ? "Access key cleared."
                        : "访问密钥已清除。"}
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
