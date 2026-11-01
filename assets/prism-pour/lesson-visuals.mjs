const paths={
 briefcase:'<rect x="3" y="7" width="26" height="20" rx="4"/><path d="M11 7V4h10v3M3 15q13 7 26 0M13 17h6v5h-6Z"/>',
 chat:'<path d="M27 19a10 10 0 0 0-2-14H9C1 5 1 22 9 23h6l7 5v-6h3Z"/><path d="M9 11h13M9 16h9"/>',
 compass:'<circle cx="16" cy="16" r="12"/><path d="m21 10-3 9-8 3 3-9Z"/><path d="M16 1v3m0 24v3M1 16h3m24 0h3"/>',
 book:'<path d="M3 5q7-2 13 2 6-4 13-2v22q-7-2-13 2-6-4-13-2ZM16 7v22M7 11h5m-5 5h5m8-5h5m-5 5h5"/>',
 tools:'<path d="m4 27 15-15M19 4a7 7 0 0 0-2 11 7 7 0 0 0 11-2l-6 1-4-4 1-6ZM5 3l7 7-3 3-7-7ZM15 19l9 9 4-4-9-9"/>',
 clock:'<circle cx="16" cy="16" r="12"/><path d="M16 8v9l6 3"/>',
 shield:'<path d="m16 3 11 4v9c0 6-7 11-11 13C12 27 5 22 5 16V7Z"/><path d="m10 15 4 4 8-9"/>',
 money:'<rect x="2" y="7" width="28" height="18" rx="3"/><circle cx="16" cy="16" r="5"/><path d="M6 12h2m16 8h2M16 13v6"/>',
 list:'<rect x="5" y="4" width="22" height="25" rx="3"/><path d="M11 3h10v5H11ZM10 14l2 2 3-4m2 3h6M10 22l2 2 3-4m2 3h6"/>',
 team:'<circle cx="16" cy="9" r="4"/><circle cx="6" cy="13" r="3"/><circle cx="26" cy="13" r="3"/><path d="M8 29v-5a8 8 0 0 1 16 0v5M1 26v-5a5 5 0 0 1 7-4m23 9v-5a5 5 0 0 0-7-4"/>',
 phone:'<rect x="8" y="2" width="16" height="28" rx="3"/><path d="M13 6h6m-4 20h2"/>',
 door:'<path d="M5 29V3h22v26M10 27V6l12 3v20ZM17 18h1M2 29h28"/>',
 rush:'<path d="m19 2-13 17h10l-3 11L27 12H17Z"/>',
 hide:'<circle cx="16" cy="16" r="12"/><path d="m8 8 16 16M5 26 27 4"/>',
 hands:'<path d="M9 18V7a2 2 0 0 1 4 0v9-12a2 2 0 0 1 4 0v12-10a2 2 0 0 1 4 0v11-7a2 2 0 0 1 4 0v12q0 8-9 8c-5 0-7-2-10-7l-3-5a2 2 0 0 1 3-3l5 5"/>',
 bag:'<path d="M5 9h22l2 20H3ZM11 11V7a5 5 0 0 1 10 0v4"/>',
 scissors:'<circle cx="8" cy="23" r="5"/><circle cx="24" cy="23" r="5"/><path d="M11 19 26 3M21 19 6 3"/>',
 pet:'<ellipse cx="16" cy="22" rx="8" ry="6"/><ellipse cx="5" cy="13" rx="3" ry="4"/><ellipse cx="12" cy="7" rx="3" ry="4"/><ellipse cx="21" cy="7" rx="3" ry="4"/><ellipse cx="28" cy="13" rx="3" ry="4"/>',
 cup:'<path d="M4 11h20v9a9 9 0 0 1-18 0v-9ZM24 13h2a5 5 0 0 1 0 10h-3M3 30h25M9 2v4m7-4v4"/>'
};
export function visual(name,extra=''){return `<svg class="lesson-icon ${extra}" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.chat}</svg>`;}
