import { RouteGuard } from "@/components/route-guard";
import ControleCargasTools from "./_components/options";

export default function ControleCargas() {
  return (
    <RouteGuard requiredArea="obras" requiredPermission="controle-cargas">
      <div className="size-full flex p-6">
        <ControleCargasTools />
      </div>
    </RouteGuard>
  );
}
