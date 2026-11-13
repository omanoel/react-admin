import { FormField } from '../../components/common'
import type { RecordFormValues } from '../types'

export function ApiFormFields({ form, setField }: { form: RecordFormValues; setField: (field: keyof RecordFormValues, value: string | number | string[]) => void }) {
  return <>
    <FormField label="Nom" required><input autoFocus value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ex. Customer profile" /></FormField>
    <FormField label="Description" required><textarea rows={3} value={form.description ?? ''} onChange={(event) => setField('description', event.target.value)} placeholder="Décrivez les fonctionnalités de cette API..." /></FormField>
  </>
}
