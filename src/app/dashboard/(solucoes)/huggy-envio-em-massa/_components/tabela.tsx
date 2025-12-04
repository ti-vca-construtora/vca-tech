"use client";
import { User } from "@/types/huggy-user";
import classNames from "classnames";
import React, { Dispatch, SetStateAction } from "react";
import { TbTrash } from "react-icons/tb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TabelaProps = {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
};

const Tabela = ({ users, setUsers }: TabelaProps) => {
  const handleRemove = (telefone: string) => {
    const filteredUsers = users.filter((user) => user.telefone !== telefone);

    setUsers(filteredUsers);
  };

  return (
    <Table className="rounded shadow">
      <TableHeader className="bg-neutral-200 border-2 rounded">
        <TableRow>
          <TableHead className="flex-grow">Nome</TableHead>
          <TableHead className="flex-grow">Telefone</TableHead>
          <TableHead className="flex-grow">Excluir</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-sm border-2 rounded">
        {users &&
          users.map((user, index) => (
            <TableRow
              className={classNames(index % 2 !== 0 && "bg-neutral-50")}
              key={index}
            >
              <TableCell>{user.nome}</TableCell>
              <TableCell>{user.telefone}</TableCell>
              <TableCell>
                <TbTrash
                  onClick={() => handleRemove(user.telefone)}
                  className="text-red-500 text-lg cursor-pointer"
                />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default Tabela;
