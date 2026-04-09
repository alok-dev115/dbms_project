import { useEffect, useState } from 'react'
import { Card, Container } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { fetchRentals, unwrapRequest } from '../api'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Rentals() {
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
      const d = await unwrapRequest(fetchRentals(params))
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

  const flat = rows.map((r) => ({
    address: r.property?.address,
    locality: r.property?.locality,
    tenant: r.tenant?.name,
    agent: r.agent?.name,
    start_date: r.start_date,
    end_date: r.end_date,
    monthly_rent: r.monthly_rent,
    active: r.is_active ? 'Active' : 'Expired / future',
  }))

  const fields = [
    { name: 'locality', label: 'Locality', placeholder: 'Contains…' },
    { name: 'min_rent', label: 'Min rent', type: 'number' },
    { name: 'max_rent', label: 'Max rent', type: 'number' },
    { name: 'agent_id', label: 'Agent ID', type: 'number' },
    {
      name: 'active',
      label: 'Lease state',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Expired' },
      ],
    },
  ]

  return (
    <Container className="page-shell">
      <h1 className="h3 mb-3">Rentals</h1>
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
                { key: 'active', label: 'Status' },
                { key: 'address', label: 'Property' },
                { key: 'locality', label: 'Locality' },
                { key: 'tenant', label: 'Tenant' },
                { key: 'agent', label: 'Agent' },
                { key: 'monthly_rent', label: 'Monthly rent' },
                { key: 'start_date', label: 'Start' },
                { key: 'end_date', label: 'End' },
              ]}
              pageSize={15}
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}
