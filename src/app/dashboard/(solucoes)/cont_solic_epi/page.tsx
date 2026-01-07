"use client";

export default function ContSolicEpi() {
  return (
    <RouteGuard requiredArea="sesmt" requiredPermission="epi">
      <div className="w-full h-full flex flex-col gap-6 p-6">
        <ContSolicEpi />
      </div>
    </RouteGuard>
  );
}
