"use client";

import { useMemo, useState } from "react";

type View =
  | "ask"
  | "dashboard"
  | "metrics"
  | "history"
  | "admin-metrics"
  | "admin-semantic"
  | "admin-models"
  | "admin-permissions"
  | "admin-evaluation"
  | "admin-audit";

type ResultKind = "operations" | "risk" | "marketing";

type Metric = {
  id: string;
  name: string;
  domain: string;
  owner: string;
  status: "已发布" | "审核中" | "草稿";
  coverage: string;
  definition: string;
};

const businessNavigation: { id: View; label: string; icon: string }[] = [
  { id: "ask", label: "智能问数", icon: "问" },
  { id: "dashboard", label: "分析看板", icon: "析" },
  { id: "metrics", label: "指标中心", icon: "标" },
  { id: "history", label: "历史查询", icon: "史" },
];

const adminNavigation: { id: View; label: string; icon: string }[] = [
  { id: "admin-metrics", label: "指标治理", icon: "治" },
  { id: "admin-semantic", label: "语义知识", icon: "义" },
  { id: "admin-models", label: "数据模型", icon: "模" },
  { id: "admin-permissions", label: "权限安全", icon: "权" },
  { id: "admin-evaluation", label: "评测中心", icon: "测" },
  { id: "admin-audit", label: "审计监控", icon: "审" },
];

const queryExamples = [
  {
    eyebrow: "经营分析",
    query: "今年上半年各农商行普惠小微贷款余额、同比增速和全省排名是多少？",
  },
  {
    eyebrow: "风险管控",
    query: "近30天新增逾期贷款主要集中在哪些机构和产品？",
  },
  {
    eyebrow: "客户营销",
    query: "筛选近半年存款下降但资产规模较高的客户群体",
  },
];

const resultCopy: Record<
  ResultKind,
  {
    title: string;
    summary: string;
    metric: string;
    value: string;
    change: string;
    secondary: string;
    secondaryValue: string;
    chartTitle: string;
    chartUnit: string;
    bars: { name: string; value: number; display: string; tone?: "warn" }[];
  }
> = {
  operations: {
    title: "普惠小微贷款保持稳健增长，苏州、无锡、常州位列前三",
    summary:
      "截至2026年6月末，全省普惠型小微企业贷款余额4,286.3亿元，同比增长12.8%。有3家机构增速低于全省平均水平，建议重点关注盐城、淮安和宿迁。",
    metric: "普惠小微贷款余额",
    value: "4,286.3亿元",
    change: "同比 +12.8%",
    secondary: "户均贷款",
    secondaryValue: "87.6万元",
    chartTitle: "机构贷款余额与同比增速",
    chartUnit: "余额（亿元）",
    bars: [
      { name: "苏州", value: 96, display: "682.4" },
      { name: "无锡", value: 82, display: "578.9" },
      { name: "常州", value: 68, display: "481.6" },
      { name: "南通", value: 59, display: "416.8" },
      { name: "盐城", value: 47, display: "331.2", tone: "warn" },
      { name: "淮安", value: 39, display: "275.5", tone: "warn" },
    ],
  },
  risk: {
    title: "新增逾期主要集中在制造业与批发零售业",
    summary:
      "近30天新增逾期贷款8.64亿元，较前30天上升6.2%。盐城、徐州和淮安合计占新增逾期的42.7%，其中制造业贡献最高。",
    metric: "新增逾期贷款",
    value: "8.64亿元",
    change: "环比 +6.2%",
    secondary: "涉及客户",
    secondaryValue: "1,284户",
    chartTitle: "机构新增逾期分布",
    chartUnit: "金额（亿元）",
    bars: [
      { name: "盐城", value: 92, display: "1.82", tone: "warn" },
      { name: "徐州", value: 76, display: "1.51", tone: "warn" },
      { name: "淮安", value: 58, display: "1.16", tone: "warn" },
      { name: "苏州", value: 44, display: "0.88" },
      { name: "南通", value: 37, display: "0.73" },
      { name: "泰州", value: 29, display: "0.57" },
    ],
  },
  marketing: {
    title: "识别出3,216名高潜力客户，预计可触达2,780名",
    summary:
      "目标客群近半年日均存款下降15%以上，但可投资资产仍高于50万元。系统已按权限隐藏敏感身份信息，导出客户明细需完成审批。",
    metric: "高潜客户数",
    value: "3,216户",
    change: "较上月 +8.4%",
    secondary: "预计可触达",
    secondaryValue: "2,780户",
    chartTitle: "高潜客户机构分布",
    chartUnit: "客户数（户）",
    bars: [
      { name: "南京", value: 91, display: "628" },
      { name: "苏州", value: 78, display: "536" },
      { name: "无锡", value: 63, display: "432" },
      { name: "常州", value: 51, display: "351" },
      { name: "南通", value: 43, display: "296" },
      { name: "扬州", value: 34, display: "234" },
    ],
  },
};

