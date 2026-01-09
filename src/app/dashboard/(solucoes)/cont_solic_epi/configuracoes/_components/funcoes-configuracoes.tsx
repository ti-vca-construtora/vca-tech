"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "vca-tech:sesmt:epi-funcoes:v1";

const DEFAULT_FUNCOES: string[] = [
  "ADMINISTRATIVO",
  "ALVENARIA (PEDREIROS)",
  "ALVENARIA (SERVENTES)",
  "ALMOXARIFADO - CASA DE QUÍMICOS (ALMOXARIFE E AUXILIAR DE ALMOXARIFE)",
  "ARMAÇÃO (ARMADORES E AUXILIARES)",
  "ARMAÇÃO (SERVENTES)",
  "BETONEIRA (OPERADORES DE BETONEIRA)",
  "BETONEIRA (SERVENTES)",
  "CARPINTARIA (CARPINTEIROS E AUXILIARES)",
  "CARPINTARIA (SERVENTES)",
  "ELÉTRICA (ELETRICISTAS E AUXILIARES)",
  "ELÉTRICA (SERVENTES)",
  "HIDRÁULICA (ENCANADORES E AUXILIARES)",
  "HIDRÁULICA (SERVENTES)",
  "IMPERMEABILIZAÇÃO (SERVENTES)",
  "LIMPEZA (AUXILIARES DE SERVIÇOS GERAIS E SERVENTESS)",
  "OP DE MÁQUINAS",
  "PINTURA (PINTORES E AUXILIARES)",
  "PINTURAS (SERVENTES)",
  "RESERVATÓRIO (PEDREIROS)",
  "RESERVATÓRIO (SERVENTES)",
  "SOLDAGEM (SERRALHEIROS, SOLDADORES E AUXILIARES)",
  "SOLDAGEM (SERVENTES)",
];

type MonthlyFactor = number;

type DefaultFuncaoItem = {
  epi: string;
  monthlyFactor: MonthlyFactor;
};

// Valores projetados padrão por EPI (quantidades para funcionários projetados)
const PROJECTED_QUANTITIES: Record<string, number> = {
  "ABAFADOR DE RUÍDO PARA ACOPLAR": 1,
  "AVENTAL DE RASPA": 2,
  "BOTA DE ADMINISTRATIVO": 1,
  "BOTA DE BORRACHA": 1,
  "BOTA DE COURO": 1,
  "CALÇA DA FARDA DA EMPRESA": 2,
  "CAMISA DA FARDA": 2,
  "CAPACETE (DETALHE AMARELO)": 1,
  "CAPACETE (DETALHE AZUL)": 1,
  "CAPACETE (DETALHE BRANCO)": 1,
  "CAPACETE (DETALHE CINZA)": 1,
  "CAPACETE (DETALHE MARROM)": 1,
  "CAPACETE (DETALHE VERDE)": 1,
  "CAPACETE (DETALHE VERMELHO)": 1,
  "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)": 1,
  "FARDAMENTO ANTI-CHAMAS (AVENTAL COM MANGAS) - C.A. 35236": 2,
  "FILTRO PARA MÁSCARA": 1,
  "RESPIRADOR FACIAL 1/4  COM FILTRO": 1,
  "JOELHEIRA DE PROTEÇÃO": 1,
  "LENTE FILTRO DE LUZ PARA MÁSCARA DE SOLDA": 1,
  "LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895": 4,
  "LUVA DE VAQUETA": 1,
  "LUVA EM HELANCA PU": 4,
  "LUVA LÁTEX - LARANJA REFORÇADA": 4,
  "LUVA VULCANIZADA": 3,
  "MACACÃO DE PROTEÇÃO AZUL": 1,
  "MÁSCARA DESCARTÁVEL": 4,
  "MASCARA SOLDA AUTOMÁTICA S/ REGULAGEM 3 A 11 V8": 1,
  "ÓCULOS AMPLA VISÃO": 1,
  "ÓCULOS DE PROTEÇÃO ESCURO": 1,
  "ÓCULOS DE PROTEÇÃO TRANSPARENTE": 1,
  "PERNEIRA DE COURO SINTÉTICO": 1,
  "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)": 1,
  "PROTETOR AURICULAR TIPO CONCHA": 1,
  "PROTETOR SOLAR": 1,
};

