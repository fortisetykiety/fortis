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

// PREVIEW – konfiguracja w procentach (od wysokości etykiety)
const LABEL_SETTINGS_PREVIEW: Record<string, any> = {
  '1_25': {
    nameTopPercent: 14,
    nameBottomPercent: undefined,
    nameLeft: '38.5%',
    nameRight: '0',
    nameJustify: 'center',
    nameWidth: '65%',
    nameTransform: 'skewX(-3deg) scale(1.05)',
    nameFontWeight: '400',
    nameFontSize: '30px',
    nameCurve: 'M 100,210 Q 700,140 1300,210',
    baseTopPercent: undefined,
    baseBottomPercent: 55,
    baseAlign: 'center',
    baseWidth: '50%',
    baseLeft: '-26%',
  },
  '1_50': {
    nameTopPercent: 12.5,
    nameBottomPercent: undefined,
    nameLeft: '38.5%',
    nameRight: '0',
    nameJustify: 'center',
    nameWidth: '65%',
    nameTransform: 'skewX(-3deg) scale(1.05)',
    nameFontWeight: '400',
    nameFontSize: '38px',
    nameCurve: 'M 100,210 Q 700,140 1300,210',
    baseTopPercent: undefined,
    baseBottomPercent: 55,
    baseAlign: 'center',
    baseWidth: '50%',
    baseLeft: '-26%',
  },
  '2_25': {
    nameTopPercent: undefined,
    nameBottomPercent: 10,
    nameLeft: 'auto',
    nameRight: '-12.5%',
    nameJustify: 'flex-end',
    nameWidth: '45%',
    nameTransform: 'scale(1)',
    nameFontWeight: '400',
    nameFontSize: '64px',
    nameCurve: 'M 130,200 Q 500,140 900,200',
    baseTopPercent: 2,
    baseBottomPercent: undefined,
    baseAlign: 'center',
    baseWidth: '60%',
    baseLeft: '-10%',
  },
  '2_50': {
    nameTopPercent: undefined,
    nameBottomPercent: 5,
    nameLeft: 'auto',
    nameRight: '-12.5%',
    nameJustify: 'flex-end',
    nameWidth: '45%',
    nameTransform: 'scale(1)',
    nameFontWeight: '400',
    nameFontSize: '80px',
    nameCurve: 'M 130,200 Q 500,140 900,200',
    baseTopPercent: 6,
    baseBottomPercent: undefined,
    baseAlign: 'center',
    baseWidth: '60%',
    baseLeft: '-10%',
  },
};

// PRINT – osobne presety bg×taśma
const LABEL_SETTINGS_PRINT: Record<string, any> = {
  '1_25': {
    nameTopPercent: 14,
    nameBottomPercent: undefined,
    nameLeft: '42%',
    nameRight: '0',
    nameJustify: 'center',
    nameWidth: '62%',
    nameTransform: 'skewX(-3deg) scale(1.05)',
    nameFontWeight: '400',
    nameFontSize: '30px',
    nameCurve: 'M 100,210 Q 700,140 1300,210',
    baseTopPercent: undefined,
    baseBottomPercent: 55,
    baseAlign: 'center',
    baseWidth: '50%',
    baseLeft: '-26%',
  },
  '1_50': {
    nameTopPercent: 13,
    nameBottomPercent: undefined,
    nameLeft: '42%',
    nameRight: '0',
    nameJustify: 'center',
    nameWidth: '62%',
    nameTransform: 'skewX(-3deg) scale(1.05)',
    nameFontWeight: '400',
    nameFontSize: '38px',
    nameCurve: 'M 100,210 Q 700,140 1300,210',
    baseTopPercent: undefined,
    baseBottomPercent: 55,
    baseAlign: 'center',
    baseWidth: '50%',
    baseLeft: '-26%',
  },
  '2_25': {
    nameTopPercent: undefined,
    nameBottomPercent: 10,
    nameLeft: 'auto',
    nameRight: '-12.5%',
    nameJustify: 'flex-end',
    nameWidth: '45%',
    nameTransform: 'scale(1)',
    nameFontWeight: '400',
    nameFontSize: '64px',
    nameCurve: 'M 130,200 Q 500,140 900,200',
    baseTopPercent: 2,
    baseBottomPercent: undefined,
    baseAlign: 'center',
    baseWidth: '60%',
    baseLeft: '-10%',
  },
  '2_50': {
    nameTopPercent: undefined,
    nameBottomPercent: 5,
    nameLeft: 'auto',
    nameRight: '-12.5%',
    nameJustify: 'flex-end',
    nameWidth: '45%',
    nameTransform: 'scale(1)',
    nameFontWeight: '400',
    nameFontSize: '80px',
    nameCurve: 'M 130,200 Q 500,140 900,200',
    baseTopPercent: 5,
    baseBottomPercent: undefined,
    baseAlign: 'center',
    baseWidth: '60%',
    baseLeft: '-10%',
  },
};

const ScreenContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 font-sans overflow-hidden print:hidden">
    {children}
  </div>
);

const LENGTH_PRESETS_25 = [30, 36, 45, 60];
const LENGTH_PRESETS_50 = [40, 50, 60, 80, 100];

const DPI = 300;
const MM_TO_PX = (mm: number) => Math.round((mm * DPI) / 25.4);

const getLabelSizePx = (tapeWidthMM: 25 | 50, labelLengthMM: number) => ({
  width: MM_TO_PX(tapeWidthMM),
  height: MM_TO_PX(labelLengthMM),
});

export default function MonsterKioskApp() {
  const [step, setStep] = useState<number>(0);
  const [selectedMonsters, setSelectedMonsters] = useState<number[]>([]);
  const [customMixName, setCustomMixName] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('#EEEEEE');
  const [bgNumber, setBgNumber] = useState<number>(1);

  const [tapeWidth, setTapeWidth] = useState<25 | 50>(25);
  const [labelLengthMM, setLabelLengthMM] = useState<number>(36);

  // NOWE: flaga obrotu
  const [rotate, setRotate] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const currentLengthPresets =
    tapeWidth === 25 ? LENGTH_PRESETS_25 : LENGTH_PRESETS_50;

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
    setTapeWidth(25);
    setLabelLengthMM(36);
    setRotate(false);
  };

  const getBaseMonstersList = (): string => {
    return MONSTERS.filter((m) => selectedMonsters.includes(m.id))
      .map((m) => m.name)
      .join(' + ');
  };

  const { width: labelWidthPx, height: labelHeightPx } = getLabelSizePx(
    tapeWidth,
    labelLengthMM,
  );

  const key = `${bgNumber}_${tapeWidth}`;
  const previewPos =
    LABEL_SETTINGS_PREVIEW[key] || LABEL_SETTINGS_PREVIEW['1_25'];
  const printPos =
    LABEL_SETTINGS_PRINT[key] || LABEL_SETTINGS_PRINT['1_25'];

  // % → px PREVIEW
  const previewNameTopPx =
    previewPos.nameTopPercent !== undefined
      ? (previewPos.nameTopPercent / 100) * labelHeightPx
      : undefined;

  const previewNameBottomPx =
    previewPos.nameBottomPercent !== undefined
      ? (previewPos.nameBottomPercent / 100) * labelHeightPx
      : undefined;

  const previewBaseTopPx =
    previewPos.baseTopPercent !== undefined
      ? (previewPos.baseTopPercent / 100) * labelHeightPx
      : undefined;

  const previewBaseBottomPx =
    previewPos.baseBottomPercent !== undefined
      ? (previewPos.baseBottomPercent / 100) * labelHeightPx
      : undefined;

  // % → px PRINT
  const printNameTopPx =
    printPos.nameTopPercent !== undefined
      ? (printPos.nameTopPercent / 100) * labelHeightPx
      : undefined;

  const printNameBottomPx =
    printPos.nameBottomPercent !== undefined
      ? (printPos.nameBottomPercent / 100) * labelHeightPx
      : undefined;

  const printBaseTopPx =
    printPos.baseTopPercent !== undefined
      ? (printPos.baseTopPercent / 100) * labelHeightPx
      : undefined;

  const printBaseBottomPx =
    printPos.baseBottomPercent !== undefined
      ? (printPos.baseBottomPercent / 100) * labelHeightPx
      : undefined;

  // kompensacja bg2
  const bgIs2 = bgNumber === 2;
  const extraOffsetForBg2 = bgIs2 && labelLengthMM > 36
    ? (labelLengthMM - 36) * 0.15 * MM_TO_PX(1)
    : 0;

  const previewNameTopPxAdjusted =
    previewNameTopPx !== undefined
      ? previewNameTopPx - extraOffsetForBg2
      : undefined;

  const previewNameBottomPxAdjusted =
    previewNameBottomPx !== undefined
      ? previewNameBottomPx + extraOffsetForBg2
      : undefined;

  const previewBaseTopPxAdjusted =
    previewBaseTopPx !== undefined
      ? previewBaseTopPx - extraOffsetForBg2 * 0.5
      : undefined;

  const previewBaseBottomPxAdjusted =
    previewBaseBottomPx !== undefined
      ? previewBaseBottomPx + extraOffsetForBg2 * 0.5
      : undefined;

  const printNameTopPxAdjusted =
    printNameTopPx !== undefined
      ? printNameTopPx - extraOffsetForBg2
      : undefined;

  const printNameBottomPxAdjusted =
    printNameBottomPx !== undefined
      ? printNameBottomPx + extraOffsetForBg2
      : undefined;

  const printBaseTopPxAdjusted =
    printBaseTopPx !== undefined
      ? printBaseTopPx - extraOffsetForBg2 * 0.5
      : undefined;

  const printBaseBottomPxAdjusted =
    printBaseBottomPx !== undefined
      ? printBaseBottomPx + extraOffsetForBg2 * 0.5
      : undefined;

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

    let finalDataUrl: string;

    if (rotate) {
      // OBRÓT 90° W PRAWO (clockwise)
      const rotatedCanvas = document.createElement('canvas');
      rotatedCanvas.width = canvas.height;
      rotatedCanvas.height = canvas.width;

      const ctx = rotatedCanvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      // środek nowego canvasa
      ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      ctx.rotate(Math.PI / 2); // 90deg

      // rysujemy stary canvas przesunięty o połowę szerokości/wysokości
      ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

      finalDataUrl = rotatedCanvas.toDataURL('image/png');
    } else {
      // normalny pion
      finalDataUrl = canvas.toDataURL('image/png');
    }

    win.document.open();
    win.document.write(
      `<html><head><title>Etykieta</title></head>
       <body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:#fff;">
         <img src="${finalDataUrl}" />
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

          <button
            onClick={() => {
              setTapeWidth((prev) => {
                const next = prev === 25 ? 50 : 25;
                if (next === 25) setLabelLengthMM(36);
                else setLabelLengthMM(60);
                return next;
              });
            }}
            className="rounded-full bg-blue-600 px-4 py-3 text-lg font-bold text-white uppercase"
          >
            Taśma: {tapeWidth}mm
          </button>

          <div className="bg-zinc-800 rounded-full px-4 py-2 text-sm flex items-center gap-2">
            <div className="flex flex-col">
              <span className="uppercase font-bold">Długość:</span>
              {tapeWidth === 25 && (
                <span className="text-[10px] text-zinc-400">
                  Najlepiej wygląda przy 36mm i 45mm
                </span>
              )}
            </div>

            <select
              value={labelLengthMM}
              onChange={(e) => setLabelLengthMM(Number(e.target.value))}
              className="bg-transparent outline-none font-bold ml-2"
            >
              {currentLengthPresets.map((len) => (
                <option key={len} value={len}>
                  {len} mm
                </option>
              ))}
            </select>
          </div>

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

          {/* NOWY przycisk: obrót */}
          <button
            onClick={() => setRotate((r) => !r)}
            className={`rounded-full px-4 py-3 text-lg font-bold uppercase ${
              rotate ? 'bg-yellow-500 text-black' : 'bg-zinc-700 text-white'
            }`}
          >
            Obrót: {rotate ? 'Włączony (poziom)' : 'Wyłączony (pion)'}
          </button>

          <button
            onClick={handleExportImage}
            className="rounded-full bg-green-600 px-6 py-3 text-xl font-black text-white uppercase"
          >
            Eksportuj PNG
          </button>

          <div className="text-xs text-zinc-400 ml-4">
            {tapeWidth}mm × {labelLengthMM}mm → {labelWidthPx}×{labelHeightPx} px
          </div>
        </div>

        {/* PREVIEW – ekran */}
        <div
          className="relative shadow-2xl bg-white overflow-hidden mx-auto"
          style={{
            // przy obrocie zamieniamy width/height żeby lepiej wyglądał podgląd
            width: rotate ? `${labelHeightPx}px` : `${labelWidthPx}px`,
            height: rotate ? `${labelWidthPx}px` : `${labelHeightPx}px`,
          }}
        >
          <div
            ref={previewRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              // obracamy całą etykietę w podglądzie
              transform: rotate ? 'rotate(90deg)' : 'none',
              transformOrigin: 'center center',
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
                top:
                  previewNameTopPxAdjusted !== undefined
                    ? `${previewNameTopPxAdjusted}px`
                    : undefined,
                bottom:
                  previewNameBottomPxAdjusted !== undefined
                    ? `${previewNameBottomPxAdjusted}px`
                    : undefined,
                left: previewPos.nameLeft,
                right: previewPos.nameRight,
                width: previewPos.nameWidth,
                display: 'flex',
                justifyContent: previewPos.nameJustify,
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <svg
                viewBox="0 0 1400 400"
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
                top:
                  previewBaseTopPxAdjusted !== undefined
                    ? `${previewBaseTopPxAdjusted}px`
                    : undefined,
                bottom:
                  previewBaseBottomPxAdjusted !== undefined
                    ? `${previewBaseBottomPxAdjusted}px`
                    : undefined,
                left: previewPos.baseLeft || '0',
                right: '0',
                textAlign: previewPos.baseAlign,
                width: previewPos.baseWidth || 'auto',
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
                  fontSize: '14px',
                }}
              >
                Baza: {getBaseMonstersList()}
              </p>
            </div>
          </div>
        </div>

        {/* EXPORT – ukryty layout dla html2canvas / druku */}
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

            {/* NAPIS – PRINT */}
            <div
              style={{
                position: 'absolute',
                top:
                  printNameTopPxAdjusted !== undefined
                    ? `${printNameTopPxAdjusted}px`
                    : undefined,
                bottom:
                  printNameBottomPxAdjusted !== undefined
                    ? `${printNameBottomPxAdjusted}px`
                    : undefined,
                left: printPos.nameLeft,
                right: printPos.nameRight,
                width: printPos.nameWidth,
                display: 'flex',
                justifyContent: printPos.nameJustify,
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <svg
                viewBox="0 0 1400 400"
                style={{
                  width: '100%',
                  height: 'auto',
                  transform: printPos.nameTransform,
                  transformOrigin: 'center center',
                }}
              >
                <defs>
                  <path
                    id="curve-print"
                    d={printPos.nameCurve}
                    fill="transparent"
                  />
                </defs>
                <text
                  style={{
                    fill: customColor,
                    fontSize: printPos.nameFontSize,
                    fontWeight: printPos.nameFontWeight,
                    fontFamily: 'Impact, "Arial Narrow", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.11em',
                  }}
                >
                  <textPath
                    href="#curve-print"
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {customMixName || 'ULTRA PUNCH'}
                  </textPath>
                </text>
              </svg>
            </div>

            {/* BAZA – PRINT */}
            <div
              style={{
                position: 'absolute',
                top:
                  printBaseTopPxAdjusted !== undefined
                    ? `${printBaseTopPxAdjusted}px`
                    : undefined,
                bottom:
                  printBaseBottomPxAdjusted !== undefined
                    ? `${printBaseBottomPxAdjusted}px`
                    : undefined,
                left: printPos.baseLeft || '0',
                right: '0',
                textAlign: printPos.baseAlign,
                width: printPos.baseWidth || 'auto',
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
                  fontSize: '14px',
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