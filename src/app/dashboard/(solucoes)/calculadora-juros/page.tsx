import { RouteGuard } from "@/components/route-guard";
import { FormContainer } from "./_components/form-container";

export default function CalculadoraJuros() {
  return (
    <RouteGuard requiredArea="financeiro" requiredPermission="avp">
      <div className="w-full h-full flex p-6">
        <FormContainer />
      </div>
    </RouteGuard>
  );
}
