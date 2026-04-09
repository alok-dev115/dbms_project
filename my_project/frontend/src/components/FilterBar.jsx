import { Button, Col, Form, Row } from 'react-bootstrap'

export default function FilterBar({ fields, values, onChange, onReset }) {
  return (
    <Form
      className="border rounded-3 p-3 mb-3 bg-white"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <Row className="g-2 align-items-end">
        {fields.map((f) => (
          <Col key={f.name} xs={12} md={6} lg={3}>
            <Form.Label className="small text-muted mb-1">{f.label}</Form.Label>
            {f.type === 'select' ? (
              <Form.Select
                size="sm"
                value={values[f.name] ?? ''}
                onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}
              >
                <option value="">{f.placeholder || 'Any'}</option>
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                size="sm"
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={values[f.name] ?? ''}
                onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}
              />
            )}
          </Col>
        ))}
        <Col xs="auto" className="ms-auto d-flex gap-2">
          <Button size="sm" variant="primary" type="submit">
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            type="button"
            onClick={() => {
              onReset?.()
            }}
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
