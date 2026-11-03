import { escapeHTML as esc } from "../learning/progress.mjs";
const colors = {
  red: "#e75864",
  yellow: "#efbf4c",
  blue: "#568ed5",
  green: "#55a17e",
  "orange-color": "#e4954c",
  purple: "#9674c6",
};
const text = (s, size = 29, y = 73) =>
  `<text x="64" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${size}" fill="#243c56">${esc(s)}</text>`;
export function picture(id, label = "") {
  const equivalent = {
    produce: "apple",
    dairy: "milk",
    bakery: "bread",
    seafood: "fish",
    frozen: "icecream",
    household: "soap",
  };
  if (equivalent[id]) return picture(equivalent[id], label || id);

  if (["penny", "nickel", "dime", "quarter", "one", "five", "ten"].includes(id))
    return `<img class="coin-photo" src="assets/money-match/${id}.webp" alt="${esc(label || id)}" draggable="false">`;
  let shape = "",
    bg = "#e8f4f5";
  const stroke = 'stroke="#34516b" stroke-width="3" stroke-linejoin="round"';
  if (colors[id]) {
    bg = colors[id] + "25";
    shape = `<circle cx="64" cy="60" r="35" fill="${colors[id]}"/><ellipse cx="54" cy="44" rx="17" ry="8" fill="white" opacity=".3"/>`;
  } else if (/^(letter|word|number|cent)-/.test(id)) {
    const v =
      id.slice(id.indexOf("-") + 1) + (id.startsWith("cent-") ? "¢" : "");
    shape = text(v, Math.min(50, 90 / (v.length * 0.61)), 80);
  } else if (id.startsWith("dots-")) {
    const n = Number(id.split("-")[1]);
    shape = Array.from(
      { length: n },
      (_, i) =>
        `<circle cx="${32 + (i % 3) * 32}" cy="${43 + Math.floor(i / 3) * 35}" r="12" fill="#916bc2"/>`,
    ).join("");
  } else if (id.startsWith("coins-")) {
    shape = `<circle cx="52" cy="65" r="30" fill="#e7c477" ${stroke}/><circle cx="75" cy="52" r="28" fill="#b8c8d4" ${stroke}/>${text(id.slice(6) + "¢", 22, 68)}`;
  } else if (
    ["circle", "square", "triangle", "rectangle", "star", "octagon"].includes(
      id,
    )
  ) {
    shape = {
      circle: '<circle cx="64" cy="62" r="34"/>',
      square: '<rect x="30" y="28" width="68" height="68" rx="7"/>',
      rectangle: '<rect x="20" y="38" width="88" height="53" rx="7"/>',
      triangle: '<path d="M64 24L106 96H22Z"/>',
      star: '<path d="M64 18 77 45 108 49 86 72 91 103 64 89 37 103 42 72 20 49 51 45Z"/>',
      octagon: '<path d="M47 23H81L105 47V81L81 105H47L23 81V47Z"/>',
    }[id];
    shape = `<g fill="#b398d4" ${stroke}>${shape}</g>`;
  } else if (["apple", "orange", "grape", "leaf", "produce"].includes(id)) {
    shape =
      id === "leaf"
        ? `<path d="M28 97Q7 20 100 24Q110 100 28 97" fill="#5f9f77"/><path d="M29 96L87 39" ${stroke}/>`
        : id === "grape"
          ? Array.from(
              { length: 9 },
              (_, i) =>
                `<circle cx="${42 + (i % 3) * 20}" cy="${42 + Math.floor(i / 3) * 20}" r="14" fill="#9874bf"/>`,
            ).join("")
          : `<path d="M65 41C30 19 13 62 34 91Q45 111 64 101Q85 113 99 87C118 51 97 24 65 41" fill="${id === "orange" ? "#efaa4e" : "#e97879"}" ${stroke}/><path d="M65 42Q59 18 80 18" fill="none" ${stroke}/><path d="M70 28Q89 10 99 26Q89 42 70 28" fill="#6aa77b"/>`;
  } else if (["cat", "dog", "fish"].includes(id)) {
    shape =
      id === "fish"
        ? `<path d="M27 62Q55 15 95 60L117 36V93L94 70Q57 110 27 62" fill="#6daec1" ${stroke}/><circle cx="46" cy="58" r="4" fill="#263f56"/>`
        : `<path d="M29 46L26 16L53 35M76 35L104 17L99 49" fill="${id === "cat" ? "#e7b36c" : "#b68b6a"}" ${stroke}/><ellipse cx="64" cy="68" rx="41" ry="38" fill="${id === "cat" ? "#efc38b" : "#d8b494"}" ${stroke}/><circle cx="48" cy="61" r="4" fill="#243e53"/><circle cx="80" cy="61" r="4" fill="#243e53"/><path d="M58 76L70 76L64 83ZM48 87Q64 100 80 87" fill="#ce7790" ${stroke}/>`;
  } else if (
    ["sun", "moon", "rain", "snow", "puddle", "wind", "cold"].includes(id)
  ) {
    shape =
      id === "sun"
        ? `<circle cx="64" cy="64" r="26" fill="#efc86c"/>${Array.from({ length: 8 }, (_, i) => `<path d="M64 17V28" stroke="#e0a84f" stroke-width="5" transform="rotate(${i * 45} 64 64)"/>`).join("")}`
        : id === "moon"
          ? `<path d="M89 22C26 0 14 99 76 105Q105 101 110 78C64 93 44 47 89 22" fill="#ead48f"/>`
          : id === "wind"
            ? `<path d="M20 45H83Q114 28 94 24M15 65H106M22 84H75Q101 100 89 109" fill="none" stroke="#68a7bd" stroke-width="7" stroke-linecap="round"/>`
            : `<path d="M27 62C-3 40 30 16 47 32C58 6 96 15 97 36C129 38 119 68 99 68H27" fill="#87adc5"/>${Array.from({ length: 4 }, (_, i) => `<path d="M${34 + i * 21} 82l-6 18" stroke="${id === "snow" ? "#bad6e5" : "#65a8d2"}" stroke-width="7" stroke-linecap="round"/>`).join("")}`;
  } else if (
    [
      "shirt",
      "white-shirt",
      "dark-shirt",
      "pink-shirt",
      "wet-shirt",
      "raincoat",
      "coat",
      "jacket",
      "sweater",
      "colors",
      "darks",
      "whites",
      "gentle",
      "dry",
    ].includes(id)
  ) {
    const fill = id.includes("white")
      ? "#fff"
      : id.includes("dark")
        ? "#3e5276"
        : id.includes("pink") || id === "colors"
          ? "#d98bb6"
          : id === "raincoat"
            ? "#e6bf5c"
            : "#76adc4";
    shape = `<path d="M43 23L22 32L9 57L30 69L37 57V109H91V57L98 69L119 57L106 32L85 23Q64 45 43 23" fill="${fill}" ${stroke}/><path d="M64 44V104" stroke="white" stroke-width="3" opacity=".45"/>`;
  } else if (
    [
      "hat",
      "boots",
      "gloves",
      "towel",
      "towels",
      "ovenmitt",
      "goggles",
      "wear-goggles",
      "scissors",
    ].includes(id)
  ) {
    shape =
      id === "hat"
        ? `<path d="M20 87Q64 69 108 87L119 97H8ZM35 78L44 30H83L95 78" fill="#dfa5b4" ${stroke}/><path d="M41 64H88" stroke="#b97190" stroke-width="10"/>`
        : id.includes("goggles")
          ? `<path d="M15 48H52L60 58H68L76 48H113V81H78L68 69H60L50 81H15Z" fill="#8ac6d4" ${stroke}/><path d="M0 50H17M112 50H128" ${stroke}/>`
          : id === "scissors"
            ? `<g fill="none" stroke="#698d9e" stroke-width="8"><path d="M49 79L94 21M80 79L34 21"/><circle cx="37" cy="91" r="18" stroke="#bf749d"/><circle cx="91" cy="91" r="18" stroke="#bf749d"/></g>`
            : id === "towel" || id === "towels"
              ? `<rect x="22" y="36" width="85" height="66" rx="12" fill="#8fc4bd" ${stroke}/><path d="M22 81H107M43 37V100" ${stroke}/>`
              : `<path d="M42 24H76V64Q113 69 110 91Q103 114 39 104L25 84L34 63V28Z" fill="#e4b67e" ${stroke}/>`;
  } else if (["ball", "egg", "icecream"].includes(id)) {
    shape =
      id === "ball"
        ? `<circle cx="64" cy="64" r="42" fill="#dd9574" ${stroke}/><path d="M24 52Q64 75 104 52M32 93Q65 25 97 34" fill="none" ${stroke}/>`
        : id === "egg"
          ? '<ellipse cx="64" cy="65" rx="30" ry="43" fill="#f9efd4" stroke="#c9b894" stroke-width="3"/>'
          : '<path d="M35 63L65 112L94 63" fill="#dfb270"/><path d="M28 61C12 29 51 10 65 26C88 8 119 42 99 65" fill="#dfa2bf"/>';
  } else if (
    [
      "spoon",
      "whisk",
      "stir",
      "mix",
      "measure",
      "cup",
      "colander",
      "drain",
      "cut",
      "knife",
      "wrench",
      "rake",
      "brush",
      "stethoscope",
    ].includes(id)
  ) {
    if (["spoon", "whisk", "stir", "mix"].includes(id))
      shape = `<ellipse cx="64" cy="36" rx="21" ry="27" fill="#c1d1d9" ${stroke}/><path d="M64 61V112" stroke="#8ca3af" stroke-width="10" stroke-linecap="round"/>`;
    else if (["wrench", "rake", "knife", "cut", "brush"].includes(id))
      shape = `<path d="M44 16L41 41L62 52L82 34L85 12Q112 46 77 68L45 111L26 97L59 57Q21 45 44 16" fill="${id === "brush" ? "#d49bc3" : "#adc2cf"}" ${stroke}/>`;
    else if (id === "stethoscope")
      shape = `<path d="M26 20V50Q26 92 71 67Q85 57 85 24M58 76V96Q58 119 100 101V79" fill="none" stroke="#7ba6b4" stroke-width="9"/><circle cx="101" cy="74" r="11" fill="#b9cbd2"/>`;
    else
      shape = `<path d="M28 25H88V101H28Z" fill="#a0c6d5" ${stroke}/><path d="M89 41H110V75H89M35 42H54M35 62H54M35 82H54" fill="none" ${stroke}/>`;
  } else if (
    [
      "bread",
      "cereal",
      "milk",
      "butter",
      "marshmallow",
      "jar",
      "soap",
    ].includes(id)
  ) {
    shape =
      id === "bread"
        ? `<path d="M23 97V48C2 29 29 11 48 25C65 9 99 12 108 32Q116 46 101 51V97Z" fill="#e8bd85" ${stroke}/><path d="M37 83V49M60 83V46M83 83V49" stroke="#c49b69" stroke-width="5"/>`
        : id === "jar"
          ? `<rect x="34" y="29" width="60" height="77" rx="13" fill="#b98fae" ${stroke}/><rect x="31" y="19" width="66" height="19" rx="5" fill="#86a5c4"/><rect x="40" y="49" width="48" height="32" rx="8" fill="#fff4de"/>`
          : `<path d="M31 27L91 24L103 43V108H28V43Z" fill="${id === "milk" ? "#faf5e9" : id === "cereal" ? "#8ab9cd" : id === "butter" ? "#e6c96e" : "#d6afcc"}" ${stroke}/><path d="M31 27L46 13H83L91 24" fill="#bbd3dc" ${stroke}/><rect x="39" y="50" width="51" height="36" rx="9" fill="#fff9e9"/>${text(id === "milk" ? "MILK" : id === "butter" ? "BUTTER" : id === "soap" ? "SOAP" : id === "cereal" ? "CEREAL" : "MINIS", 11, 73)}`;
  } else if (
    [
      "stop",
      "hot",
      "wetfloor",
      "exit",
      "handwash",
      "wait",
      "walk",
      "exit-door",
      "sink",
    ].includes(id)
  ) {
    const fill = id === "stop" ? "#d96b77" : "#e6c579";
    shape =
      id === "stop"
        ? `<path d="M45 20H83L108 45V83L83 108H45L20 83V45Z" fill="${fill}"/>${text("STOP", 24, 73)}`
        : id.includes("exit")
          ? `<rect x="26" y="21" width="75" height="88" rx="6" fill="#69a891"/>${text("EXIT", 20, 52)}<path d="M40 80H87L76 69M87 80L76 91" fill="none" stroke="white" stroke-width="7"/>`
          : `<path d="M64 16L118 110H10Z" fill="${fill}" ${stroke}/>${text(id === "hot" ? "♨" : id === "wetfloor" ? "!" : id === "handwash" ? "H₂O" : "!", 35, 89)}`;
  } else if (id === "cone") {
    shape =
      '<path d="M64 13L97 104H31Z" fill="#e5a069" stroke="#a97053" stroke-width="3"/><path d="M48 57H80M39 83H89" stroke="#fff3df" stroke-width="13"/><rect x="20" y="102" width="88" height="12" rx="4" fill="#a6765d"/>';
  } else if (["monster"].includes(id)) {
    shape = `<path d="M20 93L14 35L37 43Q64 18 92 43L115 34L108 97Q64 122 20 93" fill="#8cbfad" ${stroke}/><circle cx="45" cy="57" r="13" fill="white"/><circle cx="85" cy="57" r="13" fill="white"/><circle cx="47" cy="58" r="6" fill="#273f56"/><circle cx="83" cy="58" r="6" fill="#273f56"/><path d="M34 78Q64 114 96 78" fill="#485877"/><rect x="51" y="79" width="12" height="13" rx="3" fill="white"/>`;
  } else if (["truck", "bus", "car"].includes(id)) {
    shape = `<rect x="10" y="37" width="67" height="57" rx="12" fill="#c8a0cb" ${stroke}/><path d="M77 53H102L119 75V94H76Z" fill="#73acc6" ${stroke}/><path d="M86 59H99L110 73H86Z" fill="#d9edf4"/><circle cx="34" cy="96" r="14" fill="#37506a"/><circle cx="98" cy="96" r="14" fill="#37506a"/><circle cx="34" cy="96" r="6" fill="#bed1dc"/><circle cx="98" cy="96" r="6" fill="#bed1dc"/>`;
  } else if (
    [
      "kitchen",
      "school",
      "hospital",
      "garage",
      "store",
      "farm",
      "bakery",
      "dairy",
      "seafood",
      "frozen",
      "household",
      "basket",
      "window",
      "door",
      "roof",
    ].includes(id)
  ) {
    shape =
      id === "basket"
        ? `<path d="M17 49H111L96 106H31Z" fill="#91bcbc" ${stroke}/><path d="M38 49L53 24M90 49L76 24M48 61V92M65 61V92M82 61V92" ${stroke}/>`
        : `<path d="M16 52L64 16L112 52Z" fill="#bc97b7" ${stroke}/><rect x="24" y="53" width="80" height="57" rx="4" fill="#c5dadd" ${stroke}/><rect x="54" y="72" width="22" height="38" fill="#7894b6"/><rect x="32" y="64" width="15" height="19" fill="#fff2c3"/><rect x="82" y="64" width="15" height="19" fill="#fff2c3"/>${id === "hospital" ? '<path d="M58 31H70M64 25V37" stroke="white" stroke-width="6"/>' : ""}`;
  } else if (
    [
      "greet",
      "thanks",
      "talk",
      "listen",
      "help",
      "share",
      "fix",
      "alternative",
      "plan",
      "break",
      "breathe",
    ].includes(id)
  ) {
    if (["talk", "greet", "thanks", "share"].includes(id))
      shape = `<circle cx="33" cy="65" r="18" fill="#e4bd9e"/><circle cx="95" cy="65" r="18" fill="#b9947b"/><path d="M10 111V98Q33 75 57 98V111M70 111V98Q95 75 119 98V111" fill="#8bb4cc"/><path d="M38 12H105V45H77L63 59V45H38Z" fill="#fff4d9" ${stroke}/><path d="M50 27H92M55 35H87" stroke="#84a7b2" stroke-width="4"/>`;
    else if (id === "listen")
      shape = `<path d="M76 102C58 114 59 91 50 80C12 43 54 6 82 26Q111 45 78 72C64 83 86 89 76 102" fill="#e7c0a4" ${stroke}/><path d="M43 20Q19 49 38 72M28 15Q0 50 23 83" fill="none" stroke="#8eb6cb" stroke-width="5"/>`;
    else if (id === "help")
      shape = `<path d="M33 109V75L17 60Q10 50 22 48L40 62V22Q43 11 49 22V50V13Q56 3 61 13V47V19Q69 9 74 19V52V31Q81 23 87 35V82Q90 101 72 111Z" fill="#e4bd9e" ${stroke}/><circle cx="102" cy="29" r="21" fill="#b8d9e2"/>${text("?", 25, 38).replace('x="64"', 'x="102"')}`;
    else if (id === "breathe")
      shape = `<circle cx="64" cy="66" r="34" fill="#bfdccf"/><path d="M17 39Q33 21 44 39M111 93Q95 110 83 93" fill="none" stroke="#72a3b5" stroke-width="7"/><path d="M50 64Q55 70 60 64M71 64Q76 70 81 64M57 81Q65 86 74 81" fill="none" ${stroke}/>`;
    else if (id === "break")
      shape = `<rect x="23" y="22" width="25" height="85" rx="9" fill="#91b5c7"/><rect x="78" y="22" width="25" height="85" rx="9" fill="#91b5c7"/>`;
    else if (id === "fix")
      shape = `<path d="M20 54A44 44 0 1 1 35 105M20 25V54H49" fill="none" stroke="#7cae9a" stroke-width="9"/><path d="M44 73L60 89L88 57" fill="none" stroke="#537891" stroke-width="9"/>`;
    else if (id === "alternative")
      shape = `<path d="M24 63H98M82 45L100 63L82 81" fill="none" stroke="#8e7caa" stroke-width="9"/><circle cx="23" cy="63" r="15" fill="#d6adbd"/>`;
    else
      shape = `<rect x="27" y="19" width="76" height="96" rx="11" fill="#fff9eb" ${stroke}/><path d="M41 45L47 51L58 35M41 75L47 81L58 65M68 44H90M68 75H90" fill="none" stroke="#7fa58e" stroke-width="5"/>`;
  } else if (["clock", "map", "match", "coin", "bubble"].includes(id)) {
    shape =
      id === "clock"
        ? '<circle cx="64" cy="64" r="42" fill="#fff8e8" stroke="#6a9db1" stroke-width="7"/><path d="M64 35V64L85 78" fill="none" stroke="#43617e" stroke-width="5"/>'
        : id === "match"
          ? '<rect x="15" y="24" width="45" height="73" rx="12" fill="#bba3d7"/><rect x="69" y="24" width="45" height="73" rx="12" fill="#9bc9d6"/><circle cx="38" cy="59" r="13" fill="#fff5df"/><circle cx="92" cy="59" r="13" fill="#fff5df"/>'
          : id === "bubble"
            ? '<circle cx="45" cy="50" r="29" fill="#c1b4e4"/><circle cx="86" cy="84" r="27" fill="#9bd6db"/><path d="M30 38L43 31M72 72L83 66" stroke="white" stroke-width="6" stroke-linecap="round"/>'
            : id === "coin"
              ? '<circle cx="64" cy="64" r="43" fill="#e8c57b" stroke="#c39756" stroke-width="5"/><circle cx="64" cy="64" r="33" fill="none" stroke="#fff1ba" stroke-width="3"/>' +
                text("¢", 42, 78)
              : '<path d="M14 31L45 22L82 33L113 22V99L82 111L45 99L14 109Z" fill="#c3ddcc" stroke="#719a93" stroke-width="3"/><path d="M32 78L57 55L80 73L99 43" fill="none" stroke="#c3859e" stroke-width="6"/>';
  } else {
    // people and communication situations use explicit pictured faces/gestures, with spoken labels.
    const mood = ["angry", "sad", "worried", "confused", "tired"].includes(id)
      ? id
      : "happy";
    shape = `<path d="M24 111Q24 74 64 75Q104 74 104 111" fill="#8fb3ce"/><circle cx="64" cy="48" r="29" fill="#e9c7a7" ${stroke}/><path d="M37 37Q57 0 92 33" fill="#60506b"/><circle cx="53" cy="49" r="3" fill="#34516b"/><circle cx="76" cy="49" r="3" fill="#34516b"/><path d="${mood === "sad" || mood === "worried" ? "M52 68Q64 55 77 68" : mood === "confused" || mood === "tired" ? "M55 66H73" : mood === "angry" ? "M52 64H77" : "M51 61Q64 76 78 61"}" fill="none" ${stroke}/>${["help", "talk", "greet", "listen", "thanks", "share", "fix", "alternative", "plan", "customer", "missing", "mistake", "done", "breathe", "break"].includes(id) ? '<path d="M82 17H122V50H104L90 60V50H82Z" fill="#fff6de" stroke="#6e9aaf" stroke-width="2"/><path d="M91 30H114M91 38H108" stroke="#8ea9bd" stroke-width="3"/>' : ["mechanic", "farmer", "teacher", "artist", "stylist", "cashier", "gardener"].includes(id) ? { mechanic: '<path d="M37 27Q44 3 75 7Q100 10 102 30H31" fill="#6b8ea9"/><path d="M90 89L114 65" stroke="#839ba6" stroke-width="10"/>', farmer: '<ellipse cx="66" cy="28" rx="47" ry="9" fill="#d9b56f"/><path d="M37 28L44 7H84L94 28" fill="#e5ca8a"/>', gardener: '<path d="M100 105V60M82 64H118M86 51V64M99 51V64M111 51V64" stroke="#759a7b" stroke-width="6"/>', teacher: '<rect x="83" y="10" width="43" height="65" rx="5" fill="#537e6a"/><path d="M92 25H118M92 39H112M92 53H118" stroke="white" stroke-width="3"/>', artist: '<ellipse cx="99" cy="88" rx="26" ry="18" fill="#c8a683"/><circle cx="92" cy="82" r="5" fill="#ce7c91"/><circle cx="110" cy="85" r="5" fill="#83a9cf"/>', stylist: '<path d="M95 106L119 54M115 103L94 56" stroke="#7b9fab" stroke-width="5"/><circle cx="93" cy="109" r="9" fill="none" stroke="#c18eaf" stroke-width="4"/>', cashier: '<rect x="80" y="88" width="45" height="30" rx="5" fill="#9ec5c4"/><rect x="91" y="70" width="25" height="21" rx="3" fill="#4f7086"/>' }[id] : id === "cook" ? '<path d="M36 31V17Q41 0 54 12Q66-2 78 12Q96 4 93 25V33Z" fill="#fff9ec"/>' : id === "nurse" ? '<rect x="48" y="10" width="34" height="21" rx="4" fill="white"/><path d="M58 20H72M65 13V27" stroke="#d27f96" stroke-width="4"/>' : ""}`;
  }
  return `<svg class="arcade-picture" viewBox="0 0 128 128" role="img" aria-label="${esc(label || id)}"><defs><radialGradient id="glow-${id.replace(/[^a-z0-9]/gi, "")}"><stop stop-color="#fff"/><stop offset="1" stop-color="${bg}"/></radialGradient></defs><rect x="2" y="2" width="124" height="124" rx="29" fill="url(#glow-${id.replace(/[^a-z0-9]/gi, "")})"/>${shape}</svg>`;
}
export function badge(label) {
  return `<span class="badge">${esc(label)}</span>`;
}
