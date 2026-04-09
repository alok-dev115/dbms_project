import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

const defaultOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
}

export function LineChart({ labels, data, label = 'Series' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: 'rgb(13, 110, 253)',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        tension: 0.25,
      },
    ],
  }
  return (
    <div style={{ height: 280 }}>
      <Line data={chartData} options={defaultOpts} />
    </div>
  )
}

export function BarChart({ labels, data, label = 'Series' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: 'rgba(25, 135, 84, 0.65)',
      },
    ],
  }
  return (
    <div style={{ height: 280 }}>
      <Bar data={chartData} options={defaultOpts} />
    </div>
  )
}

export function PieChart({ labels, data }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          '#0d6efd',
          '#6610f2',
          '#6f42c1',
          '#d63384',
          '#fd7e14',
          '#198754',
        ],
      },
    ],
  }
  return (
    <div style={{ height: 280 }}>
      <Pie data={chartData} options={{ ...defaultOpts, plugins: { legend: { position: 'right' } } }} />
    </div>
  )
}
