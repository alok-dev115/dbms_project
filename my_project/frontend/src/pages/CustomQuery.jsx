import { useEffect, useState } from 'react'
import { Alert, Button, Card, Container, Form, ListGroup } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { executeQuery, unwrapRequest } from '../api'
import DataTable from '../components/DataTable'
import { useAuth } from '../context/AuthContext'
import { exportRowsToCsv } from '../utils/csv'

const LS_KEY = 're_saved_sql_queries'

export default function CustomQuery() {
  const { isStaff } = useAuth()
  const [sql, setSql] = useState('SELECT * FROM Property LIMIT 20;')
  const [rows, setRows] = useState([])
  const [cols, setCols] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(LS_KEY) || '[]'))
    } catch {
      setSaved([])
    }
  }, [])

  if (!isStaff) {
    return <Navigate to="/login" replace />
  }

  const persistSaved = (next) => {
    setSaved(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  const run = async () => {
    setLoading(true)
    try {
      const data = await unwrapRequest(executeQuery(sql))
      setCols(data.columns || [])
      setRows(data.rows || [])
      toast.success(`Returned ${data.rows?.length ?? 0} rows`)
    } catch (e) {
      toast.error(e.message)
      setRows([])
      setCols([])
    } finally {
      setLoading(false)
    }
  }

  const saveQuery = () => {
    const label = window.prompt('Label for this query')
    if (!label) return
    const next = [{ label, sql }, ...saved.filter((s) => s.sql !== sql)].slice(0, 20)
    persistSaved(next)
    toast.success('Saved')
  }

  const tableRows = rows.map((r) => {
    const o = {}
    ;(cols.length ? cols : Object.keys(r)).forEach((k) => {
      o[k] = r[k]
    })
    return o
  })

  return (
    <Container className="page-shell">
      <h1 className="h3 mb-3">Custom SQL (admin)</h1>
      <Alert variant="info" className="py-2">
        Only <code>SELECT</code> is allowed. Use a staff account (JWT) — same login as Custom SQL nav
        link.
      </Alert>
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Form.Group>
            <Form.Label>SQL</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="font-monospace small"
            />
          </Form.Group>
          <div className="d-flex flex-wrap gap-2 mt-2">
            <Button variant="primary" onClick={run} disabled={loading}>
              Execute
            </Button>
            <Button variant="outline-secondary" type="button" onClick={saveQuery}>
              Save query
            </Button>
            <Button
              variant="outline-success"
              type="button"
              disabled={!tableRows.length}
              onClick={() => exportRowsToCsv(tableRows, 'custom-query.csv')}
            >
              Export CSV
            </Button>
          </div>
        </Card.Body>
      </Card>

      {!!saved.length && (
        <Card className="shadow-sm mb-3">
          <Card.Header>Saved queries</Card.Header>
          <ListGroup variant="flush">
            {saved.map((s, i) => (
              <ListGroup.Item
                key={i}
                className="d-flex justify-content-between align-items-center gap-2 flex-wrap"
              >
                <button
                  type="button"
                  className="btn btn-link p-0 text-start"
                  onClick={() => setSql(s.sql)}
                >
                  {s.label}
                </button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => persistSaved(saved.filter((_, j) => j !== i))}
                >
                  Remove
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      <Card className="shadow-sm">
        <Card.Header>Results</Card.Header>
        <Card.Body>
          {loading ? (
            <p className="text-muted mb-0">Running…</p>
          ) : (
            <DataTable rows={tableRows} pageSize={15} />
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
