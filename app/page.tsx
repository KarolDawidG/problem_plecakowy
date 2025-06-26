'use client';
import { useState } from "react";
import { container, heading, input, button, form, label, chartBar, chartContainer, resultHeading, resultsContainer, resultBox, value, items, weight } from "./lib/styles";

// (a) Struktura chromosomu
interface Chromoson {
  genes: number[];     // tablica 0/1 – które przedmioty wybrane
  value: number;       // suma wartości wybranych przedmiotów (fitness)
  weight: number;      // suma wag wybranych przedmiotów
}

const losowyChromosone = (length: number): number[] => {
  const chrom = Array.from({ length }, () => Math.random() > 0.5 ? 1 : 0);
  console.log("Losowy chromosom:", chrom);
  return chrom;
};

const tworzeniePopulacji = (size: number, chromLength: number): Chromoson[] => {
  const populacja = Array.from({ length: size }, () => ({
    genes: losowyChromosone(chromLength),
    value: 0,
    weight: 0
  }));
  console.log("Utworzona populacja:", populacja);
  return populacja;
};

const VALUES = [360, 83, 59, 130, 431, 67, 230, 52, 93, 125, 670, 892, 600, 38, 48, 147, 78,
256, 63, 17, 120, 164, 432, 35, 92, 110, 22, 42, 50, 323, 514, 28, 87, 73, 78, 15, 26, 78, 210, 36, 85,
189, 274, 43, 33, 10, 19, 389, 276, 312];
const WEIGHTS = [7, 0, 30, 22, 80, 94, 11, 81, 70, 64, 59, 18, 0, 36, 3, 8, 15, 42, 9, 0, 42, 47, 52, 32,
26, 48, 55, 6, 29, 84, 2, 4, 18, 56, 7, 29, 93, 44, 71, 3, 86, 66, 31, 65, 0, 79, 20, 65, 52, 13];
const CAPACITY = 850;

const fitness = (chrom: Chromoson): Chromoson => {
  let value = 0;
  let weight = 0;
  for (let i = 0; i < chrom.genes.length; i++) {
    if (chrom.genes[i]) {
      value += VALUES[i];
      weight += WEIGHTS[i];
    }
  }
  if (weight > CAPACITY) value = 0;
  const result = { genes: chrom.genes, value, weight };
  console.log("Ocena chromosomu (fitness):", result);
  return result;
};

function turniejowaSelekcja(populacja: Chromoson[], turniej = 3): Chromoson {
  const wybrani = Array.from({ length: turniej }, () =>
    populacja[Math.floor(Math.random() * populacja.length)]
  );
  console.log("Chromosomy wybrane do turnieju:", wybrani);
  const winner = wybrani.reduce((best, current) =>
    current.value > best.value ? current : best
  );
  console.log("Zwycięzca turnieju:", winner);
  return winner;
}

function krzyzowanieJednopunktowe(a: Chromoson, b: Chromoson): Chromoson {
  const len = a.genes.length;
  const punkt = Math.floor(Math.random() * len);
  const genes = [
    ...a.genes.slice(0, punkt),
    ...b.genes.slice(punkt)
  ];
  const result = { genes, value: 0, weight: 0 };
  console.log(`Krzyżowanie rodziców w punkcie ${punkt}:`, { parent1: a, parent2: b, child: result });
  return result;
}

function mutacja(chrom: Chromoson, mutProb: number): Chromoson {
  const genes = chrom.genes.map((g, i) => {
    if (Math.random() < mutProb) {
      console.log(`Mutacja genu index ${i}: ${g} -> ${1-g}`);
      return 1 - g;
    }
    return g;
  });
  const result = { genes, value: 0, weight: 0 };
  console.log("Po mutacji:", result);
  return result;
}

