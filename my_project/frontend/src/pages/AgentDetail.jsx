import { useEffect, useState } from 'react'
import { Card, Container, Table } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchAgent, unwrapRequest } from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AgentDetail() {
  const { id } = useParams()
  const [a, setA] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const d = await unwrapRequest(fetchAgent(id))
        if (!c) setA(d)
      } catch (e) {
        toast.error(e.message)
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!a) return <Container>Not found</Container>

  const sales = a.sales || []
  const rentals = a.rentals || []

  return (
    <Container className="page-shell">
      <Link to="/agents" className="small text-decoration-none">
        ← Agents
      </Link>
      <h1 className="h3 mt-2">{a.name}</h1>
      <p className="text-muted">
        Rating {a.rating ?? '—'} · {a.email || 'No email'} · {a.contact || '—'}
      </p>
      <p>
        <strong>Total sales:</strong> {a.total_sales ?? 0} · <strong>Rentals:</strong>{' '}
        {a.total_rentals ?? 0} · <strong>Avg deal:</strong>{' '}
        {a.avg_deal_value != null ? `₹${Number(a.avg_deal_value).toLocaleString()}` : '—'}
      </p>

      <Card className="shadow-sm mb-3">
        <Card.Header>Sales</Card.Header>
        <Card.Body className="p-0">
          <Table responsive size="sm" className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Property</th>
                <th>Buyer</th>
                <th>Date</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => (
                <tr key={i}>
                  <td>
                    {s.property ? (
                      <Link to={`/properties/${s.property.property_id}`}>
                        {s.property.address || `#${s.property.property_id}`}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{s.buyer?.name || '—'}</td>
                  <td>{s.sale_date || '—'}</td>
                  <td>
                    {s.final_price != null ? `₹${Number(s.final_price).toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
              {!sales.length && (
                <tr>
                  <td colSpan={4} className="text-muted">
                    No sales
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header>Rentals</Card.Header>
        <Card.Body className="p-0">
          <Table responsive size="sm" className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Period</th>
                <th>Rent</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r, i) => (
                <tr key={i}>
                  <td>
                    {r.property ? (
                      <Link to={`/properties/${r.property.property_id}`}>
                        {r.property.address || `#${r.property.property_id}`}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{r.tenant?.name || '—'}</td>
                  <td>
                    {r.start_date} → {r.end_date || 'open'}
                  </td>
                  <td>
                    {r.monthly_rent != null ? `₹${Number(r.monthly_rent).toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
              {!rentals.length && (
                <tr>
                  <td colSpan={4} className="text-muted">
                    No rentals
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}
