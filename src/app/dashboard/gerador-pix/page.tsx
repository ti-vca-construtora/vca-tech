import { ImportFile } from './_components/import-file'
import { IndividualForm } from './_components/individual-form'

export default function Page() {
  return (
    <div className="size-full flex gap-4 p-6">
      <IndividualForm />
      <ImportFile />
    </div>
  )
}
