import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { CalendarConfig } from "./calendarconfig";
import { CancellationConfig } from "./cancellationconfig";

export function DisponibilizarHorarios() {
  return (
    <div className="min-w-72 bg-white px-4 rounded-xl mr-4 max-h-[640px] overflow-y-scroll scroll-hidden">
      <Accordion type="single" collapsible className="">
        <AccordionItem value="item-1">
          <AccordionTrigger>Configurar agenda</AccordionTrigger>
          <AccordionContent>
            <CalendarConfig />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Cancelamento</AccordionTrigger>
          <AccordionContent>
            <CancellationConfig />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
