import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'

type IngestionJob = {
  id: string
  source: 'documents' | 'webhook' | 'manual'
  startedAt: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  itemsProcessed: number
  itemsTotal: number
}

const mockJobs: IngestionJob[] = [
  { id: 'j1', source: 'documents', startedAt: '2025-04-02 09:15', status: 'succeeded', itemsProcessed: 120, itemsTotal: 120 },
  { id: 'j2', source: 'manual', startedAt: '2025-04-05 14:30', status: 'failed', itemsProcessed: 42, itemsTotal: 100 },
  { id: 'j3', source: 'documents', startedAt: '2025-04-06 11:00', status: 'running', itemsProcessed: 60, itemsTotal: 200 },
  { id: 'j4', source: 'webhook', startedAt: '2025-04-06 12:10', status: 'queued', itemsProcessed: 0, itemsTotal: 50 },
]

function statusBadge(status: IngestionJob['status']) {
  const map = { queued: 'secondary', running: 'warning', succeeded: 'success', failed: 'danger' } as const
  return <span className={`badge text-bg-${map[status]}`}>{status}</span>
}

function Ingestion() {
  const [jobs, setJobs] = useState<IngestionJob[]>(mockJobs)
  const [filter, setFilter] = useState<'all' | IngestionJob['status']>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const filtered = useMemo(() => {
    return jobs.filter((j) => (filter === 'all' ? true : j.status === filter))
  }, [jobs, filter])

  useEffect(() => {
    if (!autoRefresh) return
    const t = setInterval(() => {
      // TODO: Poll backend for latest job statuses
      setJobs((prev) => prev.map((j) => (j.status === 'running' ? { ...j, itemsProcessed: Math.min(j.itemsProcessed + 5, j.itemsTotal) } : j)))
    }, 1500)
    return () => clearInterval(t)
  }, [autoRefresh])

  function triggerIngestion() {
    // TODO: Call backend to create new ingestion job; optimistic add
    const newJob: IngestionJob = {
      id: Math.random().toString(36).slice(2),
      source: 'manual',
      startedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'queued',
      itemsProcessed: 0,
      itemsTotal: 100,
    }
    setJobs((prev) => [newJob, ...prev])
  }

  function cancelJob(_id: string) {
    // TODO: Call backend to cancel job
    alert('TODO: Cancel job')
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <h1 className="h4 mb-0">Ingestion</h1>
        <div className="ms-auto d-flex gap-2">
          <select className="form-select" style={{ maxWidth: 200 }} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
          </select>
          <div className="form-check form-switch d-flex align-items-center">
            <input className="form-check-input" type="checkbox" id="autoRefresh" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            <label className="form-check-label ms-2" htmlFor="autoRefresh">Auto-refresh</label>
          </div>
          <Button className="btn btn-primary" onClick={triggerIngestion}>Trigger Ingestion</Button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 56 }}>#</th>
              <th>Source</th>
              <th>Started</th>
              <th>Status</th>
              <th>Progress</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j, idx) => {
              const pct = j.itemsTotal === 0 ? 0 : Math.round((j.itemsProcessed / j.itemsTotal) * 100)
              return (
                <tr key={j.id}>
                  <td>{idx + 1}</td>
                  <td className="text-capitalize">{j.source}</td>
                  <td className="text-secondary">{j.startedAt}</td>
                  <td>{statusBadge(j.status)}</td>
                  <td style={{ minWidth: 200 }}>
                    <div className="progress" role="progressbar" aria-label="Ingestion progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className={`progress-bar ${j.status === 'failed' ? 'bg-danger' : j.status === 'succeeded' ? 'bg-success' : ''}`} style={{ width: `${pct}%` }}>
                        {pct}%
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <Button className="btn btn-outline-light">Details</Button>
                      <Button className="btn btn-outline-danger" disabled={j.status !== 'running'} onClick={() => cancelJob(j.id)}>Cancel</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-4">No jobs</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Ingestion


