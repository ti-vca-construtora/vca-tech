"use client";
import React from "react";
import classNames from "classnames";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type StatisticsType = {
  userId: string;
  nome: string;
  telefone: string;
  email?: string;
  exists: boolean;
  flowStatus: string;
  chatId: string;
};

type EstatisticasTabelaProps = {
  users: StatisticsType[];
  fn: () => void;
};

const EstatisticasTabela = ({ users, fn }: EstatisticasTabelaProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Table className="w-full rounded overflow-hidden">
        <TableHeader className="bg-neutral-200 border-2">
          <TableRow>
            <TableHead className="p-3 text-neutral-700 text-left">
              ID do Usuário
            </TableHead>
            <TableHead className="p-3 text-neutral-700 text-left">
              Nome
            </TableHead>
            <TableHead className="p-3 text-neutral-700 text-left">
              Telefone
            </TableHead>
            <TableHead className="p-3 text-neutral-700 text-left">
              Existia
            </TableHead>
            <TableHead className="p-3 text-neutral-700 text-left">
              Status do Envio
            </TableHead>
            <TableHead className="p-3 text-neutral-700 text-left">
              ID do Chat
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="border-2 max-h-[500px] overflow-y-scroll">
          {users &&
            users.map((user, index) => (
              <TableRow
                className={classNames(index % 2 !== 0 && "bg-neutral-100")}
                key={index}
              >
                <TableCell className="p-3 text-blue-600 font-semibold text-left">
                  <Link
                    href={`https://www.huggy.app/panel/contacts/${user.userId}`}
                    target="_blank"
                  >
                    {user.userId}
                  </Link>
                </TableCell>
                <TableCell className="p-3 text-neutral-700 text-left">
                  {user.nome}
                </TableCell>
                <TableCell className="p-3 text-neutral-700 text-left">
                  {user.telefone}
                </TableCell>
                <TableCell className="p-3 text-neutral-700 text-left">
                  {user.exists ? (
                    <div className="size-4 rounded-full bg-green-500"></div>
                  ) : (
                    <div className="size-4 rounded-full bg-red-500"></div>
                  )}
                </TableCell>
                <TableCell className="p-3 text-neutral-600 text-left">
                  {user.flowStatus}
                </TableCell>
                <TableCell className="p-3 text-blue-500 font-semibold text-left">
                  <Link
                    href={`https://www.huggy.app/panel/chats/${user.chatId}?tab=opened`}
                    target="_blank"
                  >
                    {user.chatId}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <Button onClick={fn} className="w-fit mt-10">
        Download XLSX
      </Button>
    </div>
  );
};

export default EstatisticasTabela;
