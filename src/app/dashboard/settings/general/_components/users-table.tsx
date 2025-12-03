import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/store/auth-store";
import { MoreHorizontalIcon } from "lucide-react";

type UsersTableProps = {
  users: User[];
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Table className="p-2 rounded bg-white">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[350px]">Nome</TableHead>
          <TableHead className="w-[350px]">E-mail</TableHead>
          <TableHead className="w-[350px]">Departamento</TableHead>
          <TableHead className="flex-grow">Cargo</TableHead>
          <TableHead className="w-16 text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name || "Não cadastrado"}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>{item.department || "Não cadastrado"}</TableCell>
            <TableCell>{item.role}</TableCell>
            <TableCell className="text-center">
              <MoreHorizontalIcon />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