const initialMetrics: Metric[] = [
  {
    id: "LN-001",
    name: "各项贷款余额",
    domain: "经营分析",
    owner: "信贷管理部",
    status: "已发布",
    coverage: "13个维度",
    definition: "报告期末金融机构对客户发放的人民币及外币贷款余额。",
  },
  {
    id: "SME-017",
    name: "普惠型小微企业贷款余额",
    domain: "经营分析",
    owner: "普惠金融部",
    status: "已发布",
    coverage: "16个维度",
    definition: "单户授信总额1,000万元及以下的小微企业贷款、个体工商户经营性贷款和小微企业主经营性贷款余额。",
  },
  {
    id: "RK-032",
    name: "新增逾期贷款",
    domain: "风险管控",
    owner: "风险管理部",
    status: "已发布",
    coverage: "11个维度",
    definition: "本统计周期内首次出现本金或利息逾期的贷款余额。",
  },
  {
    id: "MK-008",
    name: "高潜客户数",
    domain: "客户营销",
    owner: "零售金融部",
    status: "审核中",
    coverage: "8个维度",
    definition: "符合资产、活跃度和产品持有特征的潜在价值客户数量。",
  },
  {
    id: "DP-003",
    name: "各项存款日均余额",
    domain: "经营分析",
    owner: "计划财务部",
    status: "草稿",
    coverage: "9个维度",
    definition: "统计期内各日存款余额之和除以统计期自然日天数。",
  },
];

const historySeed = [
  {
    time: "今天 09:42",
    question: "今年上半年各农商行普惠小微贷款余额、同比增速和全省排名是多少？",
    domain: "经营分析",
    status: "成功",
  },
  {
    time: "昨天 16:18",
    question: "近30天新增逾期贷款主要集中在哪些机构和产品？",
    domain: "风险管控",
    status: "成功",
  },
  {
    time: "7月27日 11:06",
    question: "二季度手机银行月活客户数及环比情况",
    domain: "运营分析",
    status: "成功",
  },
  {
    time: "7月26日 14:35",
    question: "筛选近半年存款下降但资产规模较高的客户群体",
    domain: "客户营销",
    status: "需审批",
  },
];

