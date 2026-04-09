import { useEffect, useState } from 'react'
import { Card, Col, Container, Form, Row } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
  reportRentalsByAgent,
  reportSalesByAgent,
  reportTopProperties,
  unwrapRequest,
} from '../api'
import { BarChart, LineChart } from '../components/ChartComponent'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Reports() {
  const [range, setRange] = useState({ date_from: '', date_to: '' })
  const [salesAgents, setSalesAgents] = useState([])
  const [rentAgents, setRentAgents] = useState([])
  const [topProps, setTopProps] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const params = { ...range }
      Object.keys(params).forEach((k) => {
        if (params[k] === '') delete params[k]
      })
      const [sa, ra, tp] = await Promise.all([
        unwrapRequest(reportSalesByAgent(params)),
        unwrapRequest(reportRentalsByAgent(params)),
        unwrapRequest(reportTopProperties({ limit: 8 })),
      ])
      setSalesAgents(sa || [])
      setRentAgents(ra || [])
      setTopProps(tp)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const applyRange = (e) => {
    e.preventDefault()
    load()
  }

  if (loading && !salesAgents.length && !rentAgents.length) return <LoadingSpinner />

  const listed = topProps?.most_expensive_listed || []
  const highRent = topProps?.highest_monthly_rent || []

  return (
    <Container className="page-shell">
      <h1 className="h3 mb-3">Reports</h1>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Form onSubmit={applyRange} className="row g-2 align-items-end">
            <Col xs={12} md={4}>
              <Form.Label className="small text-muted">Date from</Form.Label>
              <Form.Control
                type="date"
                value={range.date_from}
                onChange={(e) => setRange({ ...range, date_from: e.target.value })}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="small text-muted">Date to</Form.Label>
              <Form.Control
                type="date"
                value={range.date_to}
                onChange={(e) => setRange({ ...range, date_to: e.target.value })}
              />
            </Col>
            <Col xs="auto">
              <button className="btn btn-primary" type="submit">
                Apply to agent reports
              </button>
            </Col>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-3">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header>Sales by agent</Card.Header>
            <Card.Body>
              <BarChart
                labels={salesAgents.map((r) => r.agent__name || `Agent ${r.agent_id}`)}
                data={salesAgents.map((r) => Number(r.total_volume || 0))}
                label="Volume"
              />
              <div className="mt-3">
                <DataTable
                  rows={salesAgents.map((r) => ({
                    agent: r.agent__name,
                    deals: r.total_sales,
                    volume: r.total_volume,
                    avg: r.avg_price,
                  }))}
                  pageSize={8}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header>Rentals by agent</Card.Header>
            <Card.Body>
              <LineChart
                labels={rentAgents.map((r) => r.agent__name || `Agent ${r.agent_id}`)}
                data={rentAgents.map((r) => Number(r.agreements || 0))}
                label="Agreements"
              />
              <div className="mt-3">
                <DataTable
                  rows={rentAgents.map((r) => ({
                    agent: r.agent__name,
                    agreements: r.agreements,
                    rent_sum: r.total_rent_collected,
                  }))}
                  pageSize={8}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>Top listed prices</Card.Header>
            <Card.Body>
              <DataTable
                rows={listed.map((p) => ({
                  id: p.property_id,
                  address: p.address,
                  city: p.city,
                  type: p.property_type,
                  price: p.listed_price,
                }))}
                pageSize={8}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>Highest monthly rent</Card.Header>
            <Card.Body>
              <DataTable
                rows={highRent.map((r) => ({
                  address: r.property?.address,
                  rent: r.monthly_rent,
                  tenant: r.tenant?.name,
                }))}
                pageSize={8}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
