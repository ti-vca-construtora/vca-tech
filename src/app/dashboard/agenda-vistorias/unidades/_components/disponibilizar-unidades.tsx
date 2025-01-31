import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Checkbox } from '@/components/ui/checkbox'

const DisponibilizarUnidades = () => {
  const enterprises = [
    'DONA GILENILDA',
    'BARON CONECT',
    'BARON CONECT 2',
    'BARON CONECT 3 (TECH)',
    'BELA MORADA',
    'BEM',
    'BEM LOTES',
    'BEM PETROLINA',
    'BEM VIVER',
    'CONDE GUANAMBI',
    'CONDE RESIDENCE',
    'CONDE SEGUNDO',
    'CONDE SEGUNDO LOTES',
    'CONDE TERCEIRO',
    'DON BOA VISTA',
    'DON EUNAPOLIS',
    'DON J PEDRAL',
    'DON JUAZEIRO',
    'DON OESTE',
    'DON PARNAMIRIM',
    'DON RESIDENCIAL',
    'DONA MIRAI',
    'DONA OLIVIA',
    'DONA OLIVIA CIACCI',
    'DONA BOULEVARD',
    'DONA PETROLINA',
    'DU BEM',
    'DUQUE DLEST',
    'DUQUE RESIDENCE',
    'GMS',
    'KAHAKAI PORTO',
    'KAHAKAI ILHÉUS',
    'LORD',
    'CONDE TERCEIRO LOTES',
    'DESENVOLVIMENTO LESTE',
    'LUGGI BARREIRAS',
    'PATRIMONIAL MARQUES',
    'PIPA KAHAKAI',
    'SÃO MIGUEL',
    'UNI VILLE',
    'UNI VIVER',
    'VC BANK',
    'VCA MATRIZ',
    'VCA IMOB ADMINISRTATIVO',
    'VCA CONSTRUTORA BARREIRAS',
    'CASTELYAH',
    'DONA UNIVERSIDADE',
    'LISBOA',
    'LUGGI ALAGOINHAS',
    'LUXEMBURGO',
    'VCA ROMENIA',
    'SAN DIEGO',
    'TOQUIO',
    'UCHOA',
    'ULTRON',
    'BELLATOR',
    'VCA SERVIÇOS',
    'VELLI',
    'VELLI CARUARU',
    'VERSO RESIDENCE',
    'VILA DO MARQUES 2',
    'VILA DO MARQUES',
    'YAH',
    'DONA GILENILDA',
    'VCA VENEZUELA',
    'ECO BEACH',
    'BARON CONECT',
    'CARDOSO SANTOS',
    'DON GUANAMBI',
    'DONA BOULEVARD',
    'DUQUE RESIDENCE',
    'VCA MATRIZ',
    'VCA CONSTRUTORA PETROLINA',
    'VCA FLOW',
    'LUGGI LEM',
    'TOP GUANAMBI',
    'TOP CONQUISTA 01',
    'PEDREIRA VCA',
    'TOP CONQUISTA 02',
    'DUQUE LAVENIR',
    'MAUNAKAI ILHEUS',
    'SCULPTOR VCA',
    'UNI ALAGOINHAS',
    'UNI BARREIRAS',
    'UNI BOM JESUS',
    'UNI CARUARU',
    'UNI EUNAPOLIS',
    'UNI GUANAMBI',
    'UNI ILHEUS',
    'UNI IRECÊ',
    'UNI ITABUNA',
    'UNI JUAZEIRO',
    'UNI LUIS EDUARDO',
    'UNI MONTES CLAROS',
    'UNI PETROLINA',
    'UNI PORTO SEGURO',
    'UNI TEIXEIRA DE FREITAS',
    'UNI VIVER ALAGOINHAS',
  ]

  const selectEnterprises = () => {
    return enterprises.map((enterprise, index) => (
      <SelectItem className="cursor-pointer" key={index} value={enterprise}>
        {enterprise}
      </SelectItem>
    ))
  }

  return (
    <div className="w-full">
      <div className="flex">
        <div className="mr-2 w-1/2">
          <h1 className="font-medium ml-1">Selecione o empreendimento:</h1>

          <Select>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="SELECIONE O EMPREENDIMENTO" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem className="cursor-pointer" value="TODOS">
                TODOS
              </SelectItem>
              {selectEnterprises()}
            </SelectContent>
          </Select>
        </div>

        <div className="mx-2 w-1/4">
          <h1 className="font-medium ml-1">Selecione o bloco/quadra:</h1>

          <Select>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="SELECIONE O BLOCO" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem className="cursor-pointer" value="TODOS">
                TODOS
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-2  w-1/4">
          <h1 className="font-medium ml-1">Selecione a unidade:</h1>

          <Select>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="SELECIONE A UNIDADE" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem className="cursor-pointer" value="TODOS">
                TODOS
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Card className="flex flex-row items-center justify-between">
          <CardHeader>
            <CardTitle>{'VERSO RESIDENCE'}</CardTitle>
            <CardDescription>{'QUADRA 01 CASA 01'}</CardDescription>
          </CardHeader>
          <div className="mr-6">
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={false} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Financeiro
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={true} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Qualidade
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={true} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Relacionamento
              </label>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card className="flex flex-row items-center justify-between">
          <CardHeader>
            <CardTitle>{'VERSO RESIDENCE'}</CardTitle>
            <CardDescription>{'QUADRA 01 CASA 02'}</CardDescription>
          </CardHeader>
          <div className="mr-6">
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={true} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Financeiro
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={false} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Qualidade
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={false} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Relacionamento
              </label>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card className="flex flex-row items-center justify-between">
          <CardHeader>
            <CardTitle>{'VERSO RESIDENCE'}</CardTitle>
            <CardDescription>{'QUADRA 01 CASA 03'}</CardDescription>
          </CardHeader>
          <div className="mr-6">
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={true} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Financeiro
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={false} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Qualidade
              </label>
            </div>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox checked={true} id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Relacionamento
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DisponibilizarUnidades
