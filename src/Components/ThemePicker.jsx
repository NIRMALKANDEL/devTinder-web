import React, { useState } from "react";
import { CheckIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from "./Icons";
import { SKINS, getMode, getSkin, setMode, setSkin } from "../utils/theme";

const MODES = [
  { id: "light", label: "Light", Icon: SunIcon },
  { id: "dark", label: "Dark", Icon: MoonIcon },
  { id: "system", label: "System", Icon: MonitorIcon },
];

// Added: full theme switcher (color skin + light/dark/system). `inline` renders the
// panel directly (Settings page); otherwise it's a navbar dropdown.
export const ThemePanel = () => {
  const [skin, setSkinState] = useState(getSkin);
  const [mode, setModeState] = useState(getMode);

  return (
    <div className='flex flex-col gap-4'>
      <div role='radiogroup' aria-label='Mode' className='grid grid-cols-3 gap-1 p-1 rounded-xl bg-base-200'>
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type='button'
            role='radio'
            aria-checked={mode === id}
            onClick={() => {
              setMode(id);
              setModeState(id);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
              mode === id ? "bg-base-100 shadow-sm text-primary" : "opacity-70 hover:opacity-100"
            }`}>
            <Icon className='w-3.5 h-3.5' />
            {label}
          </button>
        ))}
      </div>

      <div role='radiogroup' aria-label='Color theme' className='grid grid-cols-2 gap-2'>
        {SKINS.map((s) => (
          <button
            key={s.id}
            type='button'
            role='radio'
            aria-checked={skin === s.id}
            onClick={() => {
              setSkin(s.id);
              setSkinState(s.id);
            }}
            className={`relative text-left rounded-xl border p-2.5 transition-all cursor-pointer hover:-translate-y-0.5 ${
              skin === s.id ? "border-primary ring-1 ring-primary" : "border-hairline hover:border-base-300"
            }`}>
            <span className='flex -space-x-1.5' aria-hidden='true'>
              {s.swatch.map((c) => (
                <span key={c} className='w-5 h-5 rounded-full ring-2 ring-base-100' style={{ background: c }}></span>
              ))}
            </span>
            <span className='block text-sm font-semibold mt-2'>{s.label}</span>
            <span className='block text-[11px] opacity-60 leading-tight'>{s.hint}</span>
            {skin === s.id && (
              <span className='absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center'>
                <CheckIcon className='w-3 h-3' />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const ThemePicker = () => (
  <div className='dropdown dropdown-end'>
    <div
      tabIndex={0}
      role='button'
      aria-label='Change theme'
      title='Change theme'
      className='btn btn-ghost btn-circle'>
      <PaletteIcon className='w-[18px] h-[18px]' />
    </div>
    <div
      tabIndex={0}
      className='dropdown-content bg-base-100 border border-hairline shadow-2xl rounded-2xl z-50 mt-3 w-72 p-3'>
      <p className='tile-label mb-2'>Theme</p>
      <ThemePanel />
    </div>
  </div>
);

export default ThemePicker;
