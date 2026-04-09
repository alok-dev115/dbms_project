import { useMemo, useState } from 'react'
import { Alert, Button, Card, Container, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  executeQuery,
  queryA,
  queryB,
  queryC,
  queryD,
  queryE,
  queryF,
  unwrapRequest,
} from '../api'
import DataTable from '../components/DataTable'
import { useAuth } from '../context/AuthContext'
import { exportRowsToCsv } from '../utils/csv'

function normalizeRows(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    if (Array.isArray(data.results)) return data.results
    return [data]
  }
  return []
}

export default function Queries() {
  const { isStaff } = useAuth()
  const [rows, setRows] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [customSql, setCustomSql] = useState('SELECT * FROM Property LIMIT 20;')

  const customSqlDisabled = useMemo(() => loading || !isStaff, [loading, isStaff])

  const runPreset = async (label, runner) => {
    setLoading(true)
    setTitle(label)
    try {
      const data = await unwrapRequest(runner())
      setRows(Array.isArray(data) ? data : normalizeRows(data))
      toast.success('Query finished')
    } catch (e) {
      toast.error(e.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const runCustomSql = async () => {
    if (!isStaff) return
    setLoading(true)
    setTitle('Custom SQL')
    try {
      const data = await unwrapRequest(executeQuery(customSql))
      setRows(Array.isArray(data?.rows) ? data.rows : [])
      toast.success(`Returned ${data?.rows?.length ?? 0} rows`)
    } catch (e) {
      toast.error(e.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const runQf = async () => {
    setLoading(true)
    setTitle('Query (f)')
    try {
      const data = await unwrapRequest(queryF())
      const flat = []
      if (data?.most_expensive_house) flat.push(data.most_expensive_house)
      if (data?.highest_rent) flat.push(data.highest_rent)
      setRows(flat.filter(Boolean))
      toast.success('Query finished')
    } catch (e) {
      toast.error(e.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const runQd = async () => {
    setLoading(true)
    setTitle('Query (d)')
    try {
      const data = await unwrapRequest(queryD())
      setRows(data ? [data] : [])
      toast.success('Query finished')
    } catch (e) {
      toast.error(e.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="page-shell">
      <h1 className="h3 mb-3">Predefined queries</h1>
      <Card className="shadow-sm mb-3">
        <Card.Body className="d-flex flex-column gap-2">
          <Button
            variant="outline-primary"
            className="text-start"
            disabled={loading}
            onClick={() => runPreset('Query (a)', queryA)}
          >
            (a) Houses in Guwahati built after 2023 available for rent
          </Button>
          <Button
            variant="outline-primary"
            className="text-start"
            disabled={loading}
            onClick={() => runPreset('Query (b)', queryB)}
          >
            (b) Guwahati houses priced ₹20L–₹60L
          </Button>
          <Button
            variant="outline-primary"
            className="text-start"
            disabled={loading}
            onClick={() => runPreset('Query (c)', queryC)}
          >
            (c) G.S. Road rentals: 2+ beds under ₹15k
          </Button>
          <Button variant="outline-primary" className="text-start" disabled={loading} onClick={runQd}>
            (d) Agent with highest sales amount in 2023
          </Button>
          <Button
            variant="outline-primary"
            className="text-start"
            disabled={loading}
            onClick={() => runPreset('Query (e)', queryE)}
          >
            (e) Avg selling price and days on market per agent (2018)
          </Button>
          <Button variant="outline-primary" className="text-start" disabled={loading} onClick={runQf}>
            (f) Most expensive house and highest rent property
          </Button>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h2 className="h5 mb-1">Custom SQL</h2>
              <p className="text-muted small mb-0">
                Staff-only. Only single <code>SELECT</code> statements are allowed.
              </p>
            </div>
            <div className="d-flex gap-2">
              {!isStaff && (
                <Button as={Link} to="/login" size="sm" variant="outline-primary">
                  Staff login
                </Button>
              )}
              <Button
                as={Link}
                to="/custom-query"
                size="sm"
                variant="outline-secondary"
              >
                Open full page
              </Button>
            </div>
          </div>

          {!isStaff && (
            <Alert variant="warning" className="mt-2 mb-0 py-2 small">
              Sign in with a Django <code>is_staff</code> user to run custom SQL.
            </Alert>
          )}

          <Form.Group className="mt-2">
            <Form.Label className="small">SQL</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              className="font-monospace small"
              disabled={customSqlDisabled}
            />
          </Form.Group>
          <div className="d-flex flex-wrap gap-2 mt-2">
            <Button variant="primary" onClick={runCustomSql} disabled={customSqlDisabled}>
              Execute
            </Button>
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h5 mb-0">{title || 'Results'}</h2>
        {!!rows.length && (
          <Button size="sm" variant="success" onClick={() => exportRowsToCsv(rows, 'query-results.csv')}>
            Export CSV
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? <p className="text-muted mb-0">Running…</p> : <DataTable rows={rows} pageSize={12} />}
        </Card.Body>
      </Card>
    </Container>
  )
}
