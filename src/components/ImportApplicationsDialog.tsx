import { useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseCsv } from '@/lib/csv'
import { applicationSchema, type ApplicationValues } from '@/lib/schemas'
import { supabase } from '@/lib/supabase'

const MAX_ROWS = 500
const TEMPLATE = 'company,position,status,applied_on,notes\nAcme,Frontend Developer,applied,2026-01-15,Referred by a friend\n'
const ALIASES: Record<string, string> = { date: 'applied_on', application_date: 'applied_on' }

interface ParsedFile {
  valid: ApplicationValues[]
  errors: { line: number; message: string }[]
  fatal?: string
}

const today = () => new Date().toLocaleDateString('en-CA')

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

function parseApplications(text: string): ParsedFile {
  const rows = parseCsv(text)
  if (rows.length === 0) return { valid: [], errors: [], fatal: 'The file is empty.' }

  const headers = rows[0].map((h) => {
    const key = h.trim().toLowerCase().replace(/\s+/g, '_')
    return ALIASES[key] ?? key
  })
  if (!headers.includes('company') || !headers.includes('position')) {
    return { valid: [], errors: [], fatal: 'The first row must be a header with at least "company" and "position".' }
  }
  if (rows.length - 1 > MAX_ROWS) {
    return { valid: [], errors: [], fatal: `Too many rows. The limit is ${MAX_ROWS} per file.` }
  }

  const valid: ApplicationValues[] = []
  const errors: ParsedFile['errors'] = []
  rows.slice(1).forEach((cells, index) => {
    const line = index + 2
    const get = (name: string) => (cells[headers.indexOf(name)] ?? '').trim()
    const candidate = {
      company: get('company'),
      position: get('position'),
      status: get('status').toLowerCase() || 'applied',
      applied_on: get('applied_on') || today(),
      notes: get('notes'),
    }
    const result = applicationSchema.safeParse(candidate)
    if (!result.success) {
      errors.push({ line, message: result.error.issues[0].message })
    } else if (!isRealDate(result.data.applied_on)) {
      errors.push({ line, message: 'Date must be a real date in YYYY-MM-DD format' })
    } else {
      valid.push(result.data)
    }
  })
  return { valid, errors }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

export function ImportApplicationsDialog({ open, onOpenChange, onImported }: Props) {
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [importing, setImporting] = useState(false)

  function handleOpenChange(next: boolean) {
    if (!next) setParsed(null)
    onOpenChange(next)
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setParsed(parseApplications(await file.text()))
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'applications-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function runImport() {
    if (!parsed || parsed.valid.length === 0) return
    setImporting(true)
    // user_id is not sent: the database fills it in with auth.uid().
    const rows = parsed.valid.map((r) => ({ ...r, notes: r.notes.trim() || null }))
    const { error } = await supabase.from('applications').insert(rows)
    setImporting(false)
    if (error) return void toast.error(error.message)
    toast.success(`Imported ${rows.length} application${rows.length === 1 ? '' : 's'}`)
    handleOpenChange(false)
    onImported()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import applications from CSV</DialogTitle>
          <DialogDescription>
            Columns: company and position (required), status, applied_on (YYYY-MM-DD) and notes (optional).
            Empty status becomes "applied" and an empty date becomes today.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV file</Label>
            <Input id="csv-file" type="file" accept=".csv,text/csv" onChange={onFile} />
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={downloadTemplate}>
              Download a template
            </Button>
          </div>

          {parsed?.fatal && <p className="text-sm text-destructive">{parsed.fatal}</p>}
          {parsed && !parsed.fatal && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>{parsed.valid.length}</strong> row{parsed.valid.length === 1 ? '' : 's'} ready to import
                {parsed.errors.length > 0 && <>, {parsed.errors.length} with errors (will be skipped)</>}.
              </p>
              {parsed.errors.length > 0 && (
                <ul className="max-h-32 list-disc space-y-1 overflow-y-auto pl-5 text-destructive">
                  {parsed.errors.map((e) => (
                    <li key={e.line}>
                      Line {e.line}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={runImport} disabled={importing || !parsed || parsed.valid.length === 0}>
            {importing ? 'Importing...' : `Import ${parsed?.valid.length ?? 0} rows`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
