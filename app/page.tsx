"use client";

import { useMemo, useState } from "react";

type Surface = "workspace" | "admin" | "personal";
type UserKey = "super-admin" | "branch-manager" | "risk-officer" | "customer-manager";
type AdminView =
  | "admin-home"
  | "admin-connections"
  | "admin-semantic"
  | "admin-metrics"
  | "admin-terms"
  | "admin-sql"
  | "admin-models"
  | "admin-prompts"
  | "admin-orgs"
  | "admin-permissions"
  | "admin-approvals"
  | "admin-masking"
  | "admin-audit"
  | "admin-evaluation"
  | "admin-feedback";
type PersonalView = "model-settings" | "my-permissions";
type RequestStatus = "待审批" | "已通过" | "已拒绝";

type DemoUser = {
  key: UserKey;
  name: string;
  initials: string;
  role: string;
  department: string;
  scope: string;
  canManage: boolean;
  permissionLevel: string;
};

type PermissionRequest = {
  id: string;
  applicant: string;
  department: string;
  role: string;
  permission: string;
  scope: string;
  reason: string;
  submittedAt: string;
  status: RequestStatus;
};

const USERS: Record<UserKey, DemoUser> = {
  "super-admin": {
    key: "super-admin",
    name: "周主管",
    initials: "周",
    role: "数据治理管理员",
    department: "数据资产部",
    scope: "全省机构",
    canManage: true,
    permissionLevel: "L4 · 全局管理",
  },
  "branch-manager": {
    key: "branch-manager",
    name: "李经理",
    initials: "李",
    role: "分支行负责人",
    department: "南京农商行",
    scope: "本机构及下辖网点",
    canManage: false,
    permissionLevel: "L3 · 机构管理",
  },
  "risk-officer": {
    key: "risk-officer",
    name: "王专员",
    initials: "王",
    role: "风险专员",
    department: "风险管理部",
    scope: "授权风险数据集",
    canManage: false,
    permissionLevel: "L2 · 专业查询",
  },
  "customer-manager": {
    key: "customer-manager",
    name: "赵经理",
    initials: "赵",
    role: "客户经理",
    department: "零售金融部",
    scope: "本人及所属机构客户",
    canManage: false,
    permissionLevel: "L1 · 业务查询",
  },
};

const historyGroups = [
  {
    label: "今天",
    items: [
      "今年各机构普惠小微贷款增速如何？",
      "存款规模按机构维度如何变化？",
      "各机构不良贷款率情况",
    ],
  },
  {
    label: "昨天",
    items: ["贷款投放结构分析", "利息收入同比增长情况"],
  },
  {
    label: "近 7 天",
    items: ["客户活跃度趋势分析", "各机构存贷比情况"],
  },
];

const initialRequests: PermissionRequest[] = [
  {
    id: "PA-2026-018",
    applicant: "李经理",
    department: "南京农商行",
    role: "分支行负责人",
    permission: "风险明细查询",
    scope: "南京农商行及下辖网点",
    reason: "季度资产质量复盘需要查看风险迁徙明细。",
    submittedAt: "今天 09:26",
    status: "待审批",
  },
  {
    id: "PA-2026-017",
    applicant: "赵经理",
    department: "零售金融部",
    role: "客户经理",
    permission: "客户明细导出",
    scope: "本人管户客户",
    reason: "用于高净值客户流失预警名单核验。",
    submittedAt: "昨天 16:42",
    status: "待审批",
  },
  {
    id: "PA-2026-016",
    applicant: "王专员",
    department: "风险管理部",
    role: "风险专员",
    permission: "跨机构风险指标查询",
    scope: "苏南片区",
    reason: "区域风险监测专项分析。",
    submittedAt: "7月28日 14:10",
    status: "已通过",
  },
];

const adminGroups: { label: string; items: { id: AdminView; label: string; icon: string }[] }[] = [
  {
    label: "数据底座",
    items: [
      { id: "admin-connections", label: "数据连接", icon: "◉" },
      { id: "admin-semantic", label: "语义模型", icon: "◇" },
    ],
  },
  {
    label: "知识治理",
    items: [
      { id: "admin-metrics", label: "指标管理", icon: "▥" },
      { id: "admin-terms", label: "业务术语", icon: "▣" },
      { id: "admin-sql", label: "SQL 示例", icon: "SQL" },
    ],
  },
  {
    label: "AI 配置",
    items: [
      { id: "admin-models", label: "模型管理", icon: "✣" },
      { id: "admin-prompts", label: "提示词编排", icon: "✦" },
    ],
  },
  {
    label: "安全管理",
    items: [
      { id: "admin-orgs", label: "组织与角色", icon: "♧" },
      { id: "admin-permissions", label: "数据权限", icon: "♙" },
      { id: "admin-approvals", label: "权限审批", icon: "✓" },
      { id: "admin-masking", label: "脱敏策略", icon: "◈" },
      { id: "admin-audit", label: "审计日志", icon: "▤" },
    ],
  },
  {
    label: "运营评测",
    items: [
      { id: "admin-evaluation", label: "效果评测", icon: "⌁" },
      { id: "admin-feedback", label: "用户反馈", icon: "◌" },
    ],
  },
];

const dataSources = [
  ["经营分析数据仓库", "Oracle", "经营分析", "连接正常", "2026-07-30 10:30", "128"],
  ["风险管理集市", "PostgreSQL", "风险管理", "连接正常", "2026-07-30 09:15", "86"],
  ["客户营销中台", "MySQL", "客户运营", "连接正常", "2026-07-30 08:40", "96"],
  ["监管报送库", "GaussDB", "监管报送", "待校验", "2026-07-29 18:20", "54"],
  ["运营主题库", "达梦", "运营管理", "连接正常", "2026-07-29 16:05", "72"],
];

