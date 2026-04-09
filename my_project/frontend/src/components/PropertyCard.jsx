import { Badge, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function PropertyCard({ property }) {
  const id = property.property_id
  return (
    <Card className="h-100 card-hover shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-2">
          <Card.Title className="h6 mb-1">
            <Link to={`/properties/${id}`} className="text-decoration-none stretched-link">
              {property.address || `Property #${id}`}
            </Link>
          </Card.Title>
          {property.current_status && (
            <Badge bg="secondary" className="text-wrap">
              {property.current_status}
            </Badge>
          )}
        </div>
        <Card.Text className="small text-muted mb-2">
          {[property.locality, property.city].filter(Boolean).join(' · ')}
        </Card.Text>
        <div className="small">
          <div>
            <strong>Type:</strong> {property.property_type || '—'}
          </div>
          <div>
            <strong>Beds:</strong> {property.no_of_bedroom ?? '—'}
          </div>
          <div>
            <strong>Price:</strong>{' '}
            {property.listed_price != null ? `₹${Number(property.listed_price).toLocaleString()}` : '—'}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
