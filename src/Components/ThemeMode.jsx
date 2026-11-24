import React, { useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "./Icons";
import { getMode, setMode } from "../utils/theme";

const MODES = [
  { id: "light", label: "Light", Icon: SunIcon },
  { id: "dark", label: "Dark", Icon: MoonIcon },
  { id: "system", label: "Same as device", Icon: MonitorIcon },
];

// Changed: Settings only offers light / dark / device mode (color skins were removed)
const ThemeMode = () => {
  const [mode, setModeState] = useState(getMode);
  return (
    <div role='radiogroup' aria-label='Theme' className='grid grid-cols-3 gap-1 p-1 rounded-xl bg-base-200'>
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
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            mode === id ? "bg-base-100 shadow-sm text-primary" : "opacity-70 hover:opacity-100"
          }`}>
          <Icon className='w-4 h-4' />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ThemeMode;
