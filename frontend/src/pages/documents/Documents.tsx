import { useRef, useState } from 'react'

type DocumentRow = {
  id: string
  name: string
  sizeBytes: number
  type: 'pdf' | 'image' | 'text' | 'other'
  uploadedAt: string
  status: 'indexed' | 'processing' | 'error'
}

const mockDocuments: DocumentRow[] = [
  { id: 'd1', name: 'Product Spec.pdf', sizeBytes: 1_234_567, type: 'pdf', uploadedAt: '2025-04-01 10:22', status: 'indexed' },
  { id: 'd2', name: 'Meeting Notes.txt', sizeBytes: 54_321, type: 'text', uploadedAt: '2025-04-03 08:10', status: 'indexed' },
  { id: 'd3', name: 'Screenshot.png', sizeBytes: 734_002, type: 'image', uploadedAt: '2025-04-05 16:45', status: 'processing' },
]

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function badgeForType(type: DocumentRow['type']) {
  const map = { pdf: 'danger', image: 'info', text: 'secondary', other: 'light' } as const
  return <span className={`badge text-bg-${map[type]}`}>{type.toUpperCase()}</span>
}

function badgeForStatus(status: DocumentRow['status']) {
  const map = { indexed: 'success', processing: 'warning', error: 'danger' } as const
  return <span className={`badge text-bg-${map[status]}`}>{status}</span>
}

function Documents() {
  const [documents, setDocuments] = useState<DocumentRow[]>(mockDocuments)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'image' | 'text' | 'other'>('all')
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const filtered = documents.filter((d) => {
    const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase())
    const matchesType = typeFilter === 'all' ? true : d.type === typeFilter
    return matchesQuery && matchesType
  })

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    const selected = Array.from(files)
    setUploadingFiles(selected)
    // TODO: Upload files to backend with progress; on success, refresh list
  }

  function handleDeleteDocument(id: string) {
    // TODO: Call backend to delete, confirm dialog, then refresh
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <h1 className="h4 mb-0">Documents</h1>
        <div className="ms-auto d-flex flex-wrap gap-2">
          <input
            type="search"
            className="form-control"
            placeholder="Search"
            style={{ maxWidth: 260 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 180 }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          >
            <option value="all">All types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="text">Text</option>
            <option value="other">Other</option>
          </select>
          <button className="btn btn-primary" onClick={openFilePicker}>Upload</button>
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h2 className="h6 mb-3">Uploading</h2>
            <div className="list-group list-group-flush">
              {uploadingFiles.map((f, idx) => (
                <div key={idx} className="list-group-item px-0">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-medium">{f.name}</div>
                      <div className="text-secondary small">{formatBytes(f.size)}</div>
                    </div>
                    <div className="text-secondary small">Queued</div>
                  </div>
                  <div className="progress mt-2" role="progressbar" aria-label="Upload progress" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar" style={{ width: '25%' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* TODO: Replace with real progress and cancel controls */}
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 56 }}>#</th>
              <th>Name</th>
              <th style={{ width: 120 }}>Type</th>
              <th style={{ width: 140 }}>Size</th>
              <th style={{ width: 200 }}>Uploaded</th>
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, idx) => (
              <tr key={d.id}>
                <td>{idx + 1}</td>
                <td className="text-truncate" style={{ maxWidth: 380 }}>{d.name}</td>
                <td>{badgeForType(d.type)}</td>
                <td>{formatBytes(d.sizeBytes)}</td>
                <td className="text-secondary">{d.uploadedAt}</td>
                <td>{badgeForStatus(d.status)}</td>
                <td>
                  <div className="btn-group btn-group-sm" role="group">
                    <button className="btn btn-outline-light">View</button>
                    <button className="btn btn-outline-light">Download</button>
                    <button className="btn btn-outline-danger" onClick={() => handleDeleteDocument(d.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-secondary py-4">No documents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div className="text-secondary small">Showing {filtered.length} of {documents.length}</div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled"><span className="page-link">Prev</span></li>
            <li className="page-item active"><span className="page-link">1</span></li>
            <li className="page-item"><span className="page-link">2</span></li>
            <li className="page-item"><span className="page-link">Next</span></li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Documents


