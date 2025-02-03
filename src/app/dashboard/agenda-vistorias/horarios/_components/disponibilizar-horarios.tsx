import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function DisponibilizarHorarios() {
  return (
    <div className="min-w-72 bg-white px-4 rounded-xl mr-4">
      <Accordion type="single" collapsible className="">
        <AccordionItem value="item-1">
          <AccordionTrigger>Configurar agenda</AccordionTrigger>
          <AccordionContent>
            Disponibiliza dias para agendamento. par
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Configurar horários</AccordionTrigger>
          <AccordionContent>
            Configura horários disponíveis para agendamento. 10:30, 13:00,
            15:30, etc ... Dias mínimos e máximos para o cliente agendar
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Remarcação</AccordionTrigger>
          <AccordionContent>
            Configura parâmetros de remarcação de agenda.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Remarcação e cancelamento</AccordionTrigger>
          <AccordionContent>
            Configura parâmetros de cancelamento de agenda.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5" className="border-none">
          <AccordionTrigger>Outra configurações</AccordionTrigger>
          <AccordionContent>
            Outras configurações do agendamento.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
