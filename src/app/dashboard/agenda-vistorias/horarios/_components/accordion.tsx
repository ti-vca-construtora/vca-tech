import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function AccordionComp() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white rounded-md px-4 py-2"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Configuração de Calendário</AccordionTrigger>
        <AccordionContent>
          Configuração de calendário dias, quantidade, prazos mínimo e máximo,
          inputs e sets.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Configurações de Horários</AccordionTrigger>
        <AccordionContent>
          Configurações e definição de horários, 08:30, 09:30, 14:30, etc ...
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Remarcação</AccordionTrigger>
        <AccordionContent>Horas para remarcação, etc ...</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Cancelamento</AccordionTrigger>
        <AccordionContent>Regras de cancelamento, etc ...</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5" className="border-none">
        <AccordionTrigger>Outras Configurações</AccordionTrigger>
        <AccordionContent>Outras configurações default</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