const metrics = [
  ["普惠小微贷款余额", "IND0001", "期末客户在本行的普惠小微信用贷款余额（不含贴现）。", "零售金融部", "已发布"],
  ["不良贷款率", "IND0002", "期末不良贷款余额占期末贷款总额的比率。", "风险管理部", "已发布"],
  ["各项存款日均余额", "IND0003", "统计期内各项存款余额的日平均值。", "存款业务部", "审核中"],
  ["净利息收入", "IND0004", "报告期内贷款利息收入减去存款利息支出后的净额。", "财务会计部", "已发布"],
  ["客户数", "IND0005", "期末在本行有信贷余额的客户数量。", "零售金融部", "已发布"],
];

function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "red" | "gray" | "blue";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`switch ${checked ? "on" : ""}`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

export default function Home() {
  const [surface, setSurface] = useState<Surface>("workspace");
  const [activeUserKey, setActiveUserKey] = useState<UserKey>("super-admin");
  const [adminView, setAdminView] = useState<AdminView>("admin-home");
  const [personalView, setPersonalView] = useState<PersonalView>("model-settings");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [resultTab, setResultTab] = useState<"chart" | "data" | "sql">("chart");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requests, setRequests] = useState(initialRequests);
  const [toast, setToast] = useState("");

  const user = USERS[activeUserKey];
  const pendingCount = requests.filter((request) => request.status === "待审批").length;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function selectUser(key: UserKey) {
    setActiveUserKey(key);
    setAccountMenuOpen(false);
    setSurface("workspace");
    setSubmittedQuery("");
    setQuery("");
    notify(`已切换为 ${USERS[key].name} · ${USERS[key].role}`);
  }

  function openSettings() {
    if (user.canManage) {
      setAdminView("admin-home");
      setSurface("admin");
    } else {
      setPersonalView("model-settings");
      setSurface("personal");
    }
  }

  function runQuery(text = query) {
    const value = text.trim();
    if (!value) {
      notify("请先输入一个业务问题");
      return;
    }
    setQuery(value);
    setIsRunning(true);
    window.setTimeout(() => {
      setSubmittedQuery(value);
      setIsRunning(false);
      setResultTab("chart");
      notify("查询完成，结果已按当前账号权限过滤");
    }, 760);
  }

  function newQuery() {
    setSubmittedQuery("");
    setQuery("");
    setSurface("workspace");
  }

  function updateRequest(id: string, status: RequestStatus) {
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
    notify(status === "已通过" ? "权限申请已通过并进入策略发布队列" : "权限申请已拒绝");
  }

  function submitRequest(permission: string, scope: string, reason: string) {
    const request: PermissionRequest = {
      id: `PA-2026-${String(requests.length + 19).padStart(3, "0")}`,
      applicant: user.name,
      department: user.department,
      role: user.role,
      permission,
      scope,
      reason,
      submittedAt: "刚刚",
      status: "待审批",
    };
    setRequests((current) => [request, ...current]);
    setRequestModalOpen(false);
    notify("权限申请已提交，管理员审批后生效");
  }

  return (
    <>
      {surface === "workspace" && (
        <Workspace
          user={user}
          query={query}
          setQuery={setQuery}
          submittedQuery={submittedQuery}
          isRunning={isRunning}
          runQuery={runQuery}
          newQuery={newQuery}
          openSettings={openSettings}
          resultTab={resultTab}
          setResultTab={setResultTab}
          notify={notify}
          accountMenuOpen={accountMenuOpen}
          setAccountMenuOpen={setAccountMenuOpen}
          selectUser={selectUser}
        />
      )}

      {surface === "admin" && (
        <AdminPlatform
          user={user}
          view={adminView}
          setView={setAdminView}
          pendingCount={pendingCount}
          requests={requests}
          updateRequest={updateRequest}
          back={() => setSurface("workspace")}
          notify={notify}
        />
      )}

      {surface === "personal" && (
        <PersonalSettings
          user={user}
          view={personalView}
          setView={setPersonalView}
          requests={requests.filter((request) => request.applicant === user.name)}
          back={() => setSurface("workspace")}
          openRequest={() => setRequestModalOpen(true)}
          notify={notify}
        />
      )}

      {requestModalOpen && (
        <PermissionRequestModal
          user={user}
          close={() => setRequestModalOpen(false)}
          submit={submitRequest}
        />
      )}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </>
  );
}

