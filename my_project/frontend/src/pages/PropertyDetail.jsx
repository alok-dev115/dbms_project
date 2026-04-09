import { useEffect, useState } from 'react'
import { Badge, Card, Container } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchProperty, unwrapRequest } from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PropertyDetail() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const d = await unwrapRequest(fetchProperty(id))
        if (!c) setP(d)
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
  if (!p) return <Container>Not found</Container>

  return (
    <Container className="page-shell">
      <Link to="/properties" className="small text-decoration-none">
        ← Back to properties
      </Link>
      <Card className="mt-2 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between gap-2 flex-wrap">
            <h1 className="h4">{p.address || `Property #${p.property_id}`}</h1>
            {p.current_status && <Badge bg="secondary">{p.current_status}</Badge>}
          </div>
          <p className="text-muted mb-3">
            {[p.locality, p.city].filter(Boolean).join(' · ')}
          </p>
          <dl className="row mb-0">
            <dt className="col-sm-3">Type</dt>
            <dd className="col-sm-9">{p.property_type || '—'}</dd>
            <dt className="col-sm-3">Beds</dt>
            <dd className="col-sm-9">{p.no_of_bedroom ?? '—'}</dd>
            <dt className="col-sm-3">Size</dt>
            <dd className="col-sm-9">{p.size ?? '—'}</dd>
            <dt className="col-sm-3">Listed price</dt>
            <dd className="col-sm-9">
              {p.listed_price != null ? `₹${Number(p.listed_price).toLocaleString()}` : '—'}
            </dd>
            <dt className="col-sm-3">Listed date</dt>
            <dd className="col-sm-9">{p.listed_date || '—'}</dd>
            <dt className="col-sm-3">Year built</dt>
            <dd className="col-sm-9">{p.construction_year ?? '—'}</dd>
            <dt className="col-sm-3">Owner</dt>
            <dd className="col-sm-9">
              {p.owner ? (
                <>
                  {p.owner.name}{' '}
                  <span className="text-muted small">(#{p.owner.owner_id})</span>
                </>
              ) : (
                p.owner_id ?? '—'
              )}
            </dd>
            <dt className="col-sm-3">Agent</dt>
            <dd className="col-sm-9">
              {p.agent ? (
                <>
                  <Link to={`/agents/${p.agent.agent_id}`}>{p.agent.name}</Link>{' '}
                  <span className="text-muted small">(#{p.agent.agent_id})</span>
                </>
              ) : (
                p.agent_id ?? '—'
              )}
            </dd>
          </dl>
        </Card.Body>
      </Card>
    </Container>
  )
}
