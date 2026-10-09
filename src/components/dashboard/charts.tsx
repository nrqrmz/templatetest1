import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// One series, one hue: identity comes from the axis labels, so no legend is needed.
// Blue from the validated reference palette (light / dark steps), set as a CSS variable.
const chartColor = '[--chart:#2a78d6] dark:[--chart:#3987e5]'

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
