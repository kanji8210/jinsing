import { useState } from "react";
import BrandHeader from "./components/BrandHeader";
import KpiCards from "./components/KpiCards";
import ProjectPipeline from "./components/ProjectPipeline";
import FinanceHighlights from "./components/FinanceHighlights";
import SidebarNav from "./components/SidebarNav";

const COPY = {
  en: {
    languageLabel: "Language",
    sidebar: {
      brand: "JEEA",
      subtitle: "Construction admin",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "D" },
        { id: "projects", label: "Projects", icon: "P" },
        { id: "finance", label: "Finance", icon: "F" },
        { id: "reports", label: "Reports", icon: "R" },
        { id: "settings", label: "Settings", icon: "S" },
      ],
    },
    hero: {
      eyebrow: "Construction Intelligence",
      title: "JEEA",
      description:
        "Engineering progress, financial clarity, and field execution in one command surface.",
    },
    kpis: {
      ariaLabel: "Key performance indicators",
      items: [
        { label: "Active Sites", value: "12", note: "+3 this month" },
        { label: "Budget Utilization", value: "68.4%", note: "Within target" },
        { label: "Open RFIs", value: "27", note: "-5 this week" },
        { label: "Cash Burn (30d)", value: "$1.42M", note: "Forecast stable" },
      ],
    },
    pipeline: {
      title: "Project Pipeline",
      chip: "Engineering Flow",
      items: [
        { phase: "Planning", count: 4, emphasis: "calm" },
        { phase: "Procurement", count: 3, emphasis: "hot" },
        { phase: "Execution", count: 5, emphasis: "strong" },
        { phase: "Closeout", count: 2, emphasis: "calm" },
      ],
    },
    finance: {
      title: "Finance Highlights",
      chip: "Cost Control",
      items: [
        { title: "Committed Cost", value: "$8.9M" },
        { title: "Forecast at Completion", value: "$11.2M" },
        { title: "Variance", value: "-2.1%" },
      ],
    },
  },
  zh: {
    languageLabel: "语言",
    sidebar: {
      brand: "JEEA",
      subtitle: "施工管理",
      items: [
        { id: "dashboard", label: "仪表盘", icon: "总" },
        { id: "projects", label: "项目", icon: "项" },
        { id: "finance", label: "财务", icon: "财" },
        { id: "reports", label: "报表", icon: "报" },
        { id: "settings", label: "设置", icon: "设" },
      ],
    },
    hero: {
      eyebrow: "施工智能",
      title: "JEEA",
      description: "将工程进度、财务透明度与现场执行统一到一个指挥界面。",
    },
    kpis: {
      ariaLabel: "关键绩效指标",
      items: [
        { label: "在建工地", value: "12", note: "本月 +3" },
        { label: "预算使用率", value: "68.4%", note: "处于目标区间" },
        { label: "未关闭 RFI", value: "27", note: "本周 -5" },
        { label: "30天资金消耗", value: "$1.42M", note: "预测稳定" },
      ],
    },
    pipeline: {
      title: "项目流程",
      chip: "工程流转",
      items: [
        { phase: "策划", count: 4, emphasis: "calm" },
        { phase: "采购", count: 3, emphasis: "hot" },
        { phase: "施工执行", count: 5, emphasis: "strong" },
        { phase: "收尾", count: 2, emphasis: "calm" },
      ],
    },
    finance: {
      title: "财务重点",
      chip: "成本控制",
      items: [
        { title: "已承诺成本", value: "$8.9M" },
        { title: "完工预测成本", value: "$11.2M" },
        { title: "偏差", value: "-2.1%" },
      ],
    },
  },
};

export default function App() {
  const [lang, setLang] = useState("en");
  const [activeNav, setActiveNav] = useState("dashboard");
  const t = COPY[lang];

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

          <section id="dashboard">
            <BrandHeader
              eyebrow={t.hero.eyebrow}
              title={t.hero.title}
              description={t.hero.description}
            />
          </section>

          <KpiCards items={t.kpis.items} ariaLabel={t.kpis.ariaLabel} />

          <section className="dual-grid">
            <div id="projects">
              <ProjectPipeline
                title={t.pipeline.title}
                chip={t.pipeline.chip}
                items={t.pipeline.items}
              />
            </div>
            <div id="finance">
              <FinanceHighlights
                title={t.finance.title}
                chip={t.finance.chip}
                items={t.finance.items}
              />
            </div>
          </section>

          <section id="reports" className="panel panel-spacer">
            <div className="panel-head">
              <h2>{lang === "en" ? "Reports" : "报表"}</h2>
              <span className="chip">{lang === "en" ? "Overview" : "概览"}</span>
            </div>
            <p className="panel-copy">
              {lang === "en"
                ? "This section will later host project reports, budget summaries, and executive views."
                : "此区域后续可承载项目报表、预算汇总和管理层视图。"}
            </p>
          </section>

          <section id="settings" className="panel panel-spacer">
            <div className="panel-head">
              <h2>{lang === "en" ? "Settings" : "设置"}</h2>
              <span className="chip">{lang === "en" ? "System" : "系统"}</span>
            </div>
            <p className="panel-copy">
              {lang === "en"
                ? "We can wire this to user preferences, localization defaults, and API settings next."
                : "后续可以连接用户偏好、语言默认值和 API 设置。"}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
