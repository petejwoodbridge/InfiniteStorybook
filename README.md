# 📖 Infinite Storybook
### *A magical storybook that writes itself — starring your child's imagination*

> **"The stories children tell themselves become the people they grow up to be."**

Infinite Storybook is an AI-powered interactive storybook for children aged 2–12. Parents set the scene, children make the choices, and a beautifully illustrated story unfolds — different every single time.

---

## ✨ Why Children Love It

Every story stars a character **they designed**, in a world **they imagined**, making decisions **they control**. No two stories are ever the same.

---

## 🧒 How It Helps Your Child

### 📚 Builds a Love of Reading
Stories are beautifully typeset like a real illustrated book — with drop caps, parchment pages, and hand-crafted watercolour art. Reading feels like a special occasion, not a chore. Children who read for pleasure score higher in literacy, vocabulary, and comprehension across all subjects.

### 🧠 Develops Critical Thinking & Decision-Making
At the end of every page, children face **three branching choices** that shape what happens next. There are no wrong answers — only consequences to explore. This teaches cause-and-effect reasoning, weighing options, and ownership of outcomes in a completely safe, low-stakes environment.

### 🎨 Sparks Creative Imagination
Children provide the story ingredients — a character, a place, a surprise element. When they see their ideas rendered as a full illustrated story, it sends a powerful message: *your imagination has real power*. Over time this builds creative confidence that carries into writing, art, and problem-solving at school.

### 💬 Expands Vocabulary Naturally
Stories are tailored to your child's **exact age group**, from toddler-simple (ages 2–4) to pre-teen sophisticated (ages 10–12). Vocabulary and sentence complexity grow with the reader. Children absorb new words effortlessly when they're wrapped in a story they're invested in.

### 🤝 Encourages Empathy & Emotional Intelligence
Choose the **Friendship** or **Bedtime** genre and stories centre on kindness, teamwork and understanding feelings. Children walk in their character's shoes, experiencing challenges and emotions in a safe narrative space — a proven way to build empathy.

### 🔬 Makes Learning Exciting
Pick the **Learning** genre and fascinating real-world facts about science, nature, or history are woven naturally into the adventure. Children absorb knowledge without realising they're being taught.

### 🌙 A Calming Bedtime Ritual
The **Bedtime** genre produces slow, dreamy, soothing stories perfectly paced for winding down. A consistent reading ritual before sleep improves sleep quality and creates lasting positive associations with books.

### 👪 Quality Parent–Child Time
Reading together is one of the highest-impact things a parent can do for their child's development. Infinite Storybook makes it interactive — parents and children can discuss choices together, predict what might happen, and share the joy of a story unfolding in real time.

---

## 🎒 How It Works

| Step | What happens |
|------|--------------|
| **1. Set the scene** | Choose your child's age range, pick a genre (Adventure, Funny, Mystery, Magical…), and give the story three ingredients: a character, a place, and a surprise |
| **2. Design the hero** | Customise your character's colour, personality and outfit — AI generates a unique character portrait that appears consistently on every page |
| **3. Read together** | Each spread shows a full watercolour illustration on the left and the story text on the right, just like a real picture book |
| **4. Make the choice** | Your child picks from three story branches at the end of each page |
| **5. Save to your library** | Finished stories are saved automatically and can be re-read or continued any time |

---

## 🔒 Privacy & Safety

- **No account required.** No sign-up, no tracking, no data sent to any server.
- **Your API key stays in your browser.** It is never stored on any external service.
- **All content is child-appropriate.** The AI is instructed to produce age-appropriate, positive, safe stories.
- Works entirely offline once loaded (except for the AI API calls).

---

## 🚀 Getting Started (for parents / developers)

You need a free Google Gemini API key — takes about 60 seconds to get one.

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and create a free key
2. Clone this repo and run:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000), paste your key, and start your first story!

> The free Gemini tier is sufficient for dozens of stories per day.

---

## 🗂 Project Structure

```
InfiniteStorybook/
└── src/
    ├── App.jsx             # Root routing, global CSS, localStorage helpers
    ├── SetupScreen.jsx     # Story setup: age, genre, character designer
    ├── StoryScreen.jsx     # The book: two-page spread, page-turn, choices
    ├── LibraryScreen.jsx   # Saved story bookshelf
    ├── api.js              # Gemini API layer (images + text)
    ├── components.jsx      # Shared UI components
    └── constants.js        # Palette, fonts, options
```

---

## License

MIT — free to use, modify, and share.
