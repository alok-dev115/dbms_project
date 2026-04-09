import { useState } from 'react'
import { Alert, Button, Card, Container, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      toast.success('Signed in')
      nav('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Login failed'
      setError(String(msg))
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 420 }}>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Staff login</Card.Title>
          <p className="text-muted small">
            Use a Django user with is_staff for Custom SQL. JWT is required to add properties via the
            API.
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={submit}>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Get token
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
