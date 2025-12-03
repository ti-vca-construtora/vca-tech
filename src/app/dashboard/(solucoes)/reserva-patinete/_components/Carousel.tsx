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
          className="absolute left-0 z-10 bg-green-600 text-white hover:text-purple-900 hover:bg-white shadow-md rounded-full p-2 m-2 transition mt-20 md:mt-0"
        >
          <span className="text-xl font-bold">&#8592;</span>
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
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Reservar
                      </button>
                    ) : (
                      <span className="text-red-600 font-semibold">
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
          className="absolute right-0 z-10 bg-green-600 text-white hover:text-purple-900 hover:bg-white shadow-md rounded-full p-2 m-2 transition mt-20 md:mt-0"
        >
          <span className="text-xl font-bold">&#8594;</span>
        </button>
      </div>
    </div>
  );
}
