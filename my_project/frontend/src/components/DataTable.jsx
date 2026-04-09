import { useMemo, useState } from 'react'
import { Pagination, Table } from 'react-bootstrap'

function sortRows(rows, key, dir) {
  if (!key) return rows
  const mul = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const va = a[key]
    const vb = b[key]
    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mul
    return String(va).localeCompare(String(vb), undefined, { numeric: true }) * mul
  })
}

export default function DataTable({
  rows = [],
  columns,
  pageSize = 10,
  emptyText = 'No rows',
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const keys = useMemo(() => {
    if (columns?.length) return columns.map((c) => c.key)
    if (rows.length) return Object.keys(rows[0])
    return []
  }, [columns, rows])

  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, totalPages)
  const slice = sorted.slice((current - 1) * pageSize, current * pageSize)

  const headerClick = (k) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setSortDir('asc')
    }
    setPage(1)
  }

  if (!rows.length) {
    return <p className="text-muted">{emptyText}</p>
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover size="sm" className="align-middle bg-white">
          <thead className="table-light">
            <tr>
              {keys.map((k) => {
                const label = columns?.find((c) => c.key === k)?.label || k
                return (
                  <th
                    key={k}
                    role="button"
                    onClick={() => headerClick(k)}
                    className="user-select-none"
                  >
                    {label}
                    {sortKey === k ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, idx) => (
              <tr key={idx}>
                {keys.map((k) => (
                  <td key={k}>{formatCell(row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination className="justify-content-end">
          <Pagination.Prev disabled={current <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          <Pagination.Item active>{current}</Pagination.Item>
          <Pagination.Next
            disabled={current >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </Pagination>
      )}
    </>
  )
}

function formatCell(v) {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}
