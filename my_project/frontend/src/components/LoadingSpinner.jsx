import { Spinner } from 'react-bootstrap'

export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2 text-secondary">
      <Spinner animation="border" role="status" variant="primary" />
      <span>{message}</span>
    </div>
  )
}
