import { Component } from 'react'
import { Alert, Button } from 'react-bootstrap'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container py-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p>{String(this.state.error.message || this.state.error)}</p>
            <Button
              variant="outline-danger"
              onClick={() => {
                this.setState({ error: null })
                window.location.href = '/'
              }}
            >
              Go home
            </Button>
          </Alert>
        </div>
      )
    }
    return this.props.children
  }
}
