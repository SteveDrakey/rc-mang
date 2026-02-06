import { useEffect, useMemo, useState } from 'react';

const statusStyles = {
  Complete: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  'In Progress': 'bg-sky-500/20 text-sky-200 border-sky-400/40',
  Blocked: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  Pending: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
};

const phaseIcons = {
  Planning: '🧭',
  Procurement: '📦',
  Build: '🧰',
  Install: '🛠️',
  Handover: '✅',
};

const parseCsv = (text) => {
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((item) => item.trim());
  return rows
    .map((row) => {
      const columns = row.split(',').map((item) => item.trim());
      return headers.reduce((acc, header, index) => {
        acc[header] = columns[index] ?? '';
        return acc;
      }, {});
    })
    .filter((row) => row.Site);
};

const groupBy = (items, key) =>
  items.reduce((acc, item) => {
    const value = item[key];
    acc[value] = acc[value] ? [...acc[value], item] : [item];
    return acc;
  }, {});

const averageProgress = (items) => {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + Number(item.Progress || 0), 0);
  return Math.round(total / items.length);
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      })
    : 'TBC';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');

  useEffect(() => {
    fetch('/data/pizza-express-project.csv')
      .then((response) => response.text())
      .then((text) => {
        const parsed = parseCsv(text);
        setTasks(parsed);
        setSelectedSite(parsed[0]?.Site ?? '');
      });
  }, []);

  const groupedSites = useMemo(() => groupBy(tasks, 'Site'), [tasks]);
  const siteNames = Object.keys(groupedSites);

  const siteSummary = siteNames.map((site) => {
    const siteTasks = groupedSites[site];
    const progress = averageProgress(siteTasks);
    const completed = siteTasks.filter((task) => task.Status === 'Complete').length;
    const blocked = siteTasks.filter((task) => task.Status === 'Blocked').length;
    return {
      site,
      progress,
      completed,
      total: siteTasks.length,
      blocked,
      location: siteTasks[0]?.Location ?? 'UK',
    };
  });

  const activeTasks = groupedSites[selectedSite] ?? [];
  const overallProgress = averageProgress(tasks);
  const completedTasks = tasks.filter((task) => task.Status === 'Complete').length;
  const blockedTasks = tasks.filter((task) => task.Status === 'Blocked').length;
  const activeMilestone = tasks.find((task) => task.Highlight === 'Yes');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm text-slate-400">Project Manager</p>
            <h1 className="text-2xl font-semibold text-white">
              Pizza Express IT Rollout Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand-500/20 px-4 py-2 text-sm font-medium text-brand-200">
              Logged in as John Smith
            </div>
            <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
              Customer view
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Sites overview
            </h2>
            <div className="mt-4 space-y-3">
              {siteSummary.map((site) => (
                <button
                  key={site.site}
                  onClick={() => setSelectedSite(site.site)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition hover:border-brand-500/50 hover:bg-slate-900/80 ${
                    selectedSite === site.site
                      ? 'border-brand-500/70 bg-slate-900'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{site.location}</p>
                      <p className="text-base font-semibold text-white">{site.site}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                      {site.progress}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${site.progress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {site.completed}/{site.total} complete
                    </span>
                    <span className="text-rose-300">{site.blocked} blocked</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Project KPI
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Overall progress
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">{overallProgress}%</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Tasks done
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {completedTasks}
                    <span className="text-sm text-slate-400">/{tasks.length}</span>
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Risks
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-rose-300">
                    {blockedTasks}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Active project</p>
                <h2 className="text-2xl font-semibold text-white">
                  Pizza Express | 5 New Sites IT Build
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Scope: network core, access points, POS uplinks, CCTV integration, and Wi-Fi
                  readiness.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Executive milestone
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {activeMilestone?.Task ?? 'Order lead-time confirmation'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Target: {formatDate(activeMilestone?.End)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Budget burn',
                value: '£412k',
                detail: '68% of budget allocated',
              },
              {
                title: 'Customer sentiment',
                value: '4.7/5',
                detail: 'Feedback across 5 sites',
              },
              {
                title: 'Engineering velocity',
                value: '27 tasks/week',
                detail: 'Rolling 3-week average',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.title}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-sm text-slate-400">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Site detail</p>
                <h3 className="text-xl font-semibold text-white">{selectedSite}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Deep dive into network, Wi-Fi, and infrastructure readiness for this location.
                </p>
              </div>
              <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Updated 2 hours ago
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div
                    key={`${task.Site}-${task.Task}`}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {phaseIcons[task.Phase] ?? '📌'} {task.Phase}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold text-white">{task.Task}</h4>
                        <p className="mt-2 text-sm text-slate-400">{task.Notes}</p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          statusStyles[task.Status] ??
                          'border-slate-700 bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        {task.Status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                      <span>Owner: {task.Owner}</span>
                      <span>
                        {formatDate(task.Start)} → {formatDate(task.End)}
                      </span>
                      <span>{task.Progress}% complete</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand-400"
                        style={{ width: `${task.Progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer KPI</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Wi-Fi readiness</span>
                        <span>92%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-emerald-400" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>POS network latency</span>
                        <span>18ms</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-sky-400" style={{ width: '78%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Installer SLA</span>
                        <span>96%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-brand-400" style={{ width: '96%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Site contacts</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div>
                      <p className="font-semibold text-white">Nina Patel</p>
                      <p>Site operations manager</p>
                      <p className="text-slate-400">nina.patel@pizzaexpress.co.uk</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Alex Morgan</p>
                      <p>Network deployment lead</p>
                      <p className="text-slate-400">alex.morgan@rc-mang.co.uk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
