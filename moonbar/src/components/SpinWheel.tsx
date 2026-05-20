import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const STORAGE_KEY = 'moonbar_spin_result';

interface WheelOption {
  id: string;
  label: string;
  perk: string;
  color: string;
}

interface SpinWheelProps {
  options?: WheelOption[];
}

const DEFAULT_OPTIONS: WheelOption[] = [
  { id: '1', label: 'Desserts', perk: 'A free dessert on the house', color: '#FFDA7F' },
  { id: '2', label: 'Cocktails', perk: 'A complimentary signature cocktail', color: '#BA401D' },
  { id: '3', label: "Chef's Special", perk: "The chef's pick — on us", color: '#7F6F34' },
  { id: '4', label: 'Shots', perk: 'A round of shots for the table', color: '#E7A356' },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function SpinWheel({ options = DEFAULT_OPTIONS }: SpinWheelProps) {
  const wheelRef = useRef<SVGGElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; perk: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const rotationRef = useRef(0);
  const spinTimeoutRef = useRef<number | null>(null);
  const pendingRotationRef = useRef<number | null>(null);

  const segmentAngle = 360 / options.length;

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Restore previous spin so a page refresh doesn't blank the prize.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { label: string; perk: string; rotation?: number };
      if (saved?.label && saved?.perk) {
        setResult({ label: saved.label, perk: saved.perk });
        if (typeof saved.rotation === 'number') {
          rotationRef.current = saved.rotation;
          pendingRotationRef.current = saved.rotation;
        }
      }
    } catch {
      // ignore corrupted localStorage
    }
  }, []);

  // Apply saved wheel rotation once the SVG ref is mounted.
  useLayoutEffect(() => {
    if (!wheelRef.current || pendingRotationRef.current === null) return;
    gsap.set(wheelRef.current, {
      rotation: pendingRotationRef.current,
      svgOrigin: '200 200',
      transformOrigin: '50% 50%',
    });
    pendingRotationRef.current = null;
  }, [hydrated]);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setShowForm(false);
  }, []);

  const spin = useCallback(() => {
    if (!hydrated || spinning) return;

    // If a previous result is showing, clicking the button starts a fresh spin.
    if (result) {
      localStorage.removeItem(STORAGE_KEY);
      setResult(null);
    }

    setSpinning(true);

    const segmentIndex = Math.floor(Math.random() * options.length);
    const selected = options[segmentIndex];
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Keep jitter well inside the segment so we never visually land on a neighbour.
    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.5);

    // Segment `i` is drawn from angle `i*sa` to `(i+1)*sa`, measured clockwise from
    // the top (12 o'clock). For the pointer (also at 12 o'clock) to point at the
    // middle of segment `i` after rotating clockwise by R degrees, we need:
    //   (i*sa + sa/2 + R) mod 360 === 0
    // ⇒ R mod 360 === (360 - i*sa - sa/2) mod 360
    const desiredEnd = (360 - segmentIndex * segmentAngle - segmentAngle / 2 + jitter + 360) % 360;
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const deltaToTarget = (desiredEnd - currentMod + 360) % 360;
    const finalRotation = rotationRef.current + 360 * 6 + deltaToTarget;

    const persist = () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ label: selected.label, perk: selected.perk, rotation: finalRotation })
        );
      } catch {
        // storage may be unavailable in private mode — ignore
      }
    };

    const finish = () => {
      if (spinTimeoutRef.current !== null) {
        window.clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
      rotationRef.current = finalRotation;
      setSpinning(false);
      setResult({ label: selected.label, perk: selected.perk });
      persist();
    };

    if (prefersReduced || !wheelRef.current) {
      if (wheelRef.current) {
        gsap.set(wheelRef.current, {
          rotation: finalRotation,
          svgOrigin: '200 200',
          transformOrigin: '50% 50%',
        });
      }
      finish();
      return;
    }

    gsap.killTweensOf(wheelRef.current);
    spinTimeoutRef.current = window.setTimeout(finish, 7000);

    gsap.to(wheelRef.current, {
      rotation: finalRotation,
      duration: 6,
      ease: 'power4.out',
      svgOrigin: '200 200',
      transformOrigin: '50% 50%',
      onComplete: finish,
    });
  }, [hydrated, spinning, options, segmentAngle, result]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        {/* Pointer */}
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1"
          aria-hidden="true"
        >
          <div className="h-0 w-0 border-x-[14px] border-b-[24px] border-x-transparent border-b-moon-gold drop-shadow-[0_0_12px_rgba(255,218,127,0.6)]" />
        </div>

        <svg
          viewBox="0 0 400 400"
          className="h-[min(80vw,380px)] w-[min(80vw,380px)] drop-shadow-[0_0_60px_rgba(255,218,127,0.15)]"
          role="img"
          aria-label="Spin the moon wheel"
        >
          <defs>
            <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="wheelCenter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFDA7F" />
              <stop offset="100%" stopColor="#414C2F" />
            </radialGradient>
          </defs>

          <circle cx="200" cy="200" r="198" fill="none" stroke="#FFDA7F" strokeWidth="2" opacity="0.3" filter="url(#moonGlow)" />

          <g ref={wheelRef}>
            {options.map((opt, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const midAngle = startAngle + segmentAngle / 2;
              const labelPos = polarToCartesian(200, 200, 130, midAngle);

              return (
                <g key={opt.id}>
                  <path
                    d={describeArc(200, 200, 190, startAngle, endAngle)}
                    fill={opt.color}
                    stroke="#F9E1CD"
                    strokeWidth="1"
                    opacity="0.92"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#F9E1CD"
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="Space Grotesk, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                  >
                    {opt.label}
                  </text>
                </g>
              );
            })}
          </g>

          <circle cx="200" cy="200" r="36" fill="url(#wheelCenter)" stroke="#FFDA7F" strokeWidth="2" />
          <text x="200" y="206" textAnchor="middle" fontSize="28" aria-hidden="true">🌙</text>
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={spin}
          disabled={!hydrated || spinning}
          className="btn-primary !px-10 !py-4 !text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!hydrated ? 'Loading…' : spinning ? 'The moon is turning…' : result ? 'Spin Again' : 'Spin the Moon'}
        </button>
        {result && !spinning && (
          <button
            type="button"
            onClick={reset}
            className="btn-ghost !text-sm"
          >
            Reset
          </button>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="min-h-[1.5rem] text-center">
        {result && !showForm && !spinning && (
          <div className="mx-auto max-w-md rounded-2xl border border-moon-gold/30 bg-moon-surface/80 p-6 backdrop-blur-sm">
            <p className="font-display text-2xl text-moon-gold mb-2">
              Tonight, the moon grants you a free <strong>{result.label}</strong>.
            </p>
            <p className="text-sm text-moon-cream/70 mb-6">{result.perk}</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary w-full"
            >
              Lock it in — reserve your table
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <form
          className="w-full max-w-md space-y-4 rounded-2xl border border-moon-cream/10 bg-moon-surface/60 p-6 backdrop-blur-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            try {
              const res = await fetch('/api/reserve', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                  name: fd.get('name'),
                  phone: fd.get('phone'),
                  date: fd.get('date'),
                  time: fd.get('time'),
                  people: fd.get('people') || null,
                  prizeLabel: result?.label || null,
                  prizePerk: result?.perk || null,
                }),
              });
              if (!res.ok) throw new Error('Failed');
              localStorage.setItem('moonbar_reserved', 'true');
              alert('Booking received — we\'ll WhatsApp you to confirm within 30 minutes.');
              setShowForm(false);
            } catch {
              alert('Something went wrong. Please call us at +91 95871 92999.');
            }
          }}
        >
          <h3 className="font-display text-xl text-moon-gold">Reserve your table</h3>
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-accent uppercase tracking-wider text-moon-sand">Name</label>
            <input id="name" name="name" required minLength={2} maxLength={60} className="w-full rounded-lg border border-moon-cream/20 bg-moon-bg-deep/50 px-4 py-2.5 text-moon-cream placeholder:text-moon-cream/30 focus:border-moon-gold/50" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-accent uppercase tracking-wider text-moon-sand">Phone</label>
            <input id="phone" name="phone" type="tel" required pattern="[6-9][0-9]{9}" className="w-full rounded-lg border border-moon-cream/20 bg-moon-bg-deep/50 px-4 py-2.5 text-moon-cream placeholder:text-moon-cream/30 focus:border-moon-gold/50" placeholder="10-digit mobile" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="mb-1 block text-xs font-accent uppercase tracking-wider text-moon-sand">Date</label>
              <input id="date" name="date" type="date" required className="w-full rounded-lg border border-moon-cream/20 bg-moon-bg-deep/50 px-4 py-2.5 text-moon-cream focus:border-moon-gold/50" />
            </div>
            <div>
              <label htmlFor="time" className="mb-1 block text-xs font-accent uppercase tracking-wider text-moon-sand">Time</label>
              <select id="time" name="time" required className="w-full rounded-lg border border-moon-cream/20 bg-moon-bg-deep/50 px-4 py-2.5 text-moon-cream focus:border-moon-gold/50">
                <option value="19:00">7:00 PM</option>
                <option value="19:30">7:30 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="20:30">8:30 PM</option>
                <option value="21:00">9:00 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="people" className="mb-1 block text-xs font-accent uppercase tracking-wider text-moon-sand">Guests (optional)</label>
            <input id="people" name="people" type="number" min={1} max={20} className="w-full rounded-lg border border-moon-cream/20 bg-moon-bg-deep/50 px-4 py-2.5 text-moon-cream focus:border-moon-gold/50" placeholder="Number of people" />
          </div>
          <label className="flex items-start gap-2 text-xs text-moon-cream/60">
            <input type="checkbox" required className="mt-0.5 accent-moon-burnt" />
            I agree to be contacted about my reservation.
          </label>
          <button type="submit" className="btn-primary w-full">Confirm reservation</button>
        </form>
      )}
    </div>
  );
}
