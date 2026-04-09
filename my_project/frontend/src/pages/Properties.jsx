import { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Modal, Row, Form } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { createProperty, fetchProperties, unwrapRequest } from '../api'
import FilterBar from '../components/FilterBar'
import LoadingSpinner from '../components/LoadingSpinner'
import PropertyCard from '../components/PropertyCard'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Properties() {
  const { propertyFilters, setPropertyFilters } = useApp()
  const { isAuthenticated } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({
    address: '',
    city: '',
    locality: '',
    property_type: '',
    size: '',
    no_of_bedroom: '',
    listed_price: '',
    listed_date: '',
    construction_year: '',
    current_status: '',
    owner_id: '',
    agent_id: '',
  })

  const load = async (filters) => {
    setLoading(true)
    try {
      const params = { ...filters }
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] == null) delete params[k]
      })
      const data = await unwrapRequest(fetchProperties(params))
      setRows(data.results || data || [])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(propertyFilters)
  }, [propertyFilters])

  const fields = [
    { name: 'city', label: 'City', placeholder: 'City contains…' },
    { name: 'min_price', label: 'Min price', type: 'number', placeholder: '0' },
    { name: 'max_price', label: 'Max price', type: 'number', placeholder: 'Any' },
    { name: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: 'e.g. 3' },
    { name: 'status', label: 'Status', placeholder: 'e.g. Available' },
  ]

  const submitAdd = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        size: form.size === '' ? null : form.size,
        no_of_bedroom: form.no_of_bedroom === '' ? null : Number(form.no_of_bedroom),
        listed_price: form.listed_price === '' ? null : form.listed_price,
        construction_year: form.construction_year === '' ? null : Number(form.construction_year),
        owner_id: form.owner_id === '' ? null : Number(form.owner_id),
        agent_id: form.agent_id === '' ? null : Number(form.agent_id),
        listed_date: form.listed_date || null,
      }
      await unwrapRequest(createProperty(payload))
      toast.success('Property created')
      setShow(false)
      load(propertyFilters)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Container className="page-shell">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Properties</h1>
        {isAuthenticated && (
          <Button variant="primary" onClick={() => setShow(true)}>
            Add property
          </Button>
        )}
      </div>

      <FilterBar
        fields={fields}
        values={propertyFilters}
        onChange={setPropertyFilters}
        onReset={() => setPropertyFilters({})}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Row className="g-3">
          {rows.map((p) => (
            <Col key={p.property_id} md={6} lg={4}>
              <PropertyCard property={p} />
            </Col>
          ))}
        </Row>
      )}

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add property</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitAdd}>
          <Modal.Body>
            <Row className="g-2">
              {[
                ['address', 'Address'],
                ['city', 'City'],
                ['locality', 'Locality'],
                ['property_type', 'Type'],
                ['current_status', 'Status'],
              ].map(([k, lab]) => (
                <Col md={6} key={k}>
                  <Form.Label className="small">{lab}</Form.Label>
                  <Form.Control
                    size="sm"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </Col>
              ))}
              <Col md={4}>
                <Form.Label className="small">Size</Form.Label>
                <Form.Control
                  size="sm"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small">Bedrooms</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={form.no_of_bedroom}
                  onChange={(e) => setForm({ ...form, no_of_bedroom: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small">Listed price</Form.Label>
                <Form.Control
                  size="sm"
                  value={form.listed_price}
                  onChange={(e) => setForm({ ...form, listed_price: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small">Listed date</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={form.listed_date}
                  onChange={(e) => setForm({ ...form, listed_date: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small">Year built</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={form.construction_year}
                  onChange={(e) => setForm({ ...form, construction_year: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small">Owner ID</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={form.owner_id}
                  onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small">Agent ID</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={form.agent_id}
                  onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={() => setShow(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}
