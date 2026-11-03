import {
  GAMES,
  CATEGORIES,
  COINS,
  WORDS,
  SIGHT,
  PRODUCTS,
  PHONEMES,
  LETTER_NAMES,
  categoryById,
  gameById,
} from "./curriculum.mjs";
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  "practice-" + Date.now() + "-" + Math.random().toString(36).slice(2);
export function shuffle(items, seed = Date.now()) {
  const a = items.slice();
  let s = seed >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (1664525 * s + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function settings(input = {}) {
  const mode = ["cdc", "preets", "esp"].includes(input.mode)
    ? input.mode
    : "cdc";
  return {
    mode,
    level: clamp(Number(input.level) || 1, 1, 12),
    category: categoryById(input.category).id,
    questions: mode === "cdc" ? false : !!input.questions,
    timed: mode === "cdc" ? false : !!input.timed,
    minutes:
      mode === "esp" && [5, 10, 15].includes(Number(input.minutes))
        ? Number(input.minutes)
        : 0,
    record: !!input.record,
  };
}
const choice = (label, icon, value = label) => ({
  id: String(value),
  label,
  icon,
  value,
});
function numberOptions(answer, count, seed) {
  const nums = new Set([answer]);
  let i = 1;
  while (nums.size < count) {
    nums.add(Math.max(0, answer + (i % 2 ? 1 : -1) * Math.ceil(i / 2)));
    i++;
  }
  return shuffle([...nums], seed).map((n) =>
    choice(String(n), "number-" + n, n),
  );
}
function coinList(amount) {
  const a = [];
  for (const c of [...COINS].reverse()) {
    while (amount >= c.value) {
      a.push(c.id);
      amount -= c.value;
    }
  }
  return a;
}
function chooseWord(level, round) {
  const pool =
    level <= 3
      ? WORDS.slice(0, 8)
      : level <= 5
        ? WORDS.slice(8, 13)
        : WORDS.slice(8);
  return pool[round % pool.length];
}
export function makeTask(game, opts = {}, round = 0, seed = 41) {
  const o = settings(opts),
    level = clamp(o.level, 1, gameById(game)?.levels || 1),
    many = o.mode === "cdc" ? 2 : level < 3 ? 3 : 4;
  let t = {
    game,
    level,
    round,
    seed,
    kind: "choice",
    options: [],
    objective: "",
    prompt: "",
    spoken: "",
    answer: null,
  };
  if (gameById(game)?.premium)
    return {
      ...t,
      kind: "premium",
      objective:
        game === "wordquest"
          ? "Recognize career and life-skills vocabulary in a twenty-word puzzle."
          : "Plan practical clothing for weather, safety and stated dress requirements.",
      prompt: "Open the complete game station.",
      spoken: "Choose your difficulty and play at your own pace.",
      options: [choice("Open game", "star", "open")],
      answer: "open",
    };
  if (game === "match") {
    const c = categoryById(o.category),
      count = Math.min(c.entries.length, level < 3 ? 2 : level < 5 ? 4 : 6),
      pool = shuffle(c.entries, seed + round).slice(0, count),
      steps = level === 6 ? 2 : 1;
    return {
      ...t,
      kind: "match",
      objective: c.objective,
      prompt:
        level === 6
          ? "Match each picture, then match its label."
          : "Match each picture to its partner.",
      spoken: "Choose a picture. Then choose its matching picture.",
      category: c.id,
      items: shuffle(pool, seed + 11).map((p) => ({ ...p })),
      targets: shuffle(pool, seed + 21),
      steps,
      answer: pool.map((p) => p.id),
    };
  }
  if (game === "coins") {
    t.objective =
      level < 5
        ? "Recognize coin names and values."
        : level < 8
          ? "Count identical coins and make simple amounts."
          : "Count mixed coins, pay and find change.";
    if (level <= 4) {
      const c = COINS[(level - 1 + round) % 4];
      Object.assign(t, {
        prompt:
          level < 3
            ? "Collect the " + c.label.toLowerCase() + "."
            : "Find the coin worth " + c.value + " cents.",
        spoken:
          level < 3
            ? "Drive to the " + c.label + "."
            : `Drive to the coin worth ${c.value} cents.`,
        options: shuffle(
          [
            ...shuffle(
              COINS.filter((x) => x.id !== c.id),
              seed + round,
            ).slice(0, many - 1),
            c,
          ],
          seed + round + 9,
        ).map((c) => choice(c.label, c.id, c.id)),
        answer: c.id,
        targetIcon: level < 3 ? c.id : "cent-" + c.value,
      });
    } else {
      const c = COINS[round % 4],
        count = 2 + (round % 3),
        mixed = level >= 8,
        amount = mixed ? [31, 40, 65, 76, 99, 100][round % 6] : c.value * count,
        coins = mixed ? coinList(amount) : Array(count).fill(c.id);
      let answer = amount,
        prompt = "How many cents? Collect the total.",
        spoken = "Count these coins. Drive to their total value.";
      if (level === 7) {
        prompt = `Make ${amount} cents. Which group pays the price?`;
        t.options = shuffle(
          [amount, amount + 5, Math.max(1, amount - 5)],
          seed,
        ).map((v) => choice(v + " cents", "coins-" + v, v));
      } else if (level >= 10) {
        const price = [25, 50, 75, 60, 35][round % 5],
          paid = 100;
        answer = paid - price;
        prompt = `Pay ${price} cents with $1. How much change?`;
        spoken = prompt;
        t.price = price;
        t.paid = paid;
      }
      Object.assign(t, {
        prompt,
        spoken,
        coins: level >= 10 ? ["one"] : coins,
        answer,
        targetIcon: "coin",
      });
      if (!t.options.length)
        t.options = numberOptions(answer, many, seed + round).map((p) => ({
          ...p,
          label: p.value + "¢",
        }));
    }
  } else if (game === "phonics") {
    const letters = ["A", "B", "C", "D", "F", "M", "S", "H"],
      letter = letters[round % letters.length],
      pic = {
        A: "apple",
        B: "ball",
        C: "cat",
        D: "dog",
        F: "fish",
        M: "moon",
        S: "sun",
        H: "hat",
      }[letter];
    t.objective =
      level <= 3
        ? "Recognize uppercase and lowercase letters."
        : level <= 6
          ? "Connect pictures and beginning sounds."
          : "Blend simple words and recognize sight words.";
    if (level <= 3) {
      const target = level === 2 ? letter.toLowerCase() : letter;
      Object.assign(t, {
        prompt:
          level === 3
            ? "Match lowercase " +
              letter.toLowerCase() +
              " to its uppercase letter."
            : "Pop the letter " + letter + ".",
        spoken:
          level === 3
            ? `This is lowercase ${LETTER_NAMES[letter]}. Pop uppercase ${LETTER_NAMES[letter]}.`
            : `Pop the letter ${LETTER_NAMES[letter]}.`,
        answer: target,
        targetIcon: "letter-" + (level === 3 ? letter.toLowerCase() : letter),
        options: shuffle(letters, seed + round)
          .slice(0, many - 1)
          .filter((x) => x !== letter)
          .concat(letter)
          .map((l) =>
            choice(
              level === 2 ? l.toLowerCase() : l,
              "letter-" + (level === 2 ? l.toLowerCase() : l),
              level === 2 ? l.toLowerCase() : l,
            ),
          ),
      });
    } else if (level <= 6) {
      Object.assign(t, {
        prompt:
          level === 4
            ? "Pop the letter that starts " + pic + "."
            : `Listen: ${PHONEMES[letter] || letter}. Pop its picture.`,
        spoken:
          level === 4
            ? `The word is ${pic}. Its first sound is ${PHONEMES[letter]}. Find the letter.`
            : `Listen to the first sound: ${PHONEMES[letter]}. Pop the picture that starts with that sound.`,
        targetIcon: pic,
        answer: level === 4 ? letter : pic,
        options: shuffle(letters, seed + round)
          .filter((x) => x !== letter)
          .slice(0, many - 1)
          .concat(letter)
          .map((l) =>
            level === 4
              ? choice(l, "letter-" + l, l)
              : choice(
                  {
                    A: "Apple",
                    B: "Ball",
                    C: "Cat",
                    D: "Dog",
                    F: "Fish",
                    M: "Moon",
                    S: "Sun",
                    H: "Hat",
                  }[l],
                  {
                    A: "apple",
                    B: "ball",
                    C: "cat",
                    D: "dog",
                    F: "fish",
                    M: "moon",
                    S: "sun",
                    H: "hat",
                  }[l],
                  {
                    A: "apple",
                    B: "ball",
                    C: "cat",
                    D: "dog",
                    F: "fish",
                    M: "moon",
                    S: "sun",
                    H: "hat",
                  }[l],
                ),
          ),
      });
    } else {
      const w = chooseWord(1, round);
      const target = level === 9 ? SIGHT[round % SIGHT.length] : w.word;
      Object.assign(t, {
        prompt:
          level === 9
            ? "Pop the word " + target + "."
            : `Blend ${w.word.split("").join(" · ")}. Find ${w.word}.`,
        spoken:
          level === 9
            ? "Pop the word " + target + "."
            : `Listen. ${w.word
                .split("")
                .map((l) => PHONEMES[l]?.split(",")[0] || l)
                .join(
                  ". ",
                )}. ${w.word.toLowerCase()}. Pop the word ${w.word.toLowerCase()}.`,
        targetIcon: level === 9 ? "word-" + target : w.icon,
        answer: target,
        options: shuffle(
          (level === 9 ? SIGHT : WORDS.slice(0, 8).map((w) => w.word)).filter(
            (x) => x !== target,
          ),
          seed,
        )
          .slice(0, many - 1)
          .concat(target)
          .map((s) => choice(s, "word-" + s, s)),
      });
    }
    t.options = shuffle(t.options, seed + round + 9);
  } else if (game === "monsters") {
    let answer = 1 + (round % (level === 1 ? 5 : level <= 3 ? 10 : 20)),
      left = answer,
      right = 0,
      prompt = `Feed me ${answer} stars.`,
      spoken = prompt;
    const limit = level === 1 ? 5 : level <= 3 ? 10 : 20;
    if (level >= 5 && level <= 6) {
      left = 1 + (round % 8);
      right = 1 + ((round * 3) % 7);
      answer = left + right;
      prompt = `${left} + ${right}. Feed me the total.`;
      spoken = `${left} plus ${right}. Feed me that many stars.`;
    }
    if (level === 7) {
      left = 5 + (round % 12);
      right = 1 + (round % 4);
      answer = left - right;
      prompt = `${left} − ${right}. Feed me what is left.`;
      spoken = `Start with ${left}. Take away ${right}. How many are left?`;
    }
    if (level === 8) {
      prompt = `${answer - 1}, __, ${answer + 1}. Feed me the missing number.`;
      spoken = `${answer - 1}. What comes next? Then ${answer + 1}. Feed me the missing number.`;
    }
    if (level === 9) {
      answer = 10 + (round % 21);
      prompt = `Count by twos to ${answer % 2 ? answer + 1 : answer}.`;
      answer = answer % 2 ? answer + 1 : answer;
      spoken = `Feed me ${answer} stars. Count by twos if you can.`;
    }
    Object.assign(t, {
      kind: "feed",
      answer,
      left,
      right,
      prompt,
      spoken,
      targetIcon: "number-" + answer,
      limit: Math.max(limit, answer + 2),
      objective:
        level < 5
          ? "Count objects using one-to-one correspondence."
          : level <= 7
            ? "Model addition and subtraction with objects."
            : "Find missing numbers and count larger groups.",
    });
  } else if (game === "words") {
    const w = chooseWord(level, round),
      word = level === 1 ? "ABC"[round % 3] : w.word;
    Object.assign(t, {
      kind: "word",
      word,
      answer: word,
      targetIcon: level === 1 ? "letter-" + word : w.icon,
      prompt:
        level === 1
          ? "Deliver the letter " + word + "."
          : "Collect the letters. Deliver " + word + ".",
      spoken:
        level === 1
          ? `Drive to the letter ${LETTER_NAMES[word]}.`
          : `The word is ${word.toLowerCase()}. Collect its letters in order.`,
      objective:
        level === 1
          ? "Recognize and deliver a letter."
          : level <= 3
            ? "Spell three-letter picture words."
            : "Read and spell sight and workplace words.",
    });
    if (level === 4) {
      t.word = t.answer = SIGHT[round % SIGHT.length];
      t.prompt = "Collect the letters. Deliver " + t.word + ".";
      t.spoken = "The word is " + t.word + ". Collect its letters in order.";
      t.targetIcon = "word-" + t.word;
    }
  } else if (game === "store") {
    const p = PRODUCTS[round % PRODUCTS.length];
    Object.assign(t, {
      product: p,
      targetIcon: p.id,
      objective:
        level <= 3
          ? "Count and scan items at checkout."
          : level <= 6
            ? "Recognize prices and pay with pretend money."
            : "Complete purchases, count change and communicate with customers.",
    });
    if (level === 1) {
      Object.assign(t, {
        kind: "scan",
        answer: 1 + (round % 5),
        prompt: `Scan ${1 + (round % 5)} ${p.label.toLowerCase()} items.`,
        spoken: `Put ${1 + (round % 5)} items through the scanner.`,
      });
    } else if (level === 2) {
      const count = 1 + (round % 5);
      Object.assign(t, {
        prompt: "How many items are in the basket?",
        spoken: "Count the items. Choose how many.",
        quantity: count,
        answer: count,
        options: numberOptions(count, many, seed),
      });
    } else if (level === 3) {
      Object.assign(t, {
        prompt: `Find the price: ${p.cents} cents.`,
        spoken: `This ${p.label} costs ${p.cents} cents. Find the price.`,
        answer: p.cents,
        options: numberOptions(p.cents, many, seed).map((c) => ({
          ...c,
          label: c.value + "¢",
        })),
      });
    } else if (level === 4) {
      const c = COINS[round % 4];
      Object.assign(t, {
        prompt: `Pay with a ${c.label.toLowerCase()}.`,
        spoken: `Choose the ${c.label}.`,
        answer: c.id,
        options: shuffle(COINS, seed).map((c) => choice(c.label, c.id, c.id)),
      });
    } else if (level <= 6) {
      const price = level === 5 ? 25 : p.cents;
      Object.assign(t, {
        kind: "pay",
        price,
        answer: price,
        prompt: `Pay ${price} cents at the checkout.`,
        spoken: `Choose coins to make ${price} cents. Then finish paying.`,
        options: COINS.map((c) => choice(c.label, c.id, c.value)),
      });
    } else if (level === 7) {
      const price = p.cents,
        change = 100 - price;
      Object.assign(t, {
        price,
        paid: 100,
        prompt: `The total is ${price} cents. The customer pays $1. Give change.`,
        spoken: `The price is ${price} cents. The customer pays one dollar. How many cents of change?`,
        answer: change,
        options: numberOptions(change, many, seed).map((c) => ({
          ...c,
          label: c.value + "¢",
        })),
      });
    } else {
      const list =
          level === 8
            ? [
                [
                  "A customer arrives. What do you say?",
                  "Hello! How can I help?",
                  "greet",
                  ["Go away.", "greet", "Ignore the customer."],
                ],
                [
                  "You need help at checkout. What do you do?",
                  "Ask a supervisor for help.",
                  "help",
                  ["Guess the change.", "help", "Walk away."],
                ],
              ]
            : [
                [
                  "The customer received the wrong item.",
                  "Apologize and correct the order.",
                  "fix",
                  ["Keep arguing.", "fix", "Ignore it."],
                ],
                [
                  "The transaction is finished.",
                  "Thank you! Have a good day.",
                  "thanks",
                  ["Say nothing.", "thanks", "Hurry them out."],
                ],
              ],
        q = list[round % list.length];
      Object.assign(t, {
        prompt: q[0],
        spoken: q[0],
        answer: q[1],
        options: shuffle(
          [
            choice(q[1], q[2], q[1]),
            choice(q[3][0], "wait", q[3][0]),
            choice(q[3][2], "stop", q[3][2]),
          ],
          seed,
        ),
      });
    }
  }
  if (!t.spoken) t.spoken = t.prompt;
  return t;
}
export function wordChoices(task, index = 0) {
  const answer = task.word[index];
  return shuffle(
    [
      ...new Set([
        answer,
        ...shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), task.seed + index)
          .filter((x) => x !== answer)
          .slice(0, 2),
      ]),
    ],
    task.seed + index + 17,
  ).map((l) => choice(l, "letter-" + l, l));
}
export function checkpoint(task) {
  if (task.kind === "pay")
    return {
      prompt: "How many cents did you pay?",
      spoken:
        "The total was " + task.price + " cents. How many cents did you pay?",
      options: numberOptions(task.answer, 3, task.seed + 8),
      answer: task.answer,
      objective: task.objective,
    };
  if (task.kind === "word")
    return {
      prompt: "How many letters are in " + task.word + "?",
      spoken: "Count the letters in " + task.word + ". How many?",
      options: numberOptions(task.word.length, 3, task.seed + 8),
      answer: task.word.length,
      objective: task.objective,
    };
  if (task.kind === "match") {
    const p = task.items[task.round % task.items.length];
    return {
      prompt: `Which picture matches ${p.label.toLowerCase()}?`,
      spoken: `Which picture matches ${p.label.toLowerCase()}?`,
      options: task.targets.map((p) => choice(p.target, p.targetIcon, p.id)),
      answer: p.id,
      objective: task.objective,
    };
  }
  return {
    prompt: "Show what you practiced. " + task.prompt,
    spoken: task.spoken,
    options: task.options?.length
      ? task.options
      : numberOptions(
          Number(task.answer) || task.word?.length || 1,
          3,
          task.seed + 4,
        ),
    answer: task.options?.length
      ? task.answer
      : Number(task.answer) || task.word?.length || 1,
    objective: task.objective,
  };
}
export function newRun(game, options = {}, now = Date.now()) {
  if (!gameById(game)) throw Error("Unknown game");
  return {
    id: uid(),
    game,
    options: settings(options),
    startedAt: new Date(now).toISOString(),
    endedAt: null,
    activeMs: 0,
    rounds: [],
    assistance: [],
    notes: "",
    status: "playing",
  };
}
export function recordAttempt(
  run,
  { correct, task, kind = "game", choice: answer },
  now = Date.now(),
) {
  if (run.status !== "playing") return false;
  run.rounds.push({
    at: new Date(now).toISOString(),
    level: task.level,
    round: task.round,
    kind,
    objective: task.objective,
    correct: !!correct,
    choice: String(answer).slice(0, 160),
  });
  return true;
}
export function summary(run) {
  const a = run.rounds || [],
    game = a.filter((x) => x.kind === "game"),
    questions = a.filter((x) => x.kind === "question"),
    completed = a.filter((x) => x.kind === "round" && x.correct);
  return {
    attempts: game.length,
    correct: game.filter((x) => x.correct).length,
    accuracy: game.length
      ? Math.round((game.filter((x) => x.correct).length / game.length) * 100)
      : null,
    questions: questions.length,
    questionCorrect: questions.filter((x) => x.correct).length,
    rounds: completed.length,
    levels: [...new Set(completed.map((x) => x.level))],
    skills: [...new Set(a.map((x) => x.objective).filter(Boolean))],
    minutes: Math.round((run.activeMs || 0) / 600) / 100,
    stars: completed.reduce(
      (n, r) =>
        n +
        (run.options.mode === "cdc" || gameById(run.game)?.premium
          ? 3
          : game.some((a) => a.round === r.round && !a.correct)
            ? 1
            : 3),
      0,
    ),
  };
}
export class ActiveClock {
  constructor(now = 0) {
    this.last = now;
    this.interaction = now;
    this.visible = true;
    this.paused = false;
  }
  touch(now) {
    this.interaction = now;
  }
  tick(now, { visible = true, paused = false } = {}) {
    const delta = Math.max(0, Math.min(5000, now - this.last));
    const end = Math.min(now, this.interaction + 60000);
    const active =
      now - this.last <= 5000 &&
      this.visible &&
      !this.paused &&
      visible &&
      !paused
        ? Math.max(0, Math.min(delta, end - this.last))
        : 0;
    this.last = now;
    this.visible = visible;
    this.paused = paused;
    return active;
  }
}
