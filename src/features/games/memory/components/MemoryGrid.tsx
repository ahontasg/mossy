import { MemoryCard } from "./MemoryCard";
import type { MemoryCard as MemoryCardType } from "../lib/memoryEngine";
import type { SpecimenDefinition } from "../../../../types";

interface MemoryGridProps {
  cards: MemoryCardType[];
  flippedIds: number[];
  specimenMap: Map<string, SpecimenDefinition>;
  onCardTap: (cardId: number) => void;
  disabled: boolean;
}

export function MemoryGrid({ cards, flippedIds, specimenMap, onCardTap, disabled }: MemoryGridProps) {
  return (
    <div
      className="grid gap-1.5 px-1"
      style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
    >
      {cards.map((card) => {
        const specimen = specimenMap.get(card.specimenId);
        const isFlipped = card.matched || flippedIds.includes(card.id);
        return (
          <MemoryCard
            key={card.id}
            card={card}
            specimen={specimen}
            isFlipped={isFlipped}
            onTap={() => onCardTap(card.id)}
            disabled={disabled || card.matched || isFlipped}
          />
        );
      })}
    </div>
  );
}