function StatusBadge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "gray" | "red" }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("ask");
  const [query, setQuery] = useState(queryExamples[0].query);
  const [resultKind, setResultKind] = useState<ResultKind>("operations");
  const [isRunning, setIsRunning] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [chartMode, setChartMode] = useState<"bar" | "table">("bar");
  const [toast, setToast] = useState("");
  const [metrics, setMetrics] = useState(initialMetrics);
  const [metricSearch, setMetricSearch] = useState("");
  const [metricStatus, setMetricStatus] = useState("全部");
  const [history, setHistory] = useState(historySeed);
  const [historySearch, setHistorySearch] = useState("");
  const [evaluationRunning, setEvaluationRunning] = useState(false);
  const [evaluationDone, setEvaluationDone] = useState(false);
  const [modelChecks, setModelChecks] = useState<Record<string, string>>({});
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, boolean>>({
    manager_export: true,
    manager_customer: false,
    branch_export: true,
    branch_customer: false,
    risk_export: true,
    risk_customer: true,
    marketing_export: false,
    marketing_customer: true,
  });
  const [modal, setModal] = useState<"metric" | "term" | null>(null);

  const result = resultCopy[resultKind];

  const filteredMetrics = useMemo(
    () =>
      metrics.filter(
        (metric) =>
          (metricStatus === "全部" || metric.status === metricStatus) &&
          `${metric.name}${metric.id}${metric.owner}${metric.domain}`
            .toLowerCase()
            .includes(metricSearch.toLowerCase()),
      ),
    [metricSearch, metricStatus, metrics],
  );

  const filteredHistory = useMemo(
    () =>
      history.filter((item) =>
        `${item.question}${item.domain}`.toLowerCase().includes(historySearch.toLowerCase()),
      ),
    [history, historySearch],
  );

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function runQuery(text = query) {
    const trimmed = text.trim();
    if (!trimmed) {
      notify("请先输入一个业务问题");
      return;
    }
    setQuery(trimmed);
    setIsRunning(true);
    setShowSql(false);
    window.setTimeout(() => {
      const nextKind: ResultKind = /逾期|不良|风险/.test(trimmed)
        ? "risk"
        : /客户|营销|触达/.test(trimmed)
          ? "marketing"
          : "operations";
      setResultKind(nextKind);
      setHistory((current) => [
        {
          time: "刚刚",
          question: trimmed,
          domain: nextKind === "risk" ? "风险管控" : nextKind === "marketing" ? "客户营销" : "经营分析",
          status: nextKind === "marketing" ? "需审批" : "成功",
        },
        ...current.filter((item) => item.question !== trimmed),
      ]);
      setIsRunning(false);
      notify("查询完成，结果已通过口径与权限校验");
    }, 820);
  }

  function exportCsv() {
    const rows = [
      ["机构", result.chartUnit],
      ...result.bars.map((bar) => [bar.name, bar.display]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `DataNavigator-${result.metric}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify("结果已导出，并记录在审计日志中");
  }

  function addMetric() {
    setMetrics((current) => [
      {
        id: `NEW-${String(current.length + 1).padStart(3, "0")}`,
        name: "新增指标（待完善）",
        domain: "经营分析",
        owner: "数据资产部",
        status: "草稿",
        coverage: "0个维度",
        definition: "请补充指标业务定义、计算逻辑、来源和适用范围。",
      },
      ...current,
    ]);
    setModal(null);
    notify("指标草稿已创建");
  }

  function publishMetric(id: string) {
    setMetrics((current) =>
      current.map((metric) =>
        metric.id === id ? { ...metric, status: "已发布" as const } : metric,
      ),
    );
    notify("指标已发布，变更记录已留痕");
  }

  function runEvaluation() {
    setEvaluationRunning(true);
    setEvaluationDone(false);
    window.setTimeout(() => {
      setEvaluationRunning(false);
      setEvaluationDone(true);
      notify("1,248条标准用例评测完成");
    }, 1400);
  }

  function checkModel(name: string) {
    setModelChecks((current) => ({ ...current, [name]: "检测中" }));
    window.setTimeout(() => {
      setModelChecks((current) => ({ ...current, [name]: "连接正常" }));
      notify(`${name}连接检测通过`);
    }, 700);
  }

  function goTo(view: View) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => goTo("ask")} role="button" tabIndex={0}>
          <span className="brand-mark">DN</span>
          <span>
            <strong>DataNavigator</strong>
            <small>农商数据领航员</small>
          </span>
        </div>

        <div className="environment-card">
          <span className="pulse-dot" />
          <span>
            <strong>演示环境</strong>
            <small>模拟数据 · 2026年7月</small>
          </span>
        </div>

        <nav aria-label="业务功能">
          <p className="nav-label">业务工作台</p>
          {businessNavigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <p className="nav-label admin-label">管理控制台</p>
          {adminNavigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="user-card">
          <span className="avatar">周</span>
          <span>
            <strong>周主管</strong>
            <small>数据资产部 · 管理员</small>
          </span>
          <button aria-label="用户菜单">•••</button>
        </div>
      </aside>

      <main className="main-content">
        {activeView === "ask" && (
          <AskView
            query={query}
            setQuery={setQuery}
            isRunning={isRunning}
            runQuery={runQuery}
            result={result}
            resultKind={resultKind}
            chartMode={chartMode}
            setChartMode={setChartMode}
            showSql={showSql}
            setShowSql={setShowSql}
            exportCsv={exportCsv}
            notify={notify}
          />
        )}
        {activeView === "dashboard" && <DashboardView runQuery={runQuery} goTo={goTo} />}
        {activeView === "metrics" && (
          <MetricCenter
            metrics={filteredMetrics}
            search={metricSearch}
            setSearch={setMetricSearch}
            goTo={goTo}
          />
        )}
        {activeView === "history" && (
          <HistoryView
            items={filteredHistory}
            search={historySearch}
            setSearch={setHistorySearch}
            runQuery={runQuery}
            goTo={goTo}
          />
        )}
        {activeView === "admin-metrics" && (
          <AdminMetrics
            metrics={filteredMetrics}
            search={metricSearch}
            setSearch={setMetricSearch}
            status={metricStatus}
            setStatus={setMetricStatus}
            openModal={() => setModal("metric")}
            publishMetric={publishMetric}
          />
        )}
        {activeView === "admin-semantic" && (
          <SemanticAdmin openModal={() => setModal("term")} notify={notify} />
        )}
        {activeView === "admin-models" && (
          <ModelAdmin modelChecks={modelChecks} checkModel={checkModel} />
        )}
        {activeView === "admin-permissions" && (
          <PermissionAdmin
            matrix={permissionMatrix}
            setMatrix={setPermissionMatrix}
            notify={notify}
          />
        )}
        {activeView === "admin-evaluation" && (
          <EvaluationAdmin
            running={evaluationRunning}
            done={evaluationDone}
            runEvaluation={runEvaluation}
          />
        )}
        {activeView === "admin-audit" && <AuditAdmin exportCsv={exportCsv} />}
      </main>

      {toast && <div className="toast"><span>✓</span>{toast}</div>}

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <div className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">{modal === "metric" ? "指标治理" : "语义知识"}</p>
                <h2>{modal === "metric" ? "新建指标草稿" : "新增业务术语"}</h2>
              </div>
              <button className="icon-button" onClick={() => setModal(null)} aria-label="关闭">×</button>
            </div>
            {modal === "metric" ? (
              <div className="form-grid">
                <label>指标名称<input defaultValue="新增指标（待完善）" /></label>
                <label>指标编码<input defaultValue={`NEW-${String(metrics.length + 1).padStart(3, "0")}`} /></label>
                <label>业务域<select defaultValue="经营分析"><option>经营分析</option><option>风险管控</option><option>客户营销</option></select></label>
                <label>责任部门<select defaultValue="数据资产部"><option>数据资产部</option><option>风险管理部</option><option>普惠金融部</option></select></label>
                <label className="full-field">业务定义<textarea defaultValue="请补充指标业务定义、计算逻辑、来源和适用范围。" /></label>
              </div>
            ) : (
              <div className="form-grid">
                <label>标准术语<input defaultValue="普惠小微" /></label>
                <label>业务域<select defaultValue="信贷业务"><option>信贷业务</option><option>风险业务</option><option>零售业务</option></select></label>
                <label className="full-field">同义词<input defaultValue="普惠贷、小微贷、普惠型小微企业贷款" /></label>
                <label className="full-field">业务说明<textarea defaultValue="用于统一识别行内口语化表达，并映射至标准指标。" /></label>
              </div>
            )}
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setModal(null)}>取消</button>
              <button
                className="primary-button"
                onClick={modal === "metric" ? addMetric : () => { setModal(null); notify("业务术语已保存"); }}
              >
                保存草稿
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function AskView({
  query,
  setQuery,
  isRunning,
  runQuery,
  result,
  resultKind,
  chartMode,
  setChartMode,
  showSql,
  setShowSql,
  exportCsv,
  notify,
}: {
  query: string;
  setQuery: (value: string) => void;
  isRunning: boolean;
  runQuery: (value?: string) => void;
  result: (typeof resultCopy)[ResultKind];
  resultKind: ResultKind;
  chartMode: "bar" | "table";
  setChartMode: (value: "bar" | "table") => void;
  showSql: boolean;
  setShowSql: (value: boolean) => void;
  exportCsv: () => void;
  notify: (message: string) => void;
}) {
  return (
    <div className="page ask-page">
      <section className="ask-hero">
        <div className="hero-copy">
          <p className="eyebrow">银行级智能问数</p>
          <h1>你好，想了解哪项业务数据？</h1>
          <p>用日常语言提问，系统会自动完成口径识别、权限校验、数据计算和分析解读。</p>
        </div>
        <div className="query-box">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runQuery();
            }}
            aria-label="输入业务问题"
            placeholder="例如：今年上半年各农商行普惠小微贷款余额和同比增速是多少？"
          />
          <div className="query-footer">
            <span>已接入 326 项认证指标 · 当前范围：江苏省内全部机构</span>
            <button className="primary-button query-submit" onClick={() => runQuery()} disabled={isRunning}>
              {isRunning ? <><span className="spinner" />正在分析</> : "开始问数  ↗"}
            </button>
          </div>
        </div>
        <div className="query-examples">
          {queryExamples.map((example) => (
            <button key={example.eyebrow} onClick={() => runQuery(example.query)}>
              <span>{example.eyebrow}</span>
              <strong>{example.query}</strong>
              <i>→</i>
            </button>
          ))}
        </div>
      </section>

      <section className={`result-section ${isRunning ? "loading" : ""}`}>
        <div className="section-title-row">
          <div>
            <p className="eyebrow">查询结果</p>
            <h2>系统已理解你的问题</h2>
          </div>
          <div className="security-note"><span>盾</span> 已完成权限校验与敏感字段脱敏</div>
        </div>

        <div className="understanding-card">
          <div>
            <span>指标</span>
            <strong>{result.metric}</strong>
          </div>
          <div>
            <span>时间</span>
            <strong>{resultKind === "risk" ? "近30天" : resultKind === "marketing" ? "近6个月" : "2026年上半年"}</strong>
          </div>
          <div>
            <span>分析维度</span>
            <strong>{resultKind === "marketing" ? "机构、客户层级" : "机构、产品"}</strong>
          </div>
          <div>
            <span>数据范围</span>
            <strong>权限内全部机构</strong>
          </div>
          <button onClick={() => notify("可在实际系统中修改指标、时间、维度和范围")}>调整口径</button>
        </div>

        <div className="analysis-grid">
          <div className="analysis-main">
            <div className="insight-card">
              <div className="insight-heading">
                <span className="ai-mark">AI</span>
                <div>
                  <p>业务结论</p>
                  <h3>{result.title}</h3>
                </div>
              </div>
              <p className="insight-summary">{result.summary}</p>
              <div className="evidence-line">
                <span>数据依据</span>
                <span>贷款主题宽表</span>
                <span>更新时间 08:30</span>
                <span>指标版本 v3.2</span>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-heading">
                <div>
                  <h3>{result.chartTitle}</h3>
                  <p>{result.chartUnit} · 数据截至2026年6月末</p>
                </div>
                <div className="segmented-control">
                  <button className={chartMode === "bar" ? "active" : ""} onClick={() => setChartMode("bar")}>图表</button>
                  <button className={chartMode === "table" ? "active" : ""} onClick={() => setChartMode("table")}>明细</button>
                </div>
              </div>

              {chartMode === "bar" ? (
                <div className="bar-chart" aria-label={result.chartTitle}>
                  {result.bars.map((bar) => (
                    <div className="bar-row" key={bar.name}>
                      <span className="bar-label">{bar.name}</span>
                      <div className="bar-track"><span className={bar.tone === "warn" ? "warn" : ""} style={{ width: `${bar.value}%` }} /></div>
                      <strong>{bar.display}</strong>
                    </div>
                  ))}
                  <div className="chart-legend">
                    <span><i className="legend-main" />正常范围</span>
                    <span><i className="legend-warn" />需重点关注</span>
                  </div>
                </div>
              ) : (
                <div className="table-wrap compact-table">
                  <table>
                    <thead><tr><th>机构</th><th>{result.chartUnit}</th><th>排名</th><th>状态</th></tr></thead>
                    <tbody>
                      {result.bars.map((bar, index) => (
                        <tr key={bar.name}>
                          <td><strong>{bar.name}农商银行</strong></td>
                          <td>{bar.display}</td>
                          <td>第 {index + 1} 名</td>
                          <td>{bar.tone === "warn" ? <StatusBadge tone="amber">需关注</StatusBadge> : <StatusBadge>正常</StatusBadge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="follow-up-card">
              <span>继续分析</span>
              <button onClick={() => runQuery("下钻到产品类型并分析变化原因")}>下钻到产品类型</button>
              <button onClick={() => runQuery("与去年同期对比并找出变化最大的机构")}>对比去年同期</button>
              <button onClick={() => runQuery("找出低于全省平均水平的机构")}>查看异常机构</button>
            </div>

            <div className="sql-card">
              <button className="sql-toggle" onClick={() => setShowSql(!showSql)}>
                <span><b>SQL</b> 查看查询逻辑（专业模式）</span>
                <span>{showSql ? "收起 ↑" : "展开 ↓"}</span>
              </button>
              {showSql && (
                <pre>{`SELECT
  org_name,
  SUM(inclusive_sme_loan_balance) AS loan_balance,
  yoy_growth_rate
FROM certified_metric_view
WHERE stat_date = '2026-06-30'
  AND org_id IN (:authorized_org_scope)
GROUP BY org_name, yoy_growth_rate
ORDER BY loan_balance DESC
LIMIT 100;`}</pre>
              )}
            </div>
          </div>

          <aside className="analysis-side">
            <div className="kpi-card">
              <span>{result.metric}</span>
              <strong>{result.value}</strong>
              <em>{result.change}</em>
              <div className="mini-bars">{[36, 43, 51, 49, 62, 76, 83].map((height, index) => <i key={index} style={{ height }} />)}</div>
            </div>
            <div className="kpi-card secondary">
              <span>{result.secondary}</span>
              <strong>{result.secondaryValue}</strong>
              <em>处于全省合理区间</em>
            </div>
            <div className="action-card">
              <h3>结果操作</h3>
              <button onClick={() => notify("已加入“经营驾驶舱”")}>＋ 加入分析看板</button>
              <button onClick={exportCsv}>⇩ 导出结果</button>
              <button onClick={() => notify("分享链接已复制，有效期7天")}>↗ 分享给同事</button>
              <button onClick={() => notify("已收藏到常用问数")}>☆ 收藏本次问数</button>
            </div>
            <div className="trust-card">
              <h3>结果可信度 <strong>高</strong></h3>
              <div><span>指标口径匹配</span><b>100%</b></div>
              <div><span>权限策略命中</span><b>4项</b></div>
              <div><span>查询逻辑校验</span><b>通过</b></div>
              <p>本次结果使用已发布指标和认证数据模型生成，可审计追溯。</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function DashboardView({ runQuery, goTo }: { runQuery: (value: string) => void; goTo: (view: View) => void }) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="个人分析空间"
        title="经营驾驶舱"
        description="集中查看已收藏的问数结果、机构趋势与业务预警。"
        action={<button className="primary-button" onClick={() => goTo("ask")}>＋ 添加分析卡片</button>}
      />
      <div className="stat-grid four">
        <div className="stat-card"><span>各项贷款余额</span><strong>3.32万亿元</strong><em>同比 +9.6%</em></div>
        <div className="stat-card"><span>各项存款余额</span><strong>4.16万亿元</strong><em>同比 +8.1%</em></div>
        <div className="stat-card"><span>普惠小微贷款</span><strong>4,286亿元</strong><em>同比 +12.8%</em></div>
        <div className="stat-card warning"><span>新增风险预警</span><strong>17项</strong><em>3项需立即关注</em></div>
      </div>
      <div className="dashboard-grid">
        <section className="panel wide">
          <div className="card-heading"><div><h3>核心业务趋势</h3><p>近12个月 · 单位：万亿元</p></div><button className="text-button" onClick={() => runQuery("分析近12个月贷款与存款余额趋势")}>智能分析 →</button></div>
          <div className="line-chart-sim">
            <div className="axis-labels"><span>5.0</span><span>4.0</span><span>3.0</span><span>2.0</span></div>
            <div className="chart-columns">
              {[48, 52, 50, 58, 61, 65, 69, 72, 76, 79, 84, 88].map((height, index) => (
                <div key={index}><i style={{ height: `${height}%` }} /><b style={{ height: `${height - 18}%` }} /><span>{index + 8 > 12 ? index - 4 : index + 8}月</span></div>
              ))}
            </div>
          </div>
          <div className="chart-legend"><span><i className="legend-main" />存款余额</span><span><i className="legend-dark" />贷款余额</span></div>
        </section>
        <section className="panel">
          <div className="card-heading"><div><h3>机构综合排名</h3><p>按规模与增速综合评分</p></div></div>
          <div className="ranking-list">
            {["苏州农商银行","无锡农商银行","常州农商银行","南通农商银行","南京农商银行"].map((name, index) => (
              <div key={name}><span className={index < 3 ? "rank top" : "rank"}>{index + 1}</span><strong>{name}</strong><em>{96 - index * 3}.2分</em></div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="card-heading"><div><h3>风险事项</h3><p>按风险等级排序</p></div><StatusBadge tone="red">17项</StatusBadge></div>
          <div className="alert-list">
            <button onClick={() => runQuery("查看盐城近30天新增逾期明细")}><i className="risk-high" /><span><strong>新增逾期上升</strong><small>盐城 · 较前30天上升18.2%</small></span><b>高</b></button>
            <button onClick={() => runQuery("查看制造业贷款集中度变化")}><i className="risk-mid" /><span><strong>行业集中度偏高</strong><small>制造业 · 超预警值2.4个百分点</small></span><b>中</b></button>
            <button onClick={() => runQuery("查看普惠小微增速低于平均的机构")}><i className="risk-mid" /><span><strong>增速低于全省均值</strong><small>3家机构 · 连续2个月低于均值</small></span><b>中</b></button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCenter({ metrics, search, setSearch, goTo }: { metrics: Metric[]; search: string; setSearch: (value: string) => void; goTo: (view: View) => void }) {
  return (
    <div className="page">
      <PageHeader eyebrow="统一口径" title="指标中心" description="浏览全行已认证指标，查看业务定义、计算逻辑和适用范围。" />
      <div className="metric-summary">
        <div><strong>326</strong><span>已接入指标</span></div>
        <div><strong>12</strong><span>业务主题</span></div>
        <div><strong>95.8%</strong><span>口径一致率</span></div>
        <div><strong>98.6%</strong><span>数据质量评分</span></div>
      </div>
      <div className="toolbar">
        <label className="search-box">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索指标名称、编码或责任部门" /></label>
        <button className="secondary-button" onClick={() => goTo("admin-metrics")}>进入指标治理</button>
      </div>
      <div className="metric-card-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.id}>
            <div className="metric-card-top"><span>{metric.id}</span><StatusBadge tone={metric.status === "已发布" ? "green" : metric.status === "审核中" ? "amber" : "gray"}>{metric.status}</StatusBadge></div>
            <h3>{metric.name}</h3>
            <p>{metric.definition}</p>
            <div className="metric-meta"><span>{metric.domain}</span><span>{metric.coverage}</span><span>{metric.owner}</span></div>
            <button onClick={() => goTo("ask")}>使用该指标问数 →</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function HistoryView({ items, search, setSearch, runQuery, goTo }: { items: typeof historySeed; search: string; setSearch: (value: string) => void; runQuery: (value: string) => void; goTo: (view: View) => void }) {
  return (
    <div className="page">
      <PageHeader eyebrow="可追溯分析" title="历史查询" description="回看、复用和管理你的问数记录，每次查询均保留口径与权限快照。" action={<button className="primary-button" onClick={() => goTo("ask")}>发起新问数</button>} />
      <div className="toolbar">
        <label className="search-box">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索问题或业务场景" /></label>
        <button className="secondary-button">全部记录⌄</button>
      </div>
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>查询时间</th><th>业务问题</th><th>业务域</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.question}-${index}`}>
                  <td className="muted-cell">{item.time}</td>
                  <td className="question-cell">{item.question}</td>
                  <td>{item.domain}</td>
                  <td><StatusBadge tone={item.status === "成功" ? "green" : "amber"}>{item.status}</StatusBadge></td>
                  <td><button className="row-action" onClick={() => { goTo("ask"); runQuery(item.question); }}>再次查询</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdminMetrics({ metrics, search, setSearch, status, setStatus, openModal, publishMetric }: { metrics: Metric[]; search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void; openModal: () => void; publishMetric: (id: string) => void }) {
  return (
    <div className="page">
      <PageHeader eyebrow="管理控制台 / 数据治理" title="指标治理" description="管理指标从草拟、评审、发布到下线的完整生命周期。" action={<button className="primary-button" onClick={openModal}>＋ 新建指标</button>} />
      <div className="stat-grid">
        <div className="stat-card"><span>指标总数</span><strong>326</strong><em>本月新增 12</em></div>
        <div className="stat-card"><span>已发布</span><strong>298</strong><em>占比 91.4%</em></div>
        <div className="stat-card"><span>待审核</span><strong>18</strong><em>6项即将超时</em></div>
        <div className="stat-card"><span>口径冲突</span><strong>3</strong><em>需要治理</em></div>
      </div>
      <div className="toolbar">
        <label className="search-box">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索指标名称、编码或责任部门" /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option><option>已发布</option><option>审核中</option><option>草稿</option></select>
      </div>
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>指标编码</th><th>指标名称</th><th>业务域</th><th>责任部门</th><th>覆盖范围</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.id}>
                  <td className="mono-cell">{metric.id}</td>
                  <td className="question-cell">{metric.name}</td>
                  <td>{metric.domain}</td>
                  <td>{metric.owner}</td>
                  <td>{metric.coverage}</td>
                  <td><StatusBadge tone={metric.status === "已发布" ? "green" : metric.status === "审核中" ? "amber" : "gray"}>{metric.status}</StatusBadge></td>
                  <td>{metric.status === "已发布" ? <button className="row-action">编辑</button> : <button className="row-action" onClick={() => publishMetric(metric.id)}>发布</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SemanticAdmin({ openModal, notify }: { openModal: () => void; notify: (message: string) => void }) {
  const terms = [
    ["普惠小微", "普惠贷、小微贷、普惠型小微企业贷款", "信贷业务", "12"],
    ["不良", "不良贷、不良贷款、五级分类后三类", "风险业务", "18"],
    ["月活", "MAU、月活客户、月活跃用户", "电子银行", "9"],
    ["AUM", "客户资产、管理资产、金融资产", "零售业务", "15"],
    ["本年", "今年、年初至今、YTD", "公共术语", "23"],
  ];
  return (
    <div className="page">
      <PageHeader eyebrow="管理控制台 / 语义标准" title="语义知识库" description="统一金融术语、行内简称和个性化表达，提升口语化意图识别。" action={<button className="primary-button" onClick={openModal}>＋ 新增术语</button>} />
      <div className="knowledge-banner">
        <div><span className="banner-mark">义</span><span><strong>金融语义网络</strong><small>已建立指标、维度、实体和同义词之间的可解释映射关系</small></span></div>
        <div><strong>1,842</strong><span>标准术语</span></div>
        <div><strong>5,628</strong><span>同义表达</span></div>
        <div><strong>94.7%</strong><span>意图准确率</span></div>
      </div>
      <div className="toolbar"><label className="search-box">⌕<input placeholder="搜索术语、简称或同义词" /></label><button className="secondary-button" onClick={() => notify("待治理表达清单已刷新")}>待治理表达 26</button></div>
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>标准术语</th><th>同义词与常见问法</th><th>业务域</th><th>关联指标</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              {terms.map((term) => <tr key={term[0]}><td className="question-cell">{term[0]}</td><td>{term[1]}</td><td>{term[2]}</td><td>{term[3]}项</td><td><StatusBadge>生效中</StatusBadge></td><td><button className="row-action">维护</button></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ModelAdmin({ modelChecks, checkModel }: { modelChecks: Record<string, string>; checkModel: (name: string) => void }) {
  const models = [
    { name: "信贷主题数据集市", type: "GaussDB", tables: "48张表", update: "08:30", health: "正常" },
    { name: "风险管理数据集市", type: "Oracle", tables: "32张表", update: "08:22", health: "正常" },
    { name: "客户营销数据集市", type: "OceanBase", tables: "27张表", update: "08:18", health: "正常" },
    { name: "监管报送数据仓库", type: "Hive", tables: "65张表", update: "昨日 23:40", health: "延迟" },
  ];
  return (
    <div className="page">
      <PageHeader eyebrow="管理控制台 / 数据底座" title="数据模型" description="维护可信数据源、业务主题、表关系和标准连接路径。" action={<button className="primary-button">＋ 接入数据源</button>} />
      <div className="model-grid">
        {models.map((model) => (
          <article className="model-card" key={model.name}>
            <div className="model-card-top"><span className="database-icon">DB</span><StatusBadge tone={model.health === "正常" ? "green" : "amber"}>{model.health}</StatusBadge></div>
            <h3>{model.name}</h3><p>{model.type} · {model.tables}</p>
            <dl><div><dt>最近同步</dt><dd>{model.update}</dd></div><div><dt>认证关系</dt><dd>18条</dd></div><div><dt>可用指标</dt><dd>86项</dd></div></dl>
            <button className="secondary-button full-button" onClick={() => checkModel(model.name)}>{modelChecks[model.name] || "检测连接"}</button>
          </article>
        ))}
      </div>
      <section className="panel relation-panel">
        <div className="card-heading"><div><h3>认证模型关系</h3><p>NL2SQL仅可使用已审核的表关联与字段映射</p></div><button className="text-button">管理关系 →</button></div>
        <div className="relation-flow"><span>机构维表</span><i>1 : N</i><span>贷款事实表</span><i>N : 1</i><span>客户维表</span><i>1 : N</i><span>风险分类表</span></div>
      </section>
    </div>
  );
}

function PermissionAdmin({ matrix, setMatrix, notify }: { matrix: Record<string, boolean>; setMatrix: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; notify: (message: string) => void }) {
  const roles = [
    ["总行管理者", "manager"],
    ["分支行负责人", "branch"],
    ["风控专员", "risk"],
    ["客户经理", "marketing"],
  ];
  function toggle(key: string) {
    setMatrix((current) => ({ ...current, [key]: !current[key] }));
    notify("权限策略已更新，变更将在发布后生效");
  }
  return (
    <div className="page">
      <PageHeader eyebrow="管理控制台 / 安全合规" title="权限与数据安全" description="按机构、岗位、行、列和字段统一控制数据访问、脱敏与导出。" action={<button className="primary-button" onClick={() => notify("策略发布成功")}>发布策略</button>} />
      <div className="security-grid">
        <div className="security-stat"><span className="security-symbol">盾</span><div><strong>42</strong><span>生效中策略</span></div><em>全部正常</em></div>
        <div className="security-stat"><span className="security-symbol">隐</span><div><strong>28</strong><span>敏感字段</span></div><em>已配置脱敏</em></div>
        <div className="security-stat"><span className="security-symbol">审</span><div><strong>100%</strong><span>审计覆盖率</span></div><em>全链路留痕</em></div>
      </div>
      <section className="panel permission-panel">
        <div className="card-heading"><div><h3>岗位权限矩阵</h3><p>开关状态为当前草稿，发布后同步至问数引擎</p></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>岗位角色</th><th>机构范围</th><th>指标查询</th><th>明细导出</th><th>客户敏感字段</th><th>审计级别</th></tr></thead>
            <tbody>
              {roles.map(([label, key]) => (
                <tr key={key}>
                  <td className="question-cell">{label}</td>
                  <td>{key === "manager" ? "全省机构" : key === "branch" ? "本机构及下辖" : "授权机构"}</td>
                  <td><StatusBadge>允许</StatusBadge></td>
                  <td><button className={`switch ${matrix[`${key}_export`] ? "on" : ""}`} onClick={() => toggle(`${key}_export`)} aria-label={`${label}明细导出权限`}><i /></button></td>
                  <td><button className={`switch ${matrix[`${key}_customer`] ? "on" : ""}`} onClick={() => toggle(`${key}_customer`)} aria-label={`${label}客户敏感字段权限`}><i /></button></td>
                  <td>{key === "marketing" || key === "risk" ? "增强审计" : "标准审计"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="policy-grid">
        <article><span>行级权限</span><strong>按机构编码自动注入查询条件</strong><p>确保分支机构只能查看授权范围内的数据。</p></article>
        <article><span>动态脱敏</span><strong>按岗位展示不同敏感字段</strong><p>手机号、证件号、姓名等字段按策略实时处理。</p></article>
        <article><span>导出管控</span><strong>高风险明细触发审批与水印</strong><p>导出、下载与分享动作全部进入审计链路。</p></article>
      </div>
    </div>
  );
}

function EvaluationAdmin({ running, done, runEvaluation }: { running: boolean; done: boolean; runEvaluation: () => void }) {
  const testRows = [
    ["经营分析标准集", "486", "96.1%", "93.4%", "2.1秒", "通过"],
    ["风险管控复杂查询集", "328", "94.8%", "91.2%", "2.7秒", "通过"],
    ["客户营销权限集", "274", "95.3%", "90.7%", "2.4秒", "通过"],
    ["跨机构口径一致性集", "160", "97.5%", "95.8%", "2.8秒", "通过"],
  ];
  return (
    <div className="page">
      <PageHeader eyebrow="管理控制台 / 模型运营" title="评测中心" description="用标准问题、预期SQL和预期结果持续验证问数质量。" action={<button className="primary-button" disabled={running} onClick={runEvaluation}>{running ? "评测运行中…" : "▶ 运行全量评测"}</button>} />
      <div className="evaluation-hero">
        <div className="score-ring"><strong>{done ? "94.9" : "94.7"}</strong><span>综合得分</span></div>
        <div className="evaluation-copy"><StatusBadge>达到上线标准</StatusBadge><h2>{done ? "最新回归测试已完成" : "当前版本 v0.9.3"}</h2><p>覆盖经营分析、风险管控、客户营销及跨机构口径一致性场景。</p></div>
        <div className="evaluation-metrics"><div><span>意图识别</span><strong>{done ? "95.2%" : "94.7%"}</strong><small>目标 ≥94%</small></div><div><span>SQL成功率</span><strong>{done ? "92.1%" : "91.8%"}</strong><small>目标 ≥90%</small></div><div><span>平均响应</span><strong>2.4秒</strong><small>目标 ≤3秒</small></div><div><span>口径一致率</span><strong>95.8%</strong><small>目标 ≥95%</small></div></div>
      </div>
      {running && <div className="evaluation-progress"><span style={{ width: "74%" }} /><p>正在执行标准用例与权限回归测试… 924 / 1,248</p></div>}
      <section className="panel table-panel">
        <div className="card-heading"><div><h3>评测集表现</h3><p>最近一次：2026-07-29 08:00</p></div><button className="text-button">查看失败用例 →</button></div>
        <div className="table-wrap"><table><thead><tr><th>评测集</th><th>用例数</th><th>意图准确率</th><th>SQL成功率</th><th>平均响应</th><th>结果</th></tr></thead><tbody>{testRows.map((row) => <tr key={row[0]}>{row.slice(0,5).map((value,index) => <td className={index === 0 ? "question-cell" : ""} key={value}>{value}</td>)}<td><StatusBadge>{row[5]}</StatusBadge></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}

function AuditAdmin({ exportCsv }: { exportCsv: () => void }) {
  const logs = [
    ["09:42:18", "周主管", "智能问数", "查询普惠小微贷款余额", "全省机构", "成功", "低"],
    ["09:39:04", "李经理", "明细导出", "导出高潜客户清单", "南京分行", "审批中", "高"],
    ["09:31:52", "系统任务", "策略同步", "岗位权限策略 v18", "全行", "成功", "低"],
    ["09:18:27", "王专员", "风险查询", "查询新增逾期客户明细", "盐城分行", "成功", "中"],
    ["08:56:11", "赵经理", "智能问数", "查询他行客户身份证号", "无权限", "已拦截", "高"],
  ];
  return (
    <div className="page">
      <PageHeader eyebrow="管理控制台 / 全链路留痕" title="审计监控" description="监控查询、导出、权限变更和异常访问，满足银行业合规要求。" action={<button className="secondary-button" onClick={exportCsv}>⇩ 导出审计报告</button>} />
      <div className="stat-grid">
        <div className="stat-card"><span>今日查询</span><strong>12,846</strong><em>较昨日 +8.2%</em></div>
        <div className="stat-card"><span>权限拦截</span><strong>36</strong><em>均已处置</em></div>
        <div className="stat-card"><span>敏感导出</span><strong>14</strong><em>5项审批中</em></div>
        <div className="stat-card warning"><span>异常告警</span><strong>3</strong><em>1项待核查</em></div>
      </div>
      <div className="toolbar"><label className="search-box">⌕<input placeholder="搜索用户、操作或资源" /></label><select><option>全部风险等级</option><option>高风险</option><option>中风险</option><option>低风险</option></select><select><option>今天</option><option>近7天</option><option>近30天</option></select></div>
      <section className="panel table-panel">
        <div className="table-wrap"><table><thead><tr><th>时间</th><th>操作人</th><th>操作类型</th><th>事件详情</th><th>数据范围</th><th>结果</th><th>风险</th></tr></thead><tbody>{logs.map((row) => <tr key={row[0]}>{row.map((value,index) => <td className={index === 3 ? "question-cell" : index === 0 ? "mono-cell" : ""} key={`${value}-${index}`}>{index === 5 ? <StatusBadge tone={value === "成功" ? "green" : value === "审批中" ? "amber" : "red"}>{value}</StatusBadge> : index === 6 ? <StatusBadge tone={value === "高" ? "red" : value === "中" ? "amber" : "gray"}>{value}</StatusBadge> : value}</td>)}</tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
