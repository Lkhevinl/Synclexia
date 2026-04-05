// Context-aware messages Lexi shows on each screen.
// Each key maps to the React Navigation route name.
// Multiple messages rotate randomly each visit.

const MESSAGES = {
  // ── Tab screens ──────────────────────────────────────────────────────────
  Dashboard: [
    "Welcome back! 🏠 Tap any activity card to start practicing!",
    "Keep your streak going! 🔥 A little practice every day goes a long way!",
    "You're doing great! Check your stats to see how far you've come! 📈",
  ],
  TTS: [
    "Text-to-Speech! 🔊 Type anything and I'll read it out loud for you!",
    "Each word lights up as it's spoken — great for following along! 👀",
    "Try pasting a sentence from a book to hear how it sounds! 📖",
  ],
  Scan: [
    "Magic Scanner! 📷 Take a photo of any book page or worksheet!",
    "I'll scan the text and read it aloud for you! Point and shoot! 🎯",
  ],
  STT: [
    "Speech-to-Text! 🎙️ Tap the mic, speak clearly, and I'll write it down!",
    "Try saying a full sentence slowly — I'm listening! 👂",
  ],

  // ── Learning screens ──────────────────────────────────────────────────────
  Phonics: [
    "Phonics time! 🔤 Here you'll learn how letters and sounds connect.",
    "Listen carefully to each sound and try to repeat it out loud! 🎵",
    "Phonics is the building block of reading — you've got this! 💪",
  ],
  PhonicsActivity: [
    "Great work getting here! 🎉 Now let's practice those sounds!",
    "Tap the correct answer — trust your ears! 👂",
    "Take your time reading each choice carefully before you tap! 🧐",
  ],
  Reading: [
    "Reading time! 📚 Read the story carefully from start to finish.",
    "If you get stuck on a word, try sounding it out letter by letter! 🔤",
    "Good readers read slowly and think about what each sentence means! 🤔",
  ],
  Writing: [
    "Writing practice! ✍️ Follow the guide lines carefully.",
    "Take it slow — good handwriting takes practice! One letter at a time! 🐢",
    "Tracing helps your fingers remember the shape of each letter! ✏️",
  ],
  Spelling: [
    "Spelling challenge! 🔡 Listen to the word, then spell it out!",
    "Tip: Break the word into syllables — it makes spelling easier! 🧩",
    "Sound it out in your head before typing — s-p-e-l-l-i-n-g! 🎯",
  ],
  PhonologicalAwareness: [
    "Sound patterns! 🎶 Listen for rhymes, syllables, and word sounds!",
    "Clap along to the syllables to feel the rhythm of each word! 👏",
    "Can you hear the sound at the start of each word? Focus! 🦻",
  ],
  AIInsights: [
    "This is your full learning report! 📊 Check your strengths and focus areas.",
    "Tap any activity to jump straight to practicing it! 🚀",
  ],

  // ── Tool screens (also accessible as stack screens) ──────────────────────
  SpeechToText: [
    "Speak clearly into the mic 🎙️ and I'll turn your words into text!",
    "This is great for practising speaking and listening at the same time! 👂",
  ],
  TextToSpeech: [
    "Type anything here and tap Play to hear it spoken aloud! 🔊",
    "Each word highlights as it's read — try following along! 👀",
  ],
};

/**
 * Returns a single message for the given route name.
 * Picks randomly from the array for variety.
 * Returns null if no message is defined for that route.
 */
export function getMessageForRoute(routeName) {
  const msgs = MESSAGES[routeName];
  if (!msgs?.length) return null;
  return msgs[Math.floor(Math.random() * msgs.length)];
}
