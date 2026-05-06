'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const TOTAL_BACKGROUNDS = 2;

const MONSTERS = [
  { id: 1, name: 'Ultra Vice Guava', value: 1, colorClass: 'bg-pink-400 ring-pink-200' },
  { id: 2, name: 'Viking Berry',     value: 2, colorClass: 'bg-red-600 ring-red-300' },
  { id: 3, name: 'Lewis Hamilton',   value: 4, colorClass: 'bg-purple-600 ring-purple-300' },
  { id: 4, name: 'Rehab Peach',      value: 8, colorClass: 'bg-orange-400 ring-orange-200' },
  { id: 5, name: 'Original Green',   value: 16, colorClass: 'bg-green-500 ring-green-300' },
];

// Natywna rozdzielczość pod wydruk / apkę Polaroid (pion)
const NATIVE_WIDTH_PX  = 800;  // szerokość obrazu
const NATIVE_HEIGHT_PX = 600;  // wysokość obrazu

const getLabelSizePx = () => ({
  width: NATIVE_WIDTH_PX,
  height: NATIVE_HEIGHT_PX,
});

// PREVIEW – ustawienia podglądu (ekran)
const POLAROID_PREVIEW_SETTINGS: Record<number, any> = {
  1: {
    nameTopPx:      74.5,
    nameLeft:       'auto',
    nameRight:      '13.5%',
    nameWidth:      '30%',
    nameJustify:    'flex-end',
    nameTransform:  'scale(1.05)',
    nameFontSize:   '34px',
    nameFontWeight: '400',
    nameCurve:      'M 50,150 Q 400,100 750,150',
    baseTopPx:      100,
    baseOffsetPx:   -90,
    baseWidth:      '50%',
    baseAlign:      'center',
  },
  2: {
    nameTopPx:      445,
    nameLeft:       '64.5%',
    nameRight:      'auto',
    nameWidth:      '40%',
    nameJustify:    'flex-start',
    nameTransform:  'scale(1.0)',
    nameFontSize:   '38px',
    nameFontWeight: '400',
    nameCurve:      'M 50,140 Q 400,130 750,140',
    baseTopPx:      20,
    baseOffsetPx:   -95,
    baseWidth:      '50%',
    baseAlign:      'center',
  },
};

// EXPORT – ustawienia tylko pod PNG (możesz korygować niezależnie)
const POLAROID_EXPORT_SETTINGS: Record<number, any> = {
  1: {
    nameTopPx:      78,
    nameLeft:       'auto',
    nameRight:      '13.75%',
    nameWidth:      '30%',
    nameJustify:    'flex-end',
    nameTransform:  'scale(1.05)',
    nameFontSize:   '34px',
    nameFontWeight: '400',
    nameCurve:      'M 50,150 Q 400,100 750,150',
    baseTopPx:      110,
    baseOffsetPx:   -90,
    baseWidth:      '50%',
    baseAlign:      'center',
  },
  2: {
    nameTopPx:      448,
    nameLeft:       '64.5%',
    nameRight:      'auto',
    nameWidth:      '40%',
    nameJustify:    'flex-start',
    nameTransform:  'scale(1.0)',
    nameFontSize:   '38px',
    nameFontWeight: '400',
    nameCurve:      'M 50,140 Q 400,130 750,140',
    baseTopPx:      20,
    baseOffsetPx:   -95,
    baseWidth:      '50%',
    baseAlign:      'center',
  },
};

const ScreenContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 font-sans overflow-hidden print:hidden">
    {children}
  </div>
);

export default function MonsterKioskApp() {
  const [step, setStep] = useState<number>(0);
  const [selectedMonsters, setSelectedMonsters] = useState<number[]>([]);
  const [customMixName, setCustomMixName] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('#EEEEEE');
  const [bgNumber, setBgNumber] = useState<number>(1); // 1 / 2

  const previewRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const toggleMonster = (id: number) => {
    setSelectedMonsters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const resetKiosk = () => {
    setStep(0);
    setSelectedMonsters([]);
    setCustomMixName('');
    setCustomColor('#EEEEEE');
    setBgNumber(1);
  };

  const getBaseMonstersList = (): string => {
    return MONSTERS.filter((m) => selectedMonsters.includes(m.id))
      .map((m) => m.name)
      .join(' + ');
  };

  const { width: labelWidthPx, height: labelHeightPx } = getLabelSizePx();

  const previewPos = POLAROID_PREVIEW_SETTINGS[bgNumber];
  const exportPos  = POLAROID_EXPORT_SETTINGS[bgNumber];

  const handleExportImage = async () => {
    if (!exportRef.current) return;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Przeglądarka zablokowała nowe okno. Zezwól na wyskakujące okna.');
      return;
    }

    win.document.write(
      `<html><head><title>Generowanie etykiety...</title></head>
       <body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;font-family:-apple-system,system-ui,sans-serif;">
         <div>Generuję obraz etykiety...</div>
       </body></html>`,
    );
    win.document.close();

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');

      win.document.open();
      win.document.write(
        `<html><head><title>Etykieta</title></head>
         <body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:#fff;">
           <img src="${dataUrl}" />
         </body></html>`,
      );
      win.document.close();
    } catch (e) {
      console.error('Export error', e);
      win.document.open();
      win.document.write(
        `<html><head><title>Błąd</title></head>
         <body style="margin:0;padding:20px;font-family:-apple-system,system-ui,sans-serif;">
           <h1>Nie udało się wygenerować obrazu.</h1>
           <p>Spróbuj ponownie lub odśwież stronę.</p>
         </body></html>`,
      );
      win.document.close();
    }
  };

  if (step === 0)
    return (
      <ScreenContainer>
        <button
          onClick={() => setStep(1)}
          className="rounded-full bg-red-600 px-16 py-12 text-center shadow-2xl transition active:scale-95 relative z-50"
        >
          <span className="block text-7xl font-black text-white tracking-tighter uppercase">
            Stwórz
          </span>
          <span className="block text-7xl font-black text-white tracking-tighter uppercase">
            Swój Mix
          </span>
        </button>
      </ScreenContainer>
    );

  if (step === 1)
    return (
      <ScreenContainer>
        <h1 className="mb-8 text-4xl font-extrabold text-white tracking-tight uppercase text-center leading-tight">
          Wybierz Monstery:
        </h1>
        <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-5xl relative z-50">
          {MONSTERS.map((monster) => {
            const isSelected = selectedMonsters.includes(monster.id);
            return (
              <button
                key={monster.id}
                onClick={() => toggleMonster(monster.id)}
                className={`flex h-40 w-40 flex-col items-center justify-center rounded-2xl p-4 shadow-xl transition-all ${
                  isSelected
                    ? `${monster.colorClass} text-white ring-8 ring-white scale-105`
                    : 'bg-zinc-800 text-zinc-300 opacity-60'
                }`}
              >
                <span className="text-xl font-black uppercase text-center tracking-tighter leading-none">
                  {monster.name}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 relative z-50">
          <button
            onClick={resetKiosk}
            className="rounded-full bg-zinc-700 px-10 py-4 text-2xl font-bold text-white uppercase"
          >
            Anuluj
          </button>
          <button
            disabled={selectedMonsters.length < 2}
            onClick={() => {
              setBgNumber(Math.floor(Math.random() * TOTAL_BACKGROUNDS) + 1);
              setStep(2);
            }}
            className="rounded-full bg-green-500 px-12 py-4 text-3xl font-black text-white disabled:opacity-20 uppercase"
          >
            DALEJ
          </button>
        </div>
      </ScreenContainer>
    );

  if (step === 2)
    return (
      <ScreenContainer>
        <h1 className="mb-8 text-5xl font-extrabold text-white tracking-tight uppercase text-center">
          Nazwij swój Mix:
        </h1>
        <input
          type="text"
          value={customMixName}
          onChange={(e) => setCustomMixName(e.target.value)}
          maxLength={14}
          className="mb-4 w-full max-w-3xl rounded-2xl bg-zinc-800 p-8 text-center text-6xl font-black text-white outline-none focus:ring-4 focus:ring-red-500 uppercase relative z-50"
        />
        <p className="text-2xl text-zinc-500 font-bold mb-8 relative z-50">
          {customMixName.length} / 14 znaków
        </p>
        <div className="flex gap-4 relative z-50">
          <button
            onClick={() => setStep(1)}
            className="rounded-full bg-zinc-700 px-10 py-4 text-2xl font-bold text-white uppercase"
          >
            Cofnij
          </button>
          <button
            disabled={customMixName.length < 3}
            onClick={() => setStep(3)}
            className="rounded-full bg-green-500 px-12 py-4 text-3xl font-black text-white disabled:opacity-20 uppercase"
          >
            Generuj ✨
          </button>
        </div>
      </ScreenContainer>
    );

  // STEP 3 – PREVIEW + EXPORT
  return (
    <>
      <div className="flex h-screen w-full flex-col items-center justify-start bg-black p-4 font-sans overflow-hidden text-white relative z-50 print:hidden">
        <div className="mt-2 mb-6 flex flex-wrap justify-center items-center gap-3 w-full max-w-6xl relative z-50">
          <button
            onClick={resetKiosk}
            className="rounded-full bg-zinc-800 px-4 py-3 text-lg font-bold text-red-500 uppercase border border-red-500/30"
          >
            Nowy ↺
          </button>

          <button
            onClick={() => setStep(2)}
            className="rounded-full bg-zinc-700 px-4 py-3 text-lg font-bold text-white uppercase"
          >
            Popraw
          </button>

          <div
            className="relative rounded-full border-2 px-4 py-3 text-lg font-bold text-white uppercase overflow-hidden"
            style={{ borderColor: customColor }}
          >
            <span className="pointer-events-none">Kolor</span>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportImage}
            className="rounded-full bg-green-600 px-6 py-3 text-xl font-black text-white uppercase"
          >
            Eksportuj PNG
          </button>

          <div className="text-xs text-zinc-400 ml-4">
            {NATIVE_WIDTH_PX}×{NATIVE_HEIGHT_PX} px
          </div>
        </div>

        {/* PREVIEW */}
        <div
          className="relative shadow-2xl bg-white overflow-hidden mx-auto"
          style={{
            width: `${labelWidthPx}px`,
            height: `${labelHeightPx}px`,
          }}
        >
          <div
            ref={previewRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={`/labels/bg_${bgNumber}.png`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
              alt="Label background"
            />

            {/* NAPIS – PREVIEW */}
            <div
              style={{
                position: 'absolute',
                top:    `${previewPos.nameTopPx}px`,
                left:   previewPos.nameLeft,
                right:  previewPos.nameRight,
                width:  previewPos.nameWidth,
                display: 'flex',
                justifyContent: previewPos.nameJustify,
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <svg
                viewBox="0 0 800 300"
                style={{
                  width: '100%',
                  height: 'auto',
                  transform: previewPos.nameTransform,
                  transformOrigin: 'center center',
                }}
              >
                <defs>
                  <path
                    id="curve-preview"
                    d={previewPos.nameCurve}
                    fill="transparent"
                  />
                </defs>
                <text
                  style={{
                    fill: customColor,
                    fontSize: previewPos.nameFontSize,
                    fontWeight: previewPos.nameFontWeight,
                    fontFamily: 'Impact, "Arial Narrow", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.11em',
                  }}
                >
                  <textPath
                    href="#curve-preview"
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {customMixName || 'ULTRA PUNCH'}
                  </textPath>
                </text>
              </svg>
            </div>

            {/* BAZA – PREVIEW */}
            <div
              style={{
                position: 'absolute',
                top: `${previewPos.baseTopPx}px`,
                left: '50%',
                transform: `translateX(-50%) translateX(${previewPos.baseOffsetPx || 0}px)`,
                width: previewPos.baseWidth || '85%',
                textAlign: previewPos.baseAlign || 'center',
                margin: '0 auto',
                padding: '0 8px',
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: 'white',
                  textTransform: 'uppercase',
                  textShadow: '0 0 3px black',
                  wordBreak: 'break-word',
                  margin: 0,
                  fontSize: '16px',
                }}
              >
                Baza: {getBaseMonstersList()}
              </p>
            </div>
          </div>
        </div>

        {/* EXPORT */}
        <div
          ref={exportRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: `${labelWidthPx}px`,
            height: `${labelHeightPx}px`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={`/labels/bg_${bgNumber}.png`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
              alt=""
            />

            {/* NAPIS – EXPORT */}
            <div
              style={{
                position: 'absolute',
                top:    `${exportPos.nameTopPx}px`,
                left:   exportPos.nameLeft,
                right:  exportPos.nameRight,
                width:  exportPos.nameWidth,
                display: 'flex',
                justifyContent: exportPos.nameJustify,
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <svg
                viewBox="0 0 800 300"
                style={{
                  width: '100%',
                  height: 'auto',
                  transform: exportPos.nameTransform,
                  transformOrigin: 'center center',
                }}
              >
                <defs>
                  <path
                    id="curve-export"
                    d={exportPos.nameCurve}
                    fill="transparent"
                  />
                </defs>
                <text
                  style={{
                    fill: customColor,
                    fontSize: exportPos.nameFontSize,
                    fontWeight: exportPos.nameFontWeight,
                    fontFamily: 'Impact, "Arial Narrow", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.11em',
                  }}
                >
                  <textPath
                    href="#curve-export"
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {customMixName || 'ULTRA PUNCH'}
                  </textPath>
                </text>
              </svg>
            </div>

            {/* BAZA – EXPORT */}
            <div
              style={{
                position: 'absolute',
                top: `${exportPos.baseTopPx}px`,
                left: '50%',
                transform: `translateX(-50%) translateX(${exportPos.baseOffsetPx || 0}px)`,
                width: exportPos.baseWidth || '85%',
                textAlign: exportPos.baseAlign || 'center',
                margin: '0 auto',
                padding: '0 8px',
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: 'white',
                  textTransform: 'uppercase',
                  textShadow: '0 0 3px black',
                  wordBreak: 'break-word',
                  margin: 0,
                  fontSize: '16px',
                }}
              >
                Baza: {getBaseMonstersList()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}