import { useState } from 'react'
import { useForm } from 'react-hook-form'

type Source = {
  id: string
  title: string
  snippet: string
  score: number // 0..1 relevance score
}

type QAItem = {
  id: string
  question: string
  answer: string
  confidence: number // 0..1
  sources: Source[]
}

const mockQA: QAItem[] = [
  {
    id: 'qa1',
    question: 'How do I reset a user password?',
    answer: 'Go to User Management, open the user row, and click Reset Password. The user will receive an email with a reset link.',
    confidence: 0.82,
    sources: [
      {
        id: 's1',
        title: 'User Guide - Passwords',
        snippet:
          'To reset a password, navigate to Admin > User Management. Select the user and choose “Reset Password”. An email is dispatched with a secure link that expires in 24 hours.',
        score: 0.91,
      },
      {
        id: 's2',
        title: 'API Reference - Auth',
        snippet:
          'POST /v1/auth/password/reset initiates a reset flow. Provide the user email in the payload. A signed token is issued and delivered via email.',
        score: 0.76,
      },
    ],
  },
]

type AskForm = { query: string }

function QA() {
  const [qaList, setQaList] = useState<QAItem[]>(mockQA)
  const [selectedId, setSelectedId] = useState<string>(mockQA[0]?.id ?? '')
  const selected = qaList.find((x) => x.id === selectedId) ?? null

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AskForm>({
    defaultValues: { query: '' },
  })

  function onAsk(values: AskForm) {
    // TODO: Call backend RAG endpoint, stream or fetch answer and sources
    // Append a placeholder item to illustrate UI update
    const newItem: QAItem = {
      id: Math.random().toString(36).slice(2),
      question: values.query,
      answer: 'TODO: Fetched answer will appear here. This is a placeholder.',
      confidence: 0.5,
      sources: [
        {
          id: 'sx',
          title: 'Example Document.pdf',
          snippet: 'Relevant excerpt from the document will be displayed here as a preview…',
          score: 0.6,
        },
      ],
    }
    setQaList((prev) => [newItem, ...prev])
    setSelectedId(newItem.id)
    reset()
  }

  function ConfidenceBadge({ value }: { value: number }) {
    const pct = Math.round(value * 100)
    const color = value >= 0.75 ? 'success' : value >= 0.5 ? 'warning' : 'secondary'
    return <span className={`badge text-bg-${color}`}>Confidence: {pct}%</span>
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h2 className="h6">History</h2>
            <div className="list-group list-group-flush">
              {qaList.map((item) => (
                <button
                  key={item.id}
                  className={`list-group-item list-group-item-action ${selectedId === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  style={{ textAlign: 'left' }}
                >
                  <div className="fw-medium text-truncate">{item.question}</div>
                  <div className="small text-truncate">{item.answer}</div>
                </button>
              ))}
              {qaList.length === 0 && (
                <div className="text-secondary small">No questions yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-8">
        <div className="card mb-3">
          <div className="card-body">
            <form onSubmit={handleSubmit(onAsk)} noValidate className="d-flex gap-2">
              <div className="flex-grow-1">
                <input
                  type="text"
                  className={`form-control ${errors.query ? 'is-invalid' : ''}`}
                  placeholder="Ask a question…"
                  {...register('query', { required: 'Please enter a question' })}
                />
                {errors.query && <div className="invalid-feedback">{errors.query.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary">Ask</button>
            </form>
          </div>
        </div>

        {selected ? (
          <div className="d-flex flex-column gap-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-start gap-2">
                  <h2 className="h5 mb-0 flex-grow-1">Answer</h2>
                  <ConfidenceBadge value={selected.confidence} />
                </div>
                <p className="mb-0 mt-2">{selected.answer}</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h3 className="h6 mb-0">Relevant sources</h3>
                  <span className="text-secondary small">Top {selected.sources.length}</span>
                </div>
                <div className="list-group list-group-flush">
                  {selected.sources.map((s, idx) => (
                    <div key={s.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-medium">{idx + 1}. {s.title}</div>
                        <span className="badge text-bg-info">Score: {Math.round(s.score * 100)}%</span>
                      </div>
                      <div className="text-secondary small mt-1">{s.snippet}</div>
                      <div className="mt-2 d-flex gap-2">
                        <button className="btn btn-sm btn-outline-light">Open</button>
                        <button className="btn btn-sm btn-outline-light">Preview</button>
                        <button className="btn btn-sm btn-outline-light">Copy citation</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-secondary">Select a question from history or ask a new one.</div>
        )}
      </div>
    </div>
  )
}

export default QA