function Workspace({
  user,
  query,
  setQuery,
  submittedQuery,
  isRunning,
  runQuery,
  newQuery,
  openSettings,
  resultTab,
  setResultTab,
  notify,
  accountMenuOpen,
  setAccountMenuOpen,
  selectUser,
}: {
  user: DemoUser;
  query: string;
  setQuery: (value: string) => void;
  submittedQuery: string;
  isRunning: boolean;
  runQuery: (value?: string) => void;
  newQuery: () => void;
  openSettings: () => void;
  resultTab: "chart" | "data" | "sql";
  setResultTab: (tab: "chart" | "data" | "sql") => void;
  notify: (message: string) => void;
  accountMenuOpen: boolean;
  setAccountMenuOpen: (open: boolean) => void;
  selectUser: (key: UserKey) => void;
}) {
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <button className="brand-button" onClick={newQuery}>
          <strong>DataNavigator</strong>
          <span>农 商 数 据 领 航 员</span>
        </button>

        <button className="new-query-button" onClick={newQuery}>
          <span>＋</span> 新建问数
        </button>

        <button className="workspace-nav active" onClick={newQuery}>
          <span>▣</span> 智能问数
        </button>

        <div className="history-groups">
          {historyGroups.map((group) => (
            <section key={group.label}>
              <h3>{group.label}<span>⌄</span></h3>
              {group.items.map((item) => (
                <button key={item} onClick={() => runQuery(item)}>
                  <span>▫</span><em>{item}</em>
                </button>
              ))}
            </section>
          ))}
        </div>

        <div className="workspace-sidebar-footer">
          <button onClick={() => notify("收藏夹已打开")}><span>☆</span>收藏</button>
          <button onClick={() => notify("已展示全部历史记录")}><span>◷</span>历史记录</button>
          <button onClick={() => notify("帮助中心将在正式版接入")}><span>?</span>帮助</button>
          <button className="settings-entry" onClick={openSettings}><span>⚙</span>设置</button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-title">智能问数</div>
          <div className="account-area">
            <button
              className="account-button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-expanded={accountMenuOpen}
            >
              <span className="avatar">{user.initials}</span>
              <span className="account-copy">
                <strong>{user.name}</strong>
                <small>{user.role}</small>
              </span>
              <span className="account-chevron">⌄</span>
            </button>
            {accountMenuOpen && (
              <div className="account-menu">
                <p>演示账号切换</p>
                {(Object.values(USERS) as DemoUser[]).map((item) => (
                  <button
                    key={item.key}
                    className={item.key === user.key ? "selected" : ""}
                    onClick={() => selectUser(item.key)}
                  >
                    <span className="mini-avatar">{item.initials}</span>
                    <span><strong>{item.name}</strong><small>{item.role}</small></span>
                    {item.key === user.key && <em>当前</em>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {!submittedQuery ? (
          <section className="ask-home">
            <div className="ask-home-inner">
              <p className="welcome-kicker">{user.department} · {user.scope}</p>
              <h1>您好，想了解什么数据？</h1>
              <QueryComposer
                query={query}
                setQuery={setQuery}
                runQuery={runQuery}
                isRunning={isRunning}
                user={user}
              />
            </div>
          </section>
        ) : (
          <QueryResult
            user={user}
            question={submittedQuery}
            query={query}
            setQuery={setQuery}
            runQuery={runQuery}
            isRunning={isRunning}
            tab={resultTab}
            setTab={setResultTab}
            notify={notify}
          />
        )}
      </main>
      <span className="sr-only">管理控制台 指标治理 权限安全</span>
    </div>
  );
}

function QueryComposer({
  query,
  setQuery,
  runQuery,
  isRunning,
  user,
  compact = false,
}: {
  query: string;
  setQuery: (value: string) => void;
  runQuery: (value?: string) => void;
  isRunning: boolean;
  user: DemoUser;
  compact?: boolean;
}) {
  const scopeOptions = user.canManage
    ? ["全省机构", "南京农商行", "苏州农商行", "风险管理部", "零售金融部"]
    : [user.scope];

  return (
    <div className={`query-composer ${compact ? "compact" : ""}`}>
      <textarea
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") runQuery();
        }}
        placeholder={compact ? "继续追问…" : "输入业务问题，例如：今年各机构普惠小微贷款增速如何？"}
        aria-label="业务问题"
      />
      <div className="composer-footer">
        <button className="attachment-button" aria-label="添加附件">⌕</button>
        <label className="scope-select">
          <span>▤</span>
          <select aria-label="查询数据范围">
            {scopeOptions.map((scope) => <option key={scope}>{scope}</option>)}
          </select>
        </label>
        <button
          className="send-button"
          onClick={() => runQuery()}
          disabled={isRunning}
          aria-label="发送问题"
        >
          {isRunning ? "…" : "➤"}
        </button>
      </div>
    </div>
  );
}

function QueryResult({
  user,
  question,
  query,
  setQuery,
  runQuery,
  isRunning,
  tab,
  setTab,
  notify,
}: {
  user: DemoUser;
  question: string;
  query: string;
  setQuery: (value: string) => void;
  runQuery: (value?: string) => void;
  isRunning: boolean;
  tab: "chart" | "data" | "sql";
  setTab: (tab: "chart" | "data" | "sql") => void;
  notify: (message: string) => void;
}) {
  const rows = [
    ["苏州农商行", "86.42", "28.67%", "18", 100],
    ["南京农商行", "72.18", "22.41%", "16", 84],
    ["无锡农商行", "61.35", "19.38%", "15", 71],
    ["常州农商行", "48.27", "15.02%", "12", 56],
    ["南通农商行", "36.59", "11.28%", "10", 42],
    ["盐城农商行", "24.36", "8.74%", "9", 28],
  ] as const;

  return (
    <section className="result-page">
      <div className="question-bubble"><span>{question}</span><i>{user.initials}</i></div>
      <div className="assistant-summary">
        <span className="bot-avatar">◉</span>
        <div>
          <h2>已完成查询</h2>
          <p>今年各机构普惠小微贷款整体保持较快增长。</p>
          <p>其中，苏州农商行增速最高，其次是南京农商行和无锡农商行。</p>
        </div>
      </div>

      <div className="result-card">
        <div className="result-tabs">
          <button className={tab === "chart" ? "active" : ""} onClick={() => setTab("chart")}>图表</button>
          <button className={tab === "data" ? "active" : ""} onClick={() => setTab("data")}>数据</button>
          <button className={tab === "sql" ? "active" : ""} onClick={() => setTab("sql")}>SQL</button>
        </div>
        <div className="result-body">
          <div className="result-visual">
            {tab === "chart" && (
              <div className="bar-table">
                <div className="bar-header"><span /><span>贷款余额<small>（亿元）</small></span><span>同比增速<small>（%）</small></span><span>机构数量<small>（家）</small></span></div>
                {rows.map((row) => (
                  <div className="bar-row" key={row[0]}>
                    <strong>{row[0]}</strong>
                    <div className="bar-track"><i style={{ width: `${row[4]}%` }} /></div>
                    <span>{row[1]}</span>
                    <span>{row[2]}</span>
                    <span>{row[3]}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "data" && (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>机构</th><th>贷款余额（亿元）</th><th>同比增速</th><th>机构数量</th></tr></thead>
                  <tbody>{rows.map((row) => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody>
                </table>
              </div>
            )}
            {tab === "sql" && (
              <pre className="sql-block">{`SELECT institution_name,\n       SUM(loan_balance) AS loan_balance,\n       yoy_growth_rate,\n       COUNT(DISTINCT branch_id) AS branch_count\nFROM certified_sme_loan_metrics\nWHERE report_date = '2026-06-30'\n  AND institution_id IN (:authorized_scope)\nGROUP BY institution_name, yoy_growth_rate\nORDER BY yoy_growth_rate DESC;`}</pre>
            )}
          </div>
          <aside className="validation-panel">
            {[
              ["指标口径", "已验证"],
              ["数据来源", "已验证"],
              ["权限范围", user.scope],
            ].map((item) => (
              <button key={item[0]} onClick={() => notify(`${item[0]}详情已展开`)}>
                <span>✓</span><strong>{item[0]}</strong><small>{item[1]}</small><em>›</em>
              </button>
            ))}
          </aside>
        </div>
      </div>

      <div className="result-actions">
        <button onClick={() => notify("已切换为追问模式")}>▣ 追问</button>
        <button onClick={() => notify("已加入经营分析看板")}>▤ 加入看板</button>
        <button onClick={() => notify("结果已导出，操作已写入审计日志")}>⇩ 导出</button>
        <button onClick={() => notify("分享链接已复制")}>⌯ 分享</button>
      </div>

      <QueryComposer
        query={query}
        setQuery={setQuery}
        runQuery={runQuery}
        isRunning={isRunning}
        user={user}
        compact
      />
    </section>
  );
}

function AdminPlatform({
  user,
  view,
  setView,
  pendingCount,
  requests,
  updateRequest,
  back,
  notify,
}: {
  user: DemoUser;
  view: AdminView;
  setView: (view: AdminView) => void;
  pendingCount: number;
  requests: PermissionRequest[];
  updateRequest: (id: string, status: RequestStatus) => void;
  back: () => void;
  notify: (message: string) => void;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => setView("admin-home")}>
          <strong>DataNavigator</strong><span>管理后台</span>
        </button>
        <div className="admin-nav">
          {adminGroups.map((group) => (
            <section key={group.label}>
              <h3>{group.label}</h3>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={view === item.id ? "active" : ""}
                  onClick={() => setView(item.id)}
                >
                  <span>{item.icon}</span>{item.label}
                  {item.id === "admin-approvals" && pendingCount > 0 && <em>{pendingCount}</em>}
                </button>
              ))}
            </section>
          ))}
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="back-button" onClick={back}>↩ 返回智能问数</button>
          <div className="admin-user"><span className="avatar">{user.initials}</span><strong>{user.name}</strong><small>最高级数据权限</small></div>
        </header>
        {view === "admin-home" && <AdminHome setView={setView} pendingCount={pendingCount} />}
        {view === "admin-connections" && <ConnectionsPage notify={notify} />}
        {view === "admin-metrics" && <MetricsPage notify={notify} />}
        {view === "admin-models" && <ModelsPage notify={notify} />}
        {view === "admin-permissions" && <PermissionsPage notify={notify} />}
        {view === "admin-approvals" && <ApprovalsPage requests={requests} updateRequest={updateRequest} />}
        {view === "admin-evaluation" && <EvaluationPage notify={notify} />}
        {![
          "admin-home",
          "admin-connections",
          "admin-metrics",
          "admin-models",
          "admin-permissions",
          "admin-approvals",
          "admin-evaluation",
        ].includes(view) && (
          <GenericAdminPage
            view={view as keyof typeof genericContent}
            notify={notify}
          />
        )}
      </main>
    </div>
  );
}

function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>{eyebrow && <p>{eyebrow}</p>}<h1>{title}</h1><span>{description}</span></div>
      {action}
    </header>
  );
}

function AdminHome({ setView, pendingCount }: { setView: (view: AdminView) => void; pendingCount: number }) {
  const cards: { title: string; description: string; status: string; icon: string; view: AdminView }[] = [
    { title: "数据连接", description: "管理数据源连接，维护数据同步与可用性。", status: "已接入 12 个数据源", icon: "◉", view: "admin-connections" },
    { title: "语义与指标", description: "管理业务术语、指标定义与认证，构建统一语义体系。", status: "326 项认证指标", icon: "▥", view: "admin-metrics" },
    { title: "模型与提示词", description: "管理 AI 模型接入、问数流程与提示词模板。", status: "已接入 6 个模型", icon: "✣", view: "admin-models" },
    { title: "权限与安全", description: "管理组织、岗位、数据权限及安全策略。", status: `待审批 ${pendingCount} 项`, icon: "♙", view: "admin-permissions" },
    { title: "评测与运营", description: "评估问数效果，收集用户反馈，驱动持续优化。", status: "本月评测任务 18 个", icon: "⌁", view: "admin-evaluation" },
  ];
  return (
    <div className="admin-page">
      <AdminPageHeader title="管理后台" description="配置问数能力、数据资产与安全策略" />
      <div className="admin-home-grid">
        {cards.map((card) => (
          <article key={card.title}>
            <span className="admin-card-icon">{card.icon}</span>
            <div><h2>{card.title}</h2><p>{card.description}</p><small>✓ {card.status}</small><button onClick={() => setView(card.view)}>进入设置</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ConnectionsPage({ notify }: { notify: (message: string) => void }) {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="数据连接"
        description="管理问数可访问的数据源与数据模型"
        action={<button className="outline-action" onClick={() => notify("已创建新的数据源草稿")}>＋ 新建数据源</button>}
      />
      <div className="admin-toolbar">
        <label>⌕<input placeholder="搜索数据源名称" /></label>
        <select><option>全部类型</option><option>Oracle</option><option>PostgreSQL</option></select>
        <select><option>连接状态</option><option>连接正常</option><option>待校验</option></select>
      </div>
      <div className="split-admin-layout">
        <section className="admin-panel data-source-table">
          <div className="table-wrap">
            <table>
              <thead><tr><th>数据源名称</th><th>类型</th><th>业务域</th><th>同步状态</th><th>最近更新</th><th>可用表数</th><th>操作</th></tr></thead>
              <tbody>
                {dataSources.map((source) => (
                  <tr key={source[0]}>
                    <td><strong>{source[0]}</strong><small>{source[1]}</small></td>
                    <td>{source[1]}</td><td>{source[2]}</td>
                    <td><Badge tone={source[3] === "连接正常" ? "green" : "amber"}>● {source[3]}</Badge></td>
                    <td>{source[4]}</td><td>{source[5]}</td><td><button className="dots">•••</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="admin-detail-panel">
          <h2>模型范围</h2><p>经营分析数据仓库 / Oracle</p>
          {["表结构同步", "字段说明", "关系识别"].map((item) => <div className="setting-line" key={item}><span>{item}</span><Switch checked onChange={() => notify(`${item}设置已更新`)} label={item} /></div>)}
          <div className="relation-map"><strong>dim_customer</strong><span>客户维度表</span><i /><div><b>fact_loan</b><b>dim_product</b></div></div>
          <button onClick={() => notify("连接测试通过")}>▷ 测试连接</button>
          <button onClick={() => notify("元数据同步任务已启动")}>⟳ 同步元数据</button>
          <button onClick={() => notify("模型配置已打开")}>⚙ 配置模型</button>
        </aside>
      </div>
    </div>
  );
}

function MetricsPage({ notify }: { notify: (message: string) => void }) {
  const [selected, setSelected] = useState(metrics[0]);
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="指标管理"
        description="统一指标口径，让自然语言与业务定义保持一致"
        action={<button className="outline-action" onClick={() => notify("指标草稿已创建")}>＋ 新建指标</button>}
      />
      <div className="subtabs"><button className="active">指标库</button><button>业务术语</button><button>SQL 示例</button></div>
      <div className="admin-toolbar"><label>⌕<input placeholder="搜索指标名称" /></label><select><option>业务域</option></select><select><option>状态</option></select></div>
      <div className="split-admin-layout metrics-layout">
        <section className="admin-panel">
          <div className="table-wrap">
            <table>
              <thead><tr><th>指标名称</th><th>指标编码</th><th>业务定义</th><th>责任部门</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric[1]} className={selected[1] === metric[1] ? "selected-row" : ""} onClick={() => setSelected(metric)}>
                    <td><strong>● &nbsp;{metric[0]}</strong></td><td>{metric[1]}</td><td>{metric[2]}</td><td>{metric[3]}</td>
                    <td><Badge tone={metric[4] === "已发布" ? "green" : "amber"}>{metric[4]}</Badge></td><td><button className="dots">•••</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="admin-detail-panel metric-detail">
          <h2>{selected[0]}</h2>
          <h3>标准定义</h3><p>{selected[2]}</p>
          <h3>同义词</h3><div className="tag-row"><Badge>普惠小微</Badge><Badge>小微贷款</Badge><Badge>普惠贷</Badge></div>
          <h3>可用维度</h3><ul><li>时间：年、季、月、日</li><li>机构：总行、分行、支行</li><li>客户类型：小微企业、个体工商户</li><li>币种：人民币、外币</li></ul>
          <h3>数据来源</h3><p>经营分析数据仓库 / fact_loan_balance</p>
          <div className="detail-actions"><button onClick={() => notify("指标编辑器已打开")}>编辑</button><button className="primary" onClick={() => notify("指标已发布")}>发布</button></div>
        </aside>
      </div>
    </div>
  );
}

function ModelsPage({ notify }: { notify: (message: string) => void }) {
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [chartSuggest, setChartSuggest] = useState(true);
  const [businessExplain, setBusinessExplain] = useState(true);
  return (
    <div className="admin-page">
      <AdminPageHeader title="模型与问数流程" description="配置大模型、生成策略与结果解释能力" />
      <div className="subtabs"><button className="active">模型服务</button><button>问数流程</button><button>提示词模板</button></div>
      <div className="models-layout">
        <section>
          <div className="model-cards">
            {[
              ["意图理解模型", "DN–Intent–1.0", "✣"],
              ["SQL 生成模型", "DN–SQL–1.0", "SQL"],
              ["结果解读模型", "DN–Explain–1.0", "◌"],
            ].map((model) => (
              <article key={model[0]}><span>{model[2]}</span><h2>{model[0]}</h2><dl><div><dt>提供商</dt><dd>DataNavigator</dd></div><div><dt>模型</dt><dd>{model[1]}</dd></div></dl><p>● 运行中</p><footer><button onClick={() => notify(`${model[0]}配置已打开`)}>编辑配置</button><button onClick={() => notify(`${model[0]}测试通过`)}>测试</button></footer></article>
            ))}
          </div>
          <div className="flow-strip">
            {["问题理解", "指标匹配", "表字段召回", "SQL 生成", "安全校验", "结果解读"].map((step, index) => (
              <div key={step}><strong>{index + 1}</strong><span>{step}</span>{index < 5 && <i>→</i>}</div>
            ))}
          </div>
        </section>
        <aside className="admin-detail-panel model-policy">
          <h2>默认策略</h2>
          <label>模型<select><option>自动选择（推荐）</option></select></label>
          <label>温度<select><option>0.3（推荐）</option></select></label>
          <label>最大行数<select><option>1000</option></select></label>
          <div className="setting-line"><span>自动纠错</span><Switch checked={autoCorrect} onChange={() => setAutoCorrect(!autoCorrect)} label="自动纠错" /></div>
          <div className="setting-line"><span>图表推荐</span><Switch checked={chartSuggest} onChange={() => setChartSuggest(!chartSuggest)} label="图表推荐" /></div>
          <div className="setting-line"><span>业务化解释</span><Switch checked={businessExplain} onChange={() => setBusinessExplain(!businessExplain)} label="业务化解释" /></div>
          <button className="primary" onClick={() => notify("模型策略已保存")}>保存配置</button>
          <button onClick={() => notify("模型运行测试通过")}>▷ 运行测试</button>
        </aside>
      </div>
    </div>
  );
}

function PermissionsPage({ notify }: { notify: (message: string) => void }) {
  const [department, setDepartment] = useState("南京农商行");
  const [role, setRole] = useState("分支行负责人");
  const [scope, setScope] = useState("本机构及下辖网点");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    metric_view: true,
    metric_export: true,
    metric_share: true,
    risk_view: true,
    risk_export: false,
    risk_share: false,
    customer_view: true,
    customer_export: true,
    customer_share: false,
    sql_view: true,
    sql_export: false,
    sql_share: false,
  });
  const rows = [
    ["经营指标查询", "metric"],
    ["风险明细查询", "risk"],
    ["客户明细查询", "customer"],
    ["SQL 查看", "sql"],
  ];
  function toggle(key: string) {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  }
  return (
    <div className="admin-page">
      <AdminPageHeader title="权限与数据安全" description="仅最高级数据管理员可跨部门配置岗位权限和可查询数据范围" />
      <div className="subtabs"><button className="active">角色权限</button><button>数据范围</button><button>脱敏策略</button><button>审计日志</button></div>
      <div className="permission-scope-bar">
        <label>部门<select value={department} onChange={(event) => setDepartment(event.target.value)}><option>南京农商行</option><option>苏州农商行</option><option>风险管理部</option><option>零售金融部</option><option>计划财务部</option></select></label>
        <label>岗位<select value={role} onChange={(event) => setRole(event.target.value)}><option>分支行负责人</option><option>风险专员</option><option>客户经理</option><option>数据管理员</option></select></label>
        <Badge tone="blue">最高级权限可见</Badge>
      </div>
      <div className="permission-layout">
        <aside className="role-list admin-panel">
          <h2>岗位角色</h2>
          {["总行管理层", "分支行负责人", "风险专员", "客户经理", "数据管理员"].map((item) => (
            <button className={item === role ? "active" : ""} key={item} onClick={() => setRole(item)}>♙ {item}</button>
          ))}
        </aside>
        <section className="admin-panel permission-matrix">
          <h2>{department} · {role} 权限矩阵</h2>
          <div className="matrix-head"><span>能力</span><span>查看</span><span>导出</span><span>分享</span></div>
          {rows.map(([label, key]) => (
            <div className="matrix-row" key={key}>
              <strong>{label}</strong>
              {["view", "export", "share"].map((action) => (
                <Switch key={action} checked={permissions[`${key}_${action}`]} onChange={() => toggle(`${key}_${action}`)} label={`${label}${action}`} />
              ))}
            </div>
          ))}
        </section>
        <aside className="admin-panel scope-editor">
          <h2>可查询数据范围</h2>
          <label>机构范围<select value={scope} onChange={(event) => setScope(event.target.value)}><option>本机构及下辖网点</option><option>本机构</option><option>指定机构</option><option>全省机构</option></select></label>
          <label>业务域<select><option>经营分析、风险管理</option><option>仅经营分析</option><option>全部业务域</option></select></label>
          <label>时间范围<select><option>近 3 年</option><option>本年度</option><option>不限</option></select></label>
          <div className="scope-rule"><strong>行级条件</strong><p>所属机构 = 当前岗位所属机构及下辖机构</p></div>
          <div className="scope-rule"><strong>字段脱敏</strong><p>客户姓名：张*<br />身份证号：3201********1234</p></div>
        </aside>
      </div>
      <div className="permission-footer"><p>◈ 所有权限变更自动记录审计日志，策略发布后即时生效。</p><button onClick={() => notify("已进入岗位权限模拟测试")}>模拟用户测试</button><button className="primary" onClick={() => notify(`${department} · ${role} 权限策略已保存`)}>保存策略</button></div>
    </div>
  );
}

function ApprovalsPage({
  requests,
  updateRequest,
}: {
  requests: PermissionRequest[];
  updateRequest: (id: string, status: RequestStatus) => void;
}) {
  const [status, setStatus] = useState("全部");
  const filtered = requests.filter((request) => status === "全部" || request.status === status);
  return (
    <div className="admin-page">
      <AdminPageHeader title="权限审批" description="审核岗位人员发起的数据访问与导出权限申请" />
      <div className="approval-summary">
        <article><span>待审批</span><strong>{requests.filter((item) => item.status === "待审批").length}</strong></article>
        <article><span>本月已通过</span><strong>23</strong></article>
        <article><span>平均处理时长</span><strong>1.6 小时</strong></article>
      </div>
      <div className="admin-toolbar"><label>⌕<input placeholder="搜索申请人或申请编号" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option><option>待审批</option><option>已通过</option><option>已拒绝</option></select></div>
      <section className="admin-panel approvals-table">
        <div className="table-wrap">
          <table>
            <thead><tr><th>申请编号</th><th>申请人</th><th>部门 / 岗位</th><th>申请权限</th><th>数据范围</th><th>申请理由</th><th>提交时间</th><th>状态与操作</th></tr></thead>
            <tbody>
              {filtered.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td><td><strong>{request.applicant}</strong></td><td>{request.department}<small>{request.role}</small></td>
                  <td>{request.permission}</td><td>{request.scope}</td><td>{request.reason}</td><td>{request.submittedAt}</td>
                  <td>
                    {request.status === "待审批" ? (
                      <div className="approval-actions"><button onClick={() => updateRequest(request.id, "已拒绝")}>拒绝</button><button className="primary" onClick={() => updateRequest(request.id, "已通过")}>通过</button></div>
                    ) : <Badge tone={request.status === "已通过" ? "green" : "red"}>{request.status}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EvaluationPage({ notify }: { notify: (message: string) => void }) {
  const evaluationRows = [
    ["经营分析标准集", "120", "96.2%", "93.3%", "2026-07-30 10:30", "已完成"],
    ["风险复杂查询集", "98", "93.5%", "90.2%", "2026-07-30 09:15", "已完成"],
    ["客户营销问数集", "110", "94.1%", "91.8%", "2026-07-29 16:45", "已完成"],
    ["跨机构口径一致性", "86", "98.6%", "94.7%", "2026-07-29 11:20", "已完成"],
  ];
  return (
    <div className="admin-page">
      <AdminPageHeader title="问数效果评测" description="用标准问题持续验证意图、SQL 与结果准确性" action={<div className="header-actions"><button className="outline-action">＋ 新建评测集</button><button className="primary-action" onClick={() => notify("全量评测任务已启动")}>运行评测</button></div>} />
      <div className="evaluation-stats">
        {[["意图识别准确率", "95.6%"], ["SQL 生成成功率", "92.4%"], ["平均响应", "2.3秒"], ["口径一致率", "97.1%"]].map((item) => <article key={item[0]}><span>◎</span><div><p>{item[0]}</p><strong>{item[1]}</strong></div></article>)}
      </div>
      <div className="evaluation-layout">
        <section className="admin-panel"><h2>评测集</h2><div className="table-wrap"><table><thead><tr><th>评测集名称</th><th>用例数</th><th>意图准确率</th><th>SQL 成功率</th><th>最近运行</th><th>状态</th></tr></thead><tbody>{evaluationRows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 5 ? <Badge>{cell}</Badge> : cell}</td>)}</tr>)}</tbody></table></div></section>
        <aside className="admin-panel failed-cases"><h2>失败用例</h2>{[["上月各分支机构贷款余额前十名？", "意图偏差"], ["不良贷款率按行业维度如何分布？", "字段匹配错误"], ["与去年同期相比，存款日均增量是多少？", "口径冲突"]].map((item, index) => <article key={item[0]}><span>{index + 1}</span><div><strong>{item[0]}</strong><Badge tone={index === 2 ? "blue" : "amber"}>{item[1]}</Badge></div><button onClick={() => notify("失败用例详情已打开")}>查看详情</button></article>)}</aside>
      </div>
    </div>
  );
}

const genericContent: Record<Exclude<AdminView, "admin-home" | "admin-connections" | "admin-metrics" | "admin-models" | "admin-permissions" | "admin-approvals" | "admin-evaluation">, [string, string, string[]]> = {
  "admin-semantic": ["语义模型", "维护数据表关系、业务实体和字段语义映射", ["已认证主题模型 18 个", "自动关系识别 92.6%", "待审核字段说明 26 项"]],
  "admin-terms": ["业务术语", "统一行内简称、同义词与业务表达", ["标准术语 1,842 个", "同义表达 5,628 个", "待治理表达 26 个"]],
  "admin-sql": ["SQL 示例", "沉淀高质量问法与标准 SQL 对，增强生成准确率", ["标准示例 2,460 条", "本月新增 86 条", "采用率 78.4%"]],
  "admin-prompts": ["提示词编排", "分场景配置意图识别、SQL 生成和结果解读模板", ["生产模板 24 个", "灰度模板 6 个", "平均版本 3.8"]],
  "admin-orgs": ["组织与角色", "管理部门、机构层级、岗位角色与人员映射", ["机构节点 486 个", "岗位角色 32 个", "在岗人员 8,642 人"]],
  "admin-masking": ["脱敏策略", "按岗位与使用场景配置敏感字段展示规则", ["敏感字段 28 个", "生效策略 42 条", "覆盖率 100%"]],
  "admin-audit": ["审计日志", "记录查询、导出、授权与异常访问行为", ["今日查询 12,846 次", "权限拦截 36 次", "异常告警 3 项"]],
  "admin-feedback": ["用户反馈", "汇总业务人员评价与改进建议", ["本月反馈 160 条", "有帮助 132 条", "待改进 28 条"]],
};

function GenericAdminPage({ view, notify }: { view: keyof typeof genericContent; notify: (message: string) => void }) {
  const [title, description, stats] = genericContent[view];
  return (
    <div className="admin-page">
      <AdminPageHeader title={title} description={description} action={<button className="outline-action" onClick={() => notify(`${title}新建面板已打开`)}>＋ 新建</button>} />
      <div className="generic-stats">{stats.map((stat) => <article key={stat}><span>✓</span><strong>{stat}</strong><p>数据状态正常，最近更新于今天 09:30</p></article>)}</div>
      <section className="admin-panel generic-workbench">
        <header><div><h2>{title}工作台</h2><p>当前配置均已纳入版本控制和审计留痕。</p></div><button className="primary-action" onClick={() => notify(`${title}配置已保存`)}>保存配置</button></header>
        <div className="generic-list">
          {["生产配置", "灰度验证", "待审核变更", "历史版本"].map((item, index) => <button key={item}><span>{index + 1}</span><strong>{item}</strong><small>{index === 0 ? "运行中" : index === 1 ? "验证中" : index === 2 ? "3 项" : "查看记录"}</small><em>›</em></button>)}
        </div>
      </section>
    </div>
  );
}

function PersonalSettings({
  user,
  view,
  setView,
  requests,
  back,
  openRequest,
  notify,
}: {
  user: DemoUser;
  view: PersonalView;
  setView: (view: PersonalView) => void;
  requests: PermissionRequest[];
  back: () => void;
  openRequest: () => void;
  notify: (message: string) => void;
}) {
  const [chartSuggest, setChartSuggest] = useState(true);
  const [explainMode, setExplainMode] = useState(true);
  return (
    <div className="personal-shell">
      <aside className="personal-sidebar">
        <button className="admin-brand" onClick={back}><strong>DataNavigator</strong><span>个人设置</span></button>
        <button className={view === "model-settings" ? "active" : ""} onClick={() => setView("model-settings")}>✣ 模型设置</button>
        <button className={view === "my-permissions" ? "active" : ""} onClick={() => setView("my-permissions")}>♙ 我的权限</button>
        <button className="personal-back" onClick={back}>↩ 返回智能问数</button>
      </aside>
      <main className="personal-main">
        <header className="personal-user"><span className="avatar">{user.initials}</span><div><strong>{user.name}</strong><small>{user.department} · {user.role}</small></div></header>
        {view === "model-settings" ? (
          <div className="personal-page">
            <AdminPageHeader title="模型设置" description="调整个人问数偏好，不影响其他用户" />
            <section className="personal-card">
              <label>默认结果展示<select><option>自动推荐</option><option>优先图表</option><option>优先表格</option></select></label>
              <label>回答详细程度<select><option>业务摘要 + 关键数据</option><option>精简摘要</option><option>详细分析</option></select></label>
              <div className="setting-line"><span><strong>图表智能推荐</strong><small>根据数据特征自动选择展示方式</small></span><Switch checked={chartSuggest} onChange={() => setChartSuggest(!chartSuggest)} label="图表智能推荐" /></div>
              <div className="setting-line"><span><strong>业务化解释</strong><small>使用业务语言解释查询结果与变化原因</small></span><Switch checked={explainMode} onChange={() => setExplainMode(!explainMode)} label="业务化解释" /></div>
              <button className="primary-action" onClick={() => notify("个人模型设置已保存")}>保存设置</button>
            </section>
          </div>
        ) : (
          <div className="personal-page">
            <AdminPageHeader title="我的权限" description="查看当前岗位授权与可查询数据范围" action={<button className="primary-action" onClick={openRequest}>申请更多权限</button>} />
            <div className="my-permission-summary">
              <article><span>权限级别</span><strong>{user.permissionLevel}</strong></article>
              <article><span>所属部门</span><strong>{user.department}</strong></article>
              <article><span>数据范围</span><strong>{user.scope}</strong></article>
            </div>
            <section className="personal-card">
              <h2>当前已授权能力</h2>
              <div className="granted-grid">
                {["经营指标查询", "结果导出", "风险指标查询", "图表分享"].map((item, index) => <div key={item}><span>✓</span><strong>{item}</strong><small>{index === 1 && user.key === "customer-manager" ? "需审批" : "已授权"}</small></div>)}
              </div>
            </section>
            <section className="personal-card">
              <h2>我的申请记录</h2>
              {requests.length === 0 ? <p className="empty-state">暂无权限申请记录</p> : requests.map((request) => <div className="request-record" key={request.id}><div><strong>{request.permission}</strong><span>{request.scope} · {request.submittedAt}</span></div><Badge tone={request.status === "待审批" ? "amber" : request.status === "已通过" ? "green" : "red"}>{request.status}</Badge></div>)}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function PermissionRequestModal({
  user,
  close,
  submit,
}: {
  user: DemoUser;
  close: () => void;
  submit: (permission: string, scope: string, reason: string) => void;
}) {
  const [permission, setPermission] = useState("跨机构经营指标查询");
  const [scope, setScope] = useState("指定机构");
  const [reason, setReason] = useState("");
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="申请更多权限">
        <header><div><p>权限申请</p><h2>申请更多数据权限</h2></div><button onClick={close}>×</button></header>
        <div className="applicant-note"><span className="avatar">{user.initials}</span><div><strong>{user.name}</strong><small>{user.department} · {user.role}</small></div></div>
        <label>申请权限<select value={permission} onChange={(event) => setPermission(event.target.value)}><option>跨机构经营指标查询</option><option>风险明细查询</option><option>客户明细导出</option><option>SQL 查看</option><option>结果分享</option></select></label>
        <label>申请数据范围<select value={scope} onChange={(event) => setScope(event.target.value)}><option>指定机构</option><option>本机构及下辖网点</option><option>苏南片区</option><option>全省机构</option></select></label>
        <label>申请理由<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请说明业务场景、使用期限和必要性" /></label>
        <footer><button onClick={close}>取消</button><button className="primary" disabled={!reason.trim()} onClick={() => submit(permission, scope, reason.trim())}>提交申请</button></footer>
      </div>
    </div>
  );
}
