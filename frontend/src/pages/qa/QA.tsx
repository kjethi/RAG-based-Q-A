import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { qaService } from '../../services/qa'
import { toast } from 'react-toastify'
import Button from '../../components/ui/Button'

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
  sources: Source[]
}


type AskForm = { query: string }

function QA() {
  const [qaList, setQaList] = useState<QAItem[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const selected = qaList.find((x) => x.id === selectedId) ?? null

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AskForm>({
    defaultValues: { query: '' },
  })

  async function onAsk(values: AskForm) {
    try {
      setIsLoading(true)
      const response = await qaService.askQuestion(values.query);
      
      const newItem: QAItem = {
        id: Math.random().toString(36).slice(2),
        question: values.query,
        answer: response.answer,
        sources: response.sources,
      }
      setQaList((prev) => [newItem, ...prev])
      setSelectedId(newItem.id)
      reset()
    } catch (error) {
      console.error("Failed to get answer:", error);
      toast.error("Failed to get answer. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h2 className="h6">History</h2>
            <div className="list-group list-group-flush">
              {qaList.map((item) => (
                <Button
                  key={item.id}
                  className={`list-group-item list-group-item-action ${selectedId === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  style={{ textAlign: 'left' }}
                >
                  <div className="fw-medium text-truncate">{item.question}</div>
                  <div className="small text-truncate">{item.answer}</div>
                </Button>
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
                  disabled={isLoading}
                  {...register('query', { required: 'Please enter a question' })}
                />
                {errors.query && <div className="invalid-feedback">{errors.query.message}</div>}
              </div>
              <Button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Asking...
                  </>
                ) : (
                  'Ask'
                )}
              </Button>
            </form>
          </div>
        </div>

        {isLoading && (
          <div className="card mb-3">
            <div className="card-body text-center py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="text-secondary">Processing your question...</div>
              <div className="small text-muted mt-2">This may take a few moments</div>
            </div>
          </div>
        )}

        {selected && !isLoading ? (
          <div className="d-flex flex-column gap-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-start gap-2">
                  <h2 className="h5 mb-0 flex-grow-1">Answer</h2>
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
                        {/* <span className="badge text-bg-info">Score: {Math.round(s.score * 100)}%</span> */}
                      </div>
                      <div className="text-secondary small mt-1">{s.snippet}</div>
                      <div className="mt-2 d-flex gap-2">
                        <Button className="btn btn-sm btn-outline-light">Open</Button>
                        <Button className="btn btn-sm btn-outline-light">Preview</Button>
                        <Button className="btn btn-sm btn-outline-light">Copy citation</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !isLoading ? (
          <div className="text-secondary">Select a question from history or ask a new one.</div>
        ) : null}
      </div>
    </div>
  )
}

export default QA


