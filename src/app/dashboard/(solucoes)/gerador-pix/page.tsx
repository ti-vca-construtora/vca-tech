import { RouteGuard } from "@/components/route-guard";
import { ImportFile } from "./_components/import-file";
import { IndividualForm } from "./_components/individual-form";

export default function Page() {
  return (
    <RouteGuard requiredArea="financeiro" requiredPermission="gerador-pix">
      <div className="size-full flex gap-4 p-6">
        <IndividualForm />
        <ImportFile />
      </div>
    </RouteGuard>
  );
}