const DEFAULT_FUNCOES_ITEMS: Record<string, DefaultFuncaoItem[]> = {
  "ADMINISTRATIVO": [
    { epi: "BOTA DE ADMINISTRATIVO", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "ALVENARIA (PEDREIROS)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE VERMELHO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "LUVA VULCANIZADA", monthlyFactor: 3 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "ALVENARIA (SERVENTES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "LUVA VULCANIZADA", monthlyFactor: 3 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "ALMOXARIFADO - CASA DE QUÍMICOS (ALMOXARIFE E AUXILIAR DE ALMOXARIFE)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "ARMAÇÃO (ARMADORES E AUXILIARES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE MARROM)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA DE VAQUETA", monthlyFactor: 2 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "ARMAÇÃO (SERVENTES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    {
      epi: "LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895",
      monthlyFactor: 3,
    },
    { epi: "LUVA DE VAQUETA", monthlyFactor: 2 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "BETONEIRA (OPERADORES DE BETONEIRA)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE VERMELHO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "BETONEIRA (SERVENTES)": [
    { epi: "ABAFADOR DE RUÍDO PARA ACOPLAR", monthlyFactor: 0.333333333 },
    { epi: "AVENTAL DE RASPA", monthlyFactor: 0.333333333 },
    { epi: "BOTA DE BORRACHA", monthlyFactor: 0.333333333 },
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "CARPINTARIA (CARPINTEIROS E AUXILIARES)": [
    { epi: "ABAFADOR DE RUÍDO PARA ACOPLAR", monthlyFactor: 0.333333333 },
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE VERDE)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    {
      epi: "LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895",
      monthlyFactor: 3,
    },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "CARPINTARIA (SERVENTES)": [
    { epi: "ABAFADOR DE RUÍDO PARA ACOPLAR", monthlyFactor: 0.333333333 },
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    {
      epi: "LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895",
      monthlyFactor: 3,
    },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "ELÉTRICA (ELETRICISTAS E AUXILIARES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE CINZA)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "ELÉTRICA (SERVENTES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "HIDRÁULICA (ENCANADORES E AUXILIARES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AZUL)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "HIDRÁULICA (SERVENTES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "IMPERMEABILIZAÇÃO (SERVENTES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MACACÃO DE PROTEÇÃO AZUL", monthlyFactor: 2 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "LIMPEZA (AUXILIARES DE SERVIÇOS GERAIS E SERVENTESS)": [
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "OP DE MÁQUINAS": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE VERMELHO)", monthlyFactor: 0.083333333 },
    { epi: "PROTETOR AURICULAR TIPO CONCHA", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "PINTURA (PINTORES E AUXILIARES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE VERMELHO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "PINTURAS (SERVENTES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "MÁSCARA DESCARTÁVEL", monthlyFactor: 10 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "RESERVATÓRIO (PEDREIROS)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE VERMELHO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "LUVA VULCANIZADA", monthlyFactor: 3 },
    { epi: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "RESERVATÓRIO (SERVENTES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    { epi: "RESPIRADOR FACIAL 1/4  COM FILTRO", monthlyFactor: 0.333333333 },
    { epi: "LUVA LÁTEX - LARANJA REFORÇADA", monthlyFactor: 4 },
    { epi: "LUVA VULCANIZADA", monthlyFactor: 3 },
    { epi: "ÓCULOS DE PROTEÇÃO ESCURO", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "SOLDAGEM (SERRALHEIROS, SOLDADORES E AUXILIARES)": [
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE MARROM)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    {
      epi: "FARDAMENTO ANTI-CHAMAS (AVENTAL COM MANGAS) - C.A. 35236",
      monthlyFactor: 0.083333333,
    },
    { epi: "LUVA DE VAQUETA", monthlyFactor: 2 },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "MASCARA SOLDA AUTOMÁTICA S/ REGULAGEM 3 A 11 V8", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
  "SOLDAGEM (SERVENTES)": [
    { epi: "AVENTAL DE RASPA", monthlyFactor: 0.333333333 },
    { epi: "BOTA DE COURO", monthlyFactor: 0.333333333 },
    { epi: "CALÇA DA FARDA DA EMPRESA", monthlyFactor: 0.25 },
    { epi: "CAMISA DA FARDA", monthlyFactor: 0.25 },
    { epi: "CAPACETE (DETALHE AMARELO)", monthlyFactor: 0.083333333 },
    {
      epi: "CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)",
      monthlyFactor: 0.25,
    },
    {
      epi: "FARDAMENTO ANTI-CHAMAS (AVENTAL COM MANGAS) - C.A. 35236",
      monthlyFactor: 0.083333333,
    },
    { epi: "LUVA DE VAQUETA", monthlyFactor: 2 },
    { epi: "LUVA EM HELANCA PU", monthlyFactor: 4 },
    { epi: "MASCARA SOLDA AUTOMÁTICA S/ REGULAGEM 3 A 11 V8", monthlyFactor: 1 },
    { epi: "PROTETOR AURICULAR TAPA OUVIDOS (PLUG)", monthlyFactor: 3 },
    { epi: "PROTETOR SOLAR", monthlyFactor: 0.15 },
  ],
};

type FuncaoEpiItem = {
  epi: string;
  intervalMonths: number;
  quantityPerEmployee: number;
};

type FuncaoEpiConfig = {
  id: string;
  name: string;
  items: FuncaoEpiItem[];
};

function normalizeName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function genId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatIntervalMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 meses";
  
  if (months < 1) {
    const dias = Math.round(months * 30);
    return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  }
  
  if (months >= 12 && months % 12 === 0) {
    const anos = months / 12;
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  }
  
  const roundedMonths = Math.round(months * 100) / 100;
  return `${roundedMonths} ${roundedMonths === 1 ? 'mês' : 'meses'}`;
}

function loadFuncoes(): FuncaoEpiConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x) => {
        const name = normalizeName(String((x as any).name ?? ""));
        const id = String((x as any).id ?? genId());
        const itemsRaw = Array.isArray((x as any).items) ? (x as any).items : [];
        const items: FuncaoEpiItem[] = itemsRaw
          .filter((i: any) => i && typeof i === "object")
          .map((i: any) => {
            const epi = normalizeName(String(i.epi ?? ""));
            const intervalMonths = Number(i.intervalMonths);
            const quantityPerEmployee = Number(i.quantityPerEmployee);

            return {
              epi,
              intervalMonths: Number.isFinite(intervalMonths) && intervalMonths > 0 ? intervalMonths : 3,
              quantityPerEmployee: Number.isFinite(quantityPerEmployee) && quantityPerEmployee >= 0 ? quantityPerEmployee : 1,
            };
          })
          .filter((i: FuncaoEpiItem) => i.epi);

        return { id, name, items } as FuncaoEpiConfig;
      })
      .filter((x) => x.name);
  } catch {
    return [];
  }
}

function saveFuncoes(funcoes: FuncaoEpiConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(funcoes));
}

export function FuncoesConfiguracoes({ epiItems }: { epiItems: string[] }) {
  const { toast } = useToast();
  const [funcoes, setFuncoes] = useState<FuncaoEpiConfig[]>([]);
  const [newFuncao, setNewFuncao] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedEpi, setSelectedEpi] = useState<string>("");
  const [intervalMonths, setIntervalMonths] = useState<string>("3");
  const [quantityPerEmployee, setQuantityPerEmployee] = useState<string>("1");

  useEffect(() => {
    const loaded = loadFuncoes();
    if (loaded.length === 0) {
      const seeded: FuncaoEpiConfig[] = DEFAULT_FUNCOES.map((name) => {
        const normalizedName = normalizeName(name);
        const defaults = DEFAULT_FUNCOES_ITEMS[normalizedName] ?? [];

        const items: FuncaoEpiItem[] = defaults
          .map((d) => {
            const epi = normalizeName(d.epi);
            const intervalMonths = 1 / d.monthlyFactor;
            return { 
              epi, 
              intervalMonths,
              quantityPerEmployee: PROJECTED_QUANTITIES[epi] || 1
            };
          })
          .filter((i) => i.epi)
          .sort((a, b) => a.epi.localeCompare(b.epi));

        return {
          id: genId(),
          name: normalizedName,
          items,
        };
      }).sort((a, b) => a.name.localeCompare(b.name));

      saveFuncoes(seeded);
      setFuncoes(seeded);
      return;
    }

    const normalized = loaded
      .map((f) => ({
        ...f,
        name: normalizeName(f.name),
        items: (f.items ?? [])
          .map((i) => ({
            ...i,
            epi: normalizeName(i.epi),
          }))
          .filter((i) => i.epi),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setFuncoes(normalized);
  }, []);

  const editing = useMemo(() => {
    if (!editingId) return null;
    return funcoes.find((f) => f.id === editingId) ?? null;
  }, [editingId, funcoes]);

  const canAddFuncao = useMemo(() => {
    const name = normalizeName(newFuncao);
    if (!name) return false;
    return !funcoes.some((f) => f.name === name);
  }, [newFuncao, funcoes]);

  const handleAddFuncao = () => {
    const name = normalizeName(newFuncao);
    if (!name) {
      toast({
        title: "Informe o nome da função",
        description: "Digite o nome da função antes de adicionar.",
        variant: "destructive",
      });
      return;
    }

    if (funcoes.some((f) => f.name === name)) {
      toast({
        title: "Função já cadastrada",
        description: "Essa função já existe na lista.",
        variant: "destructive",
      });
      return;
    }

    const next = [...funcoes, { id: genId(), name, items: [] }].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    setFuncoes(next);
    saveFuncoes(next);
    setNewFuncao("");

    toast({
      title: "Função adicionada",
      description: name,
    });
  };

  const handleRemoveFuncao = (id: string) => {
    const toRemove = funcoes.find((f) => f.id === id);
    const next = funcoes.filter((f) => f.id !== id);
    setFuncoes(next);
    saveFuncoes(next);

    toast({
      title: "Função removida",
      description: toRemove?.name,
    });
  };

  const handleAddEpiToFuncao = () => {
    if (!editing) return;

    const epi = normalizeName(selectedEpi);

    if (!epi) {
      toast({
        title: "Selecione um EPI",
        description: "Escolha um EPI para adicionar à função.",
        variant: "destructive",
      });
      return;
    }

    if (editing.items.some((i) => i.epi === epi)) {
      toast({
        title: "EPI já adicionado",
        description: "Esse EPI já está associado a essa função.",
        variant: "destructive",
      });
      return;
    }

    const intMonths = parseFloat(intervalMonths);
    if (!Number.isFinite(intMonths) || intMonths <= 0) {
      toast({
        title: "Intervalo inválido",
        description: "Informe um número maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const qtyPerEmp = parseInt(quantityPerEmployee, 10);
    if (!Number.isFinite(qtyPerEmp) || qtyPerEmp < 1) {
      toast({
        title: "Quantidade inválida",
        description: "Informe um número inteiro maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const updated: FuncaoEpiConfig = {
      ...editing,
      items: [
        ...editing.items,
        { 
          epi, 
          intervalMonths: intMonths,
          quantityPerEmployee: qtyPerEmp
        },
      ].sort(
        (a, b) => a.epi.localeCompare(b.epi),
      ),
    };

    const next = funcoes
      .map((f) => (f.id === updated.id ? updated : f))
      .sort((a, b) => a.name.localeCompare(b.name));

    setFuncoes(next);
    saveFuncoes(next);

    setSelectedEpi("");
    setIntervalMonths("3");
    setQuantityPerEmployee("1");

    toast({
      title: "EPI vinculado",
      description: `${epi} • Intervalo: ${formatIntervalMonths(intMonths)} • Qtd: ${qtyPerEmp}`,
    });
  };

  const handleRemoveEpiFromFuncao = (epi: string) => {
    if (!editing) return;

    const updated: FuncaoEpiConfig = {
      ...editing,
      items: editing.items.filter((i) => i.epi !== epi),
    };

    const next = funcoes
      .map((f) => (f.id === updated.id ? updated : f))
      .sort((a, b) => a.name.localeCompare(b.name));

    setFuncoes(next);
    saveFuncoes(next);

    toast({
      title: "EPI removido da função",
      description: epi,
    });
  };

  const handleResetFuncoes = () => {
    const seeded: FuncaoEpiConfig[] = DEFAULT_FUNCOES.map((name) => ({
      id: genId(),
      name: normalizeName(name),
      items: [],
    })).sort((a, b) => a.name.localeCompare(b.name));

    setFuncoes(seeded);
    saveFuncoes(seeded);

    toast({
      title: "Lista restaurada",
      description: "A lista base de funções foi restaurada.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Configurações • Funções</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Restaurar lista base</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar lista base?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso vai substituir a lista atual de funções pela lista padrão.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetFuncoes}>
                  Restaurar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome da função"
              value={newFuncao}
              onChange={(e) => setNewFuncao(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddFuncao();
              }}
            />
            <Button onClick={handleAddFuncao} disabled={!canAddFuncao}>
              Adicionar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Para cada função, você pode definir EPIs padrão e o tempo de troca.
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead className="w-[120px] text-center">EPIs</TableHead>
                <TableHead className="w-[220px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Nenhuma função cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                funcoes.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="text-center">{f.items.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={editingId === f.id}
                          onOpenChange={(open) => {
                            setEditingId(open ? f.id : null);
                            setSelectedEpi("");
                            setIntervalMonths("3");
                            setQuantityPerEmployee("1");
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Configurar EPIs
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{f.name}</DialogTitle>
                              <DialogDescription>
                                Defina os EPIs padrão e o tempo de troca. O sistema calcula o
                                fator mensal assim: dia = 30/dias, semana = 4/semanas, mês = 1/meses,
                                ano = 1/(12*anos).
                              </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col gap-4">
                              <div className="text-xs text-muted-foreground mb-2">
                                <strong>Tempo de troca (Efetivos):</strong> usado para calcular necessidade mensal. <strong>Qtd. Projetada:</strong> quantidade fixa por funcionário projetado.
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <div className="min-w-[200px] flex-1">
                                  <Select value={selectedEpi} onValueChange={(v) => {
                                    setSelectedEpi(v);
                                    setQuantityPerEmployee(String(PROJECTED_QUANTITIES[v] || 1));
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um EPI" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {epiItems.map((name) => (
                                        <SelectItem key={name} value={name}>
                                          {name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Input
                                  className="w-[140px]"
                                  type="number"
                                  step="0.01"
                                  min="0.1"
                                  placeholder="Intervalo (meses)"
                                  value={intervalMonths}
                                  onChange={(e) => setIntervalMonths(e.target.value)}
                                  title="Intervalo de reposição em meses (ex: 3, 0.5, 0.364)"
                                />
                                <Input
                                  className="w-[100px]"
                                  inputMode="numeric"
                                  placeholder="Qtd Proj."
                                  value={quantityPerEmployee}
                                  onChange={(e) => setQuantityPerEmployee(e.target.value)}
                                  title="Quantidade para funcionários projetados"
                                />
                                <Button onClick={handleAddEpiToFuncao}>Adicionar EPI</Button>
                              </div>

                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>EPI</TableHead>
                                      <TableHead>Tempo de troca</TableHead>
                                      <TableHead className="w-[100px]">Fator/mês</TableHead>
                                      <TableHead className="w-[100px]">Qtd. Proj.</TableHead>
                                      <TableHead className="w-[140px] text-right">Ações</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {(editing?.items ?? []).length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                          Nenhum EPI vinculado a essa função.
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      (editing?.items ?? []).map((i) => (
                                        <TableRow key={i.epi}>
                                          <TableCell className="font-medium">{i.epi}</TableCell>
                                          <TableCell>{formatIntervalMonths(i.intervalMonths)}</TableCell>
                                          <TableCell>{(1 / i.intervalMonths).toFixed(4)}</TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="1"
                                              className="w-[80px]"
                                              value={i.quantityPerEmployee || 1}
                                              onChange={(e) => {
                                                if (!editing) return;
                                                const val = parseInt(e.target.value, 10);
                                                if (!Number.isFinite(val) || val < 1) return;
                                                const updated: FuncaoEpiConfig = {
                                                  ...editing,
                                                  items: editing.items.map(item => 
                                                    item.epi === i.epi 
                                                      ? { ...item, quantityPerEmployee: val }
                                                      : item
                                                  )
                                                };
                                                const next = funcoes.map(f => f.id === updated.id ? updated : f);
                                                setFuncoes(next);
                                                saveFuncoes(next);
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => handleRemoveEpiFromFuncao(i.epi)}
                                            >
                                              Remover
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                Fechar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Remover
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover função?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Confirma a remoção de: <strong>{f.name}</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveFuncao(f.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
