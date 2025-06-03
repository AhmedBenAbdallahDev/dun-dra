'use client';

import React from 'react';
import Image from 'next/image';
import { useGameStore, type LootItem } from '@/stores/gameStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useMiscStore } from '@/stores/miscStore';

interface LootUIProps {
  onAnswer: (answer: string) => void;
}

export default function LootUI({ onAnswer }: LootUIProps) {
  const { gameData, clearLootBox, setEvent } = useGameStore();
  const { addInventoryItem, addSpell, addGold } = useCharacterStore();
  const { loading } = useMiscStore();

  const handleMouseMove = (event: React.MouseEvent, item: LootItem) => {
    // For now, we'll implement basic tooltip logic
    // In the future, this could be enhanced with a proper tooltip system
    console.log('Item hovered:', item.name);
  };

  const handleMouseLeave = () => {
    // Hide tooltip logic would go here
  };

  const lootItem = (item: LootItem) => {
    if (item.type === 'weapon' || item.type === 'potion') {
      addInventoryItem(item);
    } else if (
      item.type === 'destruction spell' ||
      item.type === 'healing spell' ||
      item.type === 'unique spell'
    ) {
      addSpell(item);
    } else if (item.type === 'currency') {
      const amount = item.amount || 0;
      addGold(amount);
    } else {
      addInventoryItem(item);
    }

    // Remove the looted item from lootBox
    const newLootBox = gameData.lootBox.filter((lootItem) => lootItem.name !== item.name);
    useGameStore.getState().setLootBox(newLootBox);

    if (newLootBox.length === 0) {
      onAnswer("I'll loot it all (clear the gameData.lootBox array in your next response!)");
      setEvent({ lootMode: false });
    }
  };

  const lootAll = () => {
    gameData.lootBox.forEach((item) => {
      if (item.type === 'weapon' || item.type === 'potion') {
        addInventoryItem(item);
      } else if (
        item.type === 'destruction spell' ||
        item.type === 'healing spell' ||
        item.type === 'unique spell'
      ) {
        addSpell(item);
      } else if (item.type === 'currency') {
        const amount = item.amount || 0;
        addGold(amount);
      } else {
        addInventoryItem(item);
      }
    });

    clearLootBox();

    onAnswer(
      "I've looted all. What should i do now..? (clear the gameData.lootBox array in your next response!)"
    );
    setEvent({ lootMode: false });
  };

  const getItemImage = (item: LootItem) => {
    if (item.type === 'weapon' && item.weaponClass) {
      return `/images/${item.weaponClass}.svg`;
    } else if (item.element) {
      return `/images/${item.element}.svg`;
    } else if (item.type === 'potion' || item.type === 'currency') {
      return `/images/${item.type}.svg`;
    } else {
      return '/images/item.svg';
    }
  };

  return (
    <div className="loot-ui">
      <div className="loot-box">
        <h3>
          You&apos;re <span className="g-span">looting.</span>
        </h3>

        <div className="buyables-box">
          {!gameData.lootBox?.length ? (
            <p>loading...</p>
          ) : (
            <>
              {gameData.lootBox.map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  disabled={loading}
                  className="item-button"
                  onClick={() => lootItem(item)}
                  onMouseMove={(event) => handleMouseMove(event, item)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Image
                    className="buyable-img"
                    src={getItemImage(item)}
                    alt="a lootable item"
                    width={40}
                    height={40}
                  />
                </button>
              ))}
              <button
                disabled={loading}
                onClick={lootAll}
                className="loot-all-btn"
              >
                Loot All
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .loot-ui {
          min-height: 36.9%;
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          width: 100%;
          height: 100%;
          margin-inline: auto;
          gap: 1rem;
          backdrop-filter: blur(2px);
        }

        .loot-box h3 {
          text-align: center;
          font-weight: 300;
          font-size: 1.3rem;
        }

        .loot-box {
          background-color: rgba(31, 31, 31, 0.841);
          border-radius: 0.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-around;
          padding: 0 0.5rem;
          align-items: center;
          padding-bottom: 1rem;
        }

        .item-button {
          border: none;
          background-color: transparent;
        }

        .buyables-box {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .loot-box button {
          background-color: rgb(128 128 128 / 29%);
          border: none;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 0.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loot-box button:hover {
          background-color: rgb(128 128 128 / 50%);
        }

        .loot-box button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loot-all-btn {
          padding: 0.5rem 1rem;
          width: auto !important;
          height: auto !important;
          font-size: 0.9rem;
          color: white;
        }

        .buyable-img {
          width: 65%;
          height: 65%;
        }

        .g-span {
          color: #3fcf8e;
        }

        @media (orientation: portrait) {
          .loot-ui {
            min-height: 90%;
          }
        }
      `}</style>
    </div>
  );
}
