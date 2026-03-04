/* eslint-disable prettier/prettier */
"use client";

import { rtdb } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { onValue, ref } from "firebase/database";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const slides = [
  "/assets/vca001.png",
  "/assets/vca002.png",
  "/assets/vca003.png",
  "/assets/vca004.png",
  "/assets/vca005.png",
];

const equipmentKeys = ["vca001", "vca002", "vca003", "vca004", "vca005"];

export function Carousel({
  onSlideChange,
  onAvailableCountChange,
  onOpenModal,
}: {
  onSlideChange?: (index: number) => void;
  onAvailableCountChange?: (count: number) => void;
  onOpenModal?: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>(
    {},
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    onSlideChange?.(index);
  }, [emblaApi, onSlideChange]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);
    emblaApi.scrollTo(2);
    setSelectedIndex(2);
  }, [emblaApi, onSelect]);
  useEffect(() => {
    const equipmentsRef = ref(rtdb, "equipments");
    const unsubscribe = onValue(equipmentsRef, (snapshot) => {
      const data = snapshot.val();
      const newAvailability: { [key: string]: boolean } = {};
      let availableCount = 0;

      for (const key of equipmentKeys) {
        const isAvailable = data?.[key]?.available ?? false;
        newAvailability[key] = isAvailable;
        if (isAvailable) availableCount++;
      }

      setAvailability(newAvailability);

      onAvailableCountChange?.(availableCount);
    });

    return () => unsubscribe();
  }, [onAvailableCountChange]);

  return (
    <div className="relative w-5/6 flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center w-full justify-center">
        <button
          onClick={scrollPrev}
          className="absolute left-0 z-10 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 mt-20 md:mt-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div
          className="overflow-x-hidden w-full md:w-4/6 max-w-5xl"
          ref={emblaRef}
        >
          <div className="flex">
            {slides.map((src, index) => (
              <div
                key={index}
                className="relative min-w-[70%] sm:min-w-[50%] px-4 min-h-[22rem] flex flex-col items-center"
              >
                <Image
                  src={src}
                  alt="Patinete VCA"
                  width={500}
                  height={300}
                  className={cn(
                    "object-contain w-full h-auto transition-transform duration-500 cursor-pointer rounded-xl",
                    selectedIndex === index
                      ? "scale-100"
                      : "scale-75 opacity-50",
                  )}
                />
                {selectedIndex === index && (
                  <div className="mt-4 rounded flex flex-col items-center">
                    {availability[equipmentKeys[index]] ? (
                      <button
                        onClick={onOpenModal}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        Reservar
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-500 font-medium text-sm bg-rose-50 px-4 py-2 rounded-xl">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        Indisponível
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollNext}
          className="absolute right-0 z-10 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 mt-20 md:mt-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