function algorytmGenetyczny({
  popSize,
  generations,
  mutProb
}: { popSize: number; generations: number; mutProb: number }): { best: Chromoson; history: number[] } {
  let populacja = tworzeniePopulacji(popSize, VALUES.length).map(fitness);
  let best = populacja[0];
  const history = [best.value];

  for (let gen = 0; gen < generations; gen++) {
    console.log(`\n--- Pokolenie ${gen + 1} ---`);
    const nowaPopulacja: Chromoson[] = [];
    while (nowaPopulacja.length < popSize) {
      const parent1 = turniejowaSelekcja(populacja);
      const parent2 = turniejowaSelekcja(populacja);
      let child = krzyzowanieJednopunktowe(parent1, parent2);
      child = mutacja(child, mutProb);
      child = fitness(child); // oceń dziecko
      nowaPopulacja.push(child);
    }
    populacja = nowaPopulacja;
    const genBest = populacja.reduce((a, b) => (a.value > b.value ? a : b));
    if (genBest.value > best.value) best = genBest;
    history.push(best.value);
    console.log("Najlepszy chromosom w pokoleniu:", genBest);
  }
  console.log("Najlepszy chromosom ogółem:", best);
  return { best, history };
}

// ===================== UI (nie zmieniaj stylów, tylko dane!) ======================

export default function Home() {
  const [popSize, setPopSize] = useState(100);
  const [generations, setGenerations] = useState(50);
  const [mutation, setMutation] = useState(0.01);
  const [started, setStarted] = useState(false);
  const [wynik, setWynik] = useState<{ best: Chromoson; history: number[] } | null>(null);

  function handleRun() {
    console.clear();
    const res = algorytmGenetyczny({
      popSize,
      generations,
      mutProb: mutation
    });
    setWynik(res);
    setStarted(true);
  }

  return (
    <div className={container}>
      <h1 className={heading}>
        Problem plecakowy – Algorytm genetyczny
      </h1>
      <form 
        className={form}
        onSubmit={e => { e.preventDefault(); handleRun(); }}
      >
        <label className={label}>
          Wielkość populacji:
          <input 
            type="number" 
            value={popSize} 
            onChange={e => setPopSize(+e.target.value)}
            min={10}
            className={input}
          />
        </label>
        <label className={label}>
          Liczba pokoleń:
          <input 
            type="number" 
            value={generations} 
            onChange={e => setGenerations(+e.target.value)}
            min={10}
            className={input}
          />
        </label>
        <label className={label}>
          Prawdopodobieństwo mutacji:
          <input 
            type="number" 
            value={mutation} 
            step="0.01"
            onChange={e => setMutation(+e.target.value)}
            min={0}
            max={1}
            className={input}
          />
        </label>
        <button type="submit" className={button}>
          Start
        </button>
      </form>

      {started && wynik && (
        <div className={resultsContainer}>
          <div className={resultBox}>
            <h2 className={resultHeading}>Najlepsze rozwiązanie:</h2>
            <p>Wartość: <b className={value}>{wynik.best.value}</b></p>
            <p>Waga: <b className={weight}>{wynik.best.weight}</b></p>
            <p>Wybrane przedmioty: <b className={items}>
              {wynik.best.genes
                .map((g, i) => (g ? i : null))
                .filter(i => i !== null)
                .join(", ")}
            </b></p>
          </div>
          <div className={resultBox}>
            <h2 className={resultHeading}>Postęp zbieżności:</h2>
            <ConvergenceChart history={wynik.history} />
          </div>
        </div>
      )}
    </div>
  );
}

function ConvergenceChart({ history }: { history: number[] }) {
  const max = Math.max(...history);

  // Pokaż max 30 słupków
  const step = Math.ceil(history.length / 30);
  const sampled = history.filter((_, i) => i % step === 0 || i === history.length - 1);

  return (
    <div>
      <div className={chartContainer}>
        {sampled.map((val, idx) => (
          <div 
            key={idx}
            style={{ height: `${(val / max) * 100}%` }}
            className={chartBar}
            title={`Pokolenie ${idx * step + 1}: ${val}`}
          ></div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Start: {sampled[0]}</span>
        <span>Koniec: {sampled[sampled.length - 1]}</span>
      </div>
    </div>
  );
}
