import { useEffect, useState } from 'react'
import { Card, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchSales, unwrapRequest } from '../api'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Sales() {
  const [filters, setFilters] = useState({})
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async (f) => {
    setLoading(true)
    try {
      const params = { ...f, page_size: 200 }
      Object.keys(params).forEach((k) => {
        if (params[k] === '') delete params[k]
      })
      const d = await unwrapRequest(fetchSales(params))
      setRows(d.results || d || [])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filters)
  }, [filters])

  const flat = rows.map((s) => ({
    property: s.property?.address || s.property?.property_id,
    city: s.property?.city,
    buyer: s.buyer?.name,
    agent: s.agent?.name,
    sale_date: s.sale_date,
    final_price: s.final_price,
    days_on_market: s.days_on_market,
    property_id: s.property?.property_id,
  }))

  const fields = [
    { name: 'date_from', label: 'From', type: 'date' },
    { name: 'date_to', label: 'To', type: 'date' },
    { name: 'agent_id', label: 'Agent ID', type: 'number', placeholder: 'e.g. 1' },
    { name: 'min_price', label: 'Min price', type: 'number' },
    { name: 'max_price', label: 'Max price', type: 'number' },
  ]

  return (
    <Container className="page-shell">
      <h1 className="h3 mb-3">Sales</h1>
      <FilterBar
        fields={fields}
        values={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <DataTable
              rows={flat}
              columns={[
                { key: 'sale_date', label: 'Date' },
                { key: 'property', label: 'Property' },
                { key: 'city', label: 'City' },
                { key: 'buyer', label: 'Buyer' },
                { key: 'agent', label: 'Agent' },
                { key: 'final_price', label: 'Final price' },
                { key: 'days_on_market', label: 'DOM' },
              ]}
              pageSize={15}
            />
            <p className="small text-muted mt-2 mb-0">
              Tip: open a property via{' '}
              <Link to="/properties">Properties</Link> using the ID from your data browser.
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}
