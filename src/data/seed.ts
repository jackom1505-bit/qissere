export const LOCATION = "Somewhere in India";
export const INSTAGRAM_URL = "https://www.instagram.com/qissare";
export const INSTAGRAM_HANDLE = "@qissare";

export interface LetterEra {
  letter: string;
  revealed: boolean;
  meaning?: string;
  note?: string;
}

export const LETTERS: LetterEra[] = [
  { letter: "Q", revealed: true, meaning: "Qissa — story", note: "Chapter 01 · Now" },
  { letter: "I", revealed: false },
  { letter: "S", revealed: false },
  { letter: "S", revealed: false },
  { letter: "A", revealed: false },
  { letter: "R", revealed: false },
  { letter: "É", revealed: false },
];

export interface JournalEntry {
  no: string;
  title: string;
  status: "Revealed" | "Unfolding" | "Sealed";
  blurb: string;
  date: string;
}

export const JOURNAL: JournalEntry[] = [
  { no: "001", title: "The Name", status: "Revealed", blurb: "Why Qissaré exists — and why it had to start with a Q.", date: "Now" },
  { no: "002", title: "Finding the Place", status: "Unfolding", blurb: "Somewhere in India, a room is waiting without knowing it. We're narrowing it down to one city.", date: "Soon" },
  { no: "003", title: "Revealing the Menu", status: "Sealed", blurb: "One page at a time. Drinks with names you'll argue about, and a few we're still tasting.", date: "Sealed" },
  { no: "004", title: "Your Suggestions", status: "Sealed", blurb: "Yes, we want your help. Which drink, which chair, which song — you'll decide more than you think.", date: "Sealed" },
  { no: "005", title: "First Sketch", status: "Sealed", blurb: "Pencil on paper. Roof lines, a terrace, too many plants.", date: "Sealed" },
  { no: "006", title: "Building Begins", status: "Sealed", blurb: "Dust, timber, copper, and a great deal of patience.", date: "Sealed" },
  { no: "007", title: "First Cup", status: "Sealed", blurb: "The one we'll photograph before we serve anyone.", date: "Sealed" },
  { no: "008", title: "Finally, The Doors Open", status: "Sealed", blurb: "The chapter we've all been waiting for. You'll be the first to know the date.", date: "Sealed" },
];

export interface SecretContent {
  id: string;
  kicker: string;
  title: string;
  line: string;
  code: string;
}

export const SECRETS: Record<string, SecretContent> = {
  bean: {
    id: "bean",
    kicker: "You found the one that never turned dark.",
    title: "Secret — The Golden Bean",
    line: "In every batch of beans, we'll hide one golden bean in the small boxes. Whoever finds it in their bag drinks free for a month. It's real. It started here.",
    code: "QISSA-GOLD-01",
  },
  telephone: {
    id: "telephone",
    kicker: "The line isn't dead yet.",
    title: "Secret — The Telephone",
    line: "There will be one working telephone in the café. It rings only when a new chapter drops. Answer it and you'll hear the news first.",
    code: "QISSA-RING-02",
  },
  envelope: {
    id: "envelope",
    kicker: "Letters travel slowly on purpose.",
    title: "Secret — The Envelope",
    line: "Sealed envelopes will be hidden across the café on opening day. No sender. No name. Just something someone once wanted you to read.",
    code: "QISSA-SEAL-03",
  },
  book: {
    id: "book",
    kicker: "Some pages write back.",
    title: "Secret — The Book",
    line: "A journal will live on the community table. Every entry stays. Years from now, someone will read what you've written tonight.",
    code: "QISSA-PAGE-04",
  },
  photograph: {
    id: "photograph",
    kicker: "Chemistry, not pixels.",
    title: "Secret — The Photograph",
    line: "The first hundred faces at Qissaré will be shot on film and pinned to the west wall. No filters. No retakes. Just the first cup.",
    code: "QISSA-FILM-05",
  },
};

export const SECRET_ITEMS: { id: keyof typeof SECRETS; label: string; hint: string }[] = [
  { id: "telephone", label: "The Telephone", hint: "It rings when a new chapter drops." },
  { id: "envelope", label: "The Envelope", hint: "Sealed letters travel to opening day." },
  { id: "book", label: "The Book", hint: "The journal writes itself slowly." },
  { id: "photograph", label: "The Photograph", hint: "Film, not filters." },
  { id: "bean", label: "The Golden Bean", hint: "One bean in the roaster never turns dark. Did you click it?" },
];
