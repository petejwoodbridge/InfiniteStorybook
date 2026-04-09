/**
 * Sample books pre-seeded into the library on first load.
 * Three stories — each a different genre, age range, and child author.
 * Images are generated lazily by LibraryScreen when an API key is present.
 */
export const SAMPLE_BOOKS = [
  {
    id: "sample-001",
    title: "The Dragon Who Couldn't Roar",
    savedAt: "2026-04-01T09:00:00.000Z",
    childName: "Mia",
    ageRange: "4-6",
    genre: "Magical",
    charDesc: "A small lavender dragon named Ember with tiny wings, big golden eyes, and a scarf knitted from moonbeams",
    prompts: ["a dragon who can only whisper", "a village of singing frogs", "a lost lullaby carved into a stone"],
    segments: [
      {
        text: "Deep in the Whispering Woods lived a small lavender dragon named Ember. All the other dragons could roar so loudly the mountains shook — but whenever Ember opened her mouth, only the softest little squeak came out. The other dragons laughed, but Ember didn't mind too much. She spent her days exploring, and one morning she followed a path of golden mushrooms to the edge of a sparkling pond… where an entire village of singing frogs was frozen completely silent. Their song had vanished overnight, stolen by a mischievous wind spirit.",
        choiceMade: null,
        sceneDesc: "A tiny lavender dragon with a moonbeam scarf stands at the edge of a shimmering pond, facing a village of small frogs who look worried and sad, with a misty forest behind her.",
        image: null,
      },
      {
        text: "Ember crept closer. The frogs explained that their song was stored in a magical stone at the top of Hum Hill, and the wind spirit had swirled it away. Without their song, flowers wouldn't bloom and babies couldn't sleep. Ember blinked her golden eyes. She couldn't roar, but perhaps — just perhaps — a whisper was exactly what was needed here. She climbed Hum Hill, and at the top found the stone glowing faintly, with the wind spirit coiled around it like a snoozing ribbon of air.",
        choiceMade: "Follow the path of golden mushrooms",
        sceneDesc: "Ember climbs a gentle glowing hill at sunset, the wind spirit wrapped sleepily around a carved humming stone at the very top.",
        image: null,
      },
      {
        text: "Ember leaned close to the stone and whispered the softest, most beautiful sound she had ever made — not quite a word, not quite a song, but something in between. The wind spirit stirred, yawned, and slowly unwound. The stone blazed gold! Down in the valley the frogs burst into glorious chorus, and every flower in the Whispering Woods opened at once. Ember felt a warm tickle rise in her chest — and suddenly, for the very first time, out came a roar. A small one. A perfect one. Hers.",
        choiceMade: "Whisper to the stone",
        sceneDesc: "Ember roars a tiny brilliant roar surrounded by exploding flowers, while hundreds of frogs cheer below in a sunlit valley.",
        image: null,
      },
    ],
    choices: [
      { emoji: "🎵", text: "Sing along with the frogs in the valley" },
      { emoji: "🌟", text: "Fly home and tell the other dragons" },
      { emoji: "🔍", text: "Look for more stolen songs in the forest" },
    ],
    isComplete: false,
    coverImage: null,
  },

  {
    id: "sample-002",
    title: "Captain Starling and the Missing Moon",
    savedAt: "2026-04-02T10:30:00.000Z",
    childName: "Leo",
    ageRange: "6-8",
    genre: "Adventure",
    charDesc: "A bold nine-year-old astronaut named Captain Starling with a rocket-shaped backpack, bright red boots, and a helmet covered in planet stickers",
    prompts: ["the moon goes missing", "a crew of space mice", "a map drawn in starlight"],
    segments: [
      {
        text: "On the night of the Grand Stargazing Festival, Captain Starling looked through her telescope and gasped — the moon was gone. Not cloudy-gone. Not hiding-behind-a-tree gone. Completely, utterly, impossible gone. Her crew of four space mice (Pip, Dot, Crumble and Whisk) were already suiting up before she had even finished gasping. They launched in T-minus twenty seconds, leaving a trail of silver sparks over the sleeping town below.",
        choiceMade: null,
        sceneDesc: "A rocket decorated with planet stickers blasts through a star-scattered sky, four tiny mice visible through the porthole windows, as a moon-less night stretches below.",
        image: null,
      },
      {
        text: "Deep in the asteroid belt, the crew spotted something extraordinary — a map drawn entirely in moving starlight, pointing toward the Singing Nebula. Pip translated (he was the best at reading star-script): the moon had been accidentally pocketed by a sleepy space giant who thought it was a marble. The giant was now snoring loudly somewhere inside the nebula, the moon tucked in his enormous jacket. Starling plotted a careful course. The tricky part: they had to get the moon out without waking him.",
        choiceMade: "Follow the starlight map",
        sceneDesc: "A swirling pink and gold nebula fills the view through the cockpit window, and a truly enormous sleeping giant floats inside it, a glowing marble-shaped moon poking from his jacket pocket.",
        image: null,
      },
      {
        text: "Crumble had an idea: distract the giant with the ship's entire supply of space cheese, delivered by catapult. While the giant's nose twitched dreamily toward the scent, Starling EVA'd over in her rocket-pack and gently, carefully, tugged the moon free. It was warm and humming softly, happy to be rescued. She cradled it all the way home and set it back in the sky just in time for the Festival. The crowd below cheered. The space mice took a bow. And the giant slept on, cheese-smile on his face.",
        choiceMade: "Use the space cheese distraction",
        sceneDesc: "Captain Starling in a spacesuit floats beside the glowing moon with both arms wrapped around it, a cheese-happy giant snoozing in the distance.",
        image: null,
      },
    ],
    choices: [
      { emoji: "🧀", text: "Restock the cheese supply at the Space Market" },
      { emoji: "🗺️", text: "Follow the starlight map to discover what else is lost" },
      { emoji: "💤", text: "Check on the giant and make sure he's okay" },
    ],
    isComplete: false,
    coverImage: null,
  },

  {
    id: "sample-003",
    title: "Pip and the Enchanted Seed",
    savedAt: "2026-04-04T08:15:00.000Z",
    childName: "Sam",
    ageRange: "4-6",
    genre: "Funny",
    charDesc: "A cheerful hedgehog named Pip with flower-petal shoes, a watering can hat, and a bright yellow raincoat two sizes too big",
    prompts: ["a seed that grows into a door", "a garden full of friendly clouds", "a secret bakery underground"],
    segments: [
      {
        text: "Pip the hedgehog found a shiny seed at the bottom of his watering can one spring morning. It was silver and warm, and it pulsed gently like a tiny heartbeat. He planted it in the soft earth at the centre of his garden and sang it a little song (he sang every plant a little song). By afternoon, where he had expected a sprout, there was a door — a proper wooden door with a brass handle, growing straight up out of the soil, surrounded by curious friendly clouds who had floated down to have a look. One cloud poked it with a fluffy tendril. The door went BONK.",
        choiceMade: null,
        sceneDesc: "Pip stands in front of a full-sized wooden door growing out of garden soil, surrounded by fluffy friendly clouds drifting at ground level in the sunshine, one cloud poking it curiously.",
        image: null,
      },
      {
        text: "The clouds nudged Pip encouragingly. He turned the handle. The door opened onto a set of cosy stairs leading underground, lit by strings of glowing berries. At the bottom was the most wonderful smell: warm bread, cinnamon, and something like honey mixed with starlight. It was a bakery — an entirely underground bakery, staffed by a team of cheerful moles in striped aprons, baking things Pip had never imagined. Cakes shaped like entire rainstorms. Rolls that tasted of Wednesday mornings. Pies filled with the memory of your best day ever. One mole tripped over his apron and sat in a trifle. SPLAT.",
        choiceMade: "Open the door and go in",
        sceneDesc: "Pip peers into a warm underground bakery lit by glowing berry-lights where moles in stripy aprons carry enormous cakes shaped like weather events, one mole sitting in a trifle.",
        image: null,
      },
    ],
    choices: [
      { emoji: "🥐", text: "Ask the moles to teach you their best recipe" },
      { emoji: "☁️", text: "Invite the friendly clouds in for a slice" },
      { emoji: "🌱", text: "Plant another seed and see what grows this time" },
    ],
    isComplete: false,
    coverImage: null,
  },
];
