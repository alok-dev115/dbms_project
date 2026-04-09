import { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchDashboardStats, unwrapRequest } from '../api'
import { BarChart, LineChart, PieChart } from '../components/ChartComponent'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = await unwrapRequest(fetchDashboardStats())
        if (!cancelled) setData(d)
      } catch (e) {
        toast.error(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <LoadingSpinner />

  const totals = data?.totals || {}
  const trend = data?.sales_trend || []
  const topAgents = data?.top_agents || []

  return (
    <Container className="page-shell">
      <h1 className="h3 mb-3">Dashboard</h1>
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="text-muted small">Properties</div>
              <div className="fs-3 fw-semibold">{totals.properties ?? 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="text-muted small">Sales</div>
              <div className="fs-3 fw-semibold">{totals.sales ?? 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="text-muted small">Rentals</div>
              <div className="fs-3 fw-semibold">{totals.rentals ?? 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="text-muted small">Active agents</div>
              <div className="fs-3 fw-semibold">{totals.active_agents ?? 0}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Header>Sales trend (12 months)</Card.Header>
            <Card.Body>
              <LineChart
                labels={trend.map((r) => r.ym)}
                data={trend.map((r) => Number(r.vol || r.cnt || 0))}
                label="Volume"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Header>Top agents by revenue</Card.Header>
            <Card.Body>
              <BarChart
                labels={topAgents.map((a) => a.name || `Agent ${a.agent_id}`)}
                data={topAgents.map((a) => Number(a.revenue || 0))}
                label="Revenue"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>Deal mix (top agents)</Card.Header>
            <Card.Body>
              <PieChart
                labels={topAgents.map((a) => a.name || `Agent ${a.agent_id}`)}
                data={topAgents.map((a) => Number(a.deals || 0))}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>Quick queries</Card.Header>
            <Card.Body className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/queries" variant="outline-primary">
                Predefined queries
              </Button>
              <Button as={Link} to="/reports" variant="outline-success">
                Reports
              </Button>
              <Button as={Link} to="/properties" variant="outline-secondary">
                Browse properties
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
