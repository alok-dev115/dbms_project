import { useState } from 'react'
import { Container, Nav, Navbar as BSNavbar, NavDropdown } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'active fw-semibold' : ''}`

export default function Navbar() {
  const { isAuthenticated, isStaff, username, logout } = useAuth()
  const { theme, toggleTheme } = useApp()
  const [expanded, setExpanded] = useState(false)

  return (
    <BSNavbar
      expand="lg"
      bg="dark"
      variant="dark"
      className="mb-3"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid="lg">
        <BSNavbar.Brand as={NavLink} to="/dashboard">
          Real Estate DBMS
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-nav" />
        <BSNavbar.Collapse id="main-nav">
          <Nav className="me-auto" onClick={() => setExpanded(false)}>
            <Nav.Link as={NavLink} to="/dashboard" className={linkClass}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/properties" className={linkClass}>
              Properties
            </Nav.Link>
            <Nav.Link as={NavLink} to="/agents" className={linkClass}>
              Agents
            </Nav.Link>
            <Nav.Link as={NavLink} to="/sales" className={linkClass}>
              Sales
            </Nav.Link>
            <Nav.Link as={NavLink} to="/rentals" className={linkClass}>
              Rentals
            </Nav.Link>
            <Nav.Link as={NavLink} to="/queries" className={linkClass}>
              Queries
            </Nav.Link>
            <Nav.Link as={NavLink} to="/reports" className={linkClass}>
              Reports
            </Nav.Link>
            {isStaff && (
              <Nav.Link as={NavLink} to="/custom-query" className={linkClass}>
                Custom SQL
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            <NavDropdown title={`Theme: ${theme}`} align="end">
              <NavDropdown.Item onClick={toggleTheme}>Toggle dark / light</NavDropdown.Item>
            </NavDropdown>
            {isAuthenticated ? (
              <NavDropdown title={username || 'Account'} align="end">
                {!isStaff && (
                  <NavDropdown.ItemText className="small text-muted">
                    Staff login unlocks Custom SQL
                  </NavDropdown.ItemText>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={NavLink} to="/login" className={linkClass}>
                Login
              </Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}
