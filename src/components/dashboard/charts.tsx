import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Brand indigo for the weekly chart (6.3:1 on the light card, 5.9:1 on the dark card).
// The status chart reuses the status colors used across the app; every bar is also labeled
// with its name and value, and a table view exists, so color is never the only signal.
const chartColor = '[--chart:#4f46e5] dark:[--chart:#818cf8]'
const statusColor: Record<string, string> = {
  Applied: '#0ea5e9',
  Interviewing: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#f43f5e',
}

const tick = { fill: 'var(--muted-foreground)', fontSize: 12 }
const tooltipStyle = {
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
}

interface Point {
  label: string
  count: number
}

function ChartCard({ title, data, unit, children }: { title: string; data: Point[]; unit: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className={chartColor}>
        <div role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${d.count}`).join(', ')}`} className="h-56">
          {children}
        </div>
        {/* Table view for screen readers. */}
        <table className="sr-only">
          <caption>{title}</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td>{d.label}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export function StatusChart({ data }: { data: Point[] }) {
  return (
    <ChartCard title="Applications by status" data={data} unit="Applications">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 0 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="label" tick={tick} tickLine={false} axisLine={false} width={96} />
          <Tooltip
            cursor={{ fill: 'var(--muted)' }}
            contentStyle={tooltipStyle}
            formatter={(value) => [value, 'Applications']}
          />
          <Bar dataKey="count" fill="var(--chart)" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((d) => (
              <Cell key={d.label} fill={statusColor[d.label] ?? 'var(--chart)'} />
            ))}
            <LabelList dataKey="count" position="right" fill="var(--foreground)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function WeeklyChart({ data }: { data: Point[] }) {
  return (
    <ChartCard title="Applications per week (last 12 weeks)" data={data} unit="Applications">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
          <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--muted)' }}
            contentStyle={tooltipStyle}
            labelFormatter={(label) => `Week of ${label}`}
            formatter={(value) => [value, 'Applications']}
          />
          <Bar dataKey="count" fill="var(--chart)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
