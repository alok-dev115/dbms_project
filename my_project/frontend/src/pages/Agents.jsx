import { useEffect, useState } from 'react'
import { Card, Container, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchAgents, unwrapRequest } from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Agents() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const d = await unwrapRequest(fetchAgents({ page_size: 100 }))
        if (!c) setRows(d.results || d || [])
      } catch (e) {
        toast.error(e.message)
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <Container className="page-shell">
      <h1 className="h3 mb-3">Agents</h1>
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Sales</th>
                <th>Rentals</th>
                <th>Avg deal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.agent_id}>
                  <td>
                    <Link to={`/agents/${a.agent_id}`} className="fw-semibold text-decoration-none">
                      {a.name}
                    </Link>
                  </td>
                  <td>{a.contact || '—'}</td>
                  <td className="small">{a.email || '—'}</td>
                  <td>{a.rating ?? '—'}</td>
                  <td>{a.total_sales ?? 0}</td>
                  <td>{a.total_rentals ?? 0}</td>
                  <td>
                    {a.avg_deal_value != null
                      ? `₹${Number(a.avg_deal_value).toLocaleString()}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}
