import { FormField } from '../../components/common'
import type { RecordFormValues, Status } from '../types'

export function ClientFormFields({ form, setField }: { form: RecordFormValues; setField: (field: keyof RecordFormValues, value: string | number | string[]) => void }) {
  return <>
    <FormField label="Nom" required><input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ex. Acme Studio" /></FormField>
    <FormField label="Description"><textarea rows={3} value={form.description ?? ''} onChange={(event) => setField('description', event.target.value)} placeholder="Décrivez ce client..." /></FormField>
    <FormField label="Statut" required><select value={form.status ?? 'Activated'} onChange={(event) => setField('status', event.target.value as Status)}>{(['Activated', 'Deactivated', 'Pending'] as const).map((status) => <option key={status} value={status}>{status}</option>)}</select></FormField>
  </>
}
