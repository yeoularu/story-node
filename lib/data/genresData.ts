export const genresData = [
  { name: "Fantasy", emoji: "🔮" },
  { name: "Sci-Fi", emoji: "🔬" },
  { name: "Romance", emoji: "💕" },
  { name: "Mystery", emoji: "🕵️‍♂️" },
  { name: "Thriller", emoji: "😱" },
  { name: "Historical Fiction", emoji: "📜" },
  { name: "High Fantasy", emoji: "🧝🏻‍♀️" },
  { name: "Urban Fantasy", emoji: "🏙️" },
  { name: "Steampunk", emoji: "🚂" },
  { name: "Cyberpunk", emoji: "🤖" },
  { name: "Dystopian", emoji: "👁" },
  { name: "Post-apocalyptic", emoji: "☠️" },
];

export const genresMap = genresData.reduce((acc, cur) => {
  acc.set(cur.name, cur.emoji);
  return acc;
}, new Map());
