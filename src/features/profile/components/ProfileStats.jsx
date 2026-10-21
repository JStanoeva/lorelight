// The four figures under the bio, each with its label in the singular or plural. A description
// list, so a screen reader hears "Projects, 5"; the CSS shows the number above its label.
const STATS = [
  { key: "projects", one: "Project", other: "Projects" },
  { key: "lore", one: "Lore entry", other: "Lore entries" },
  { key: "appreciationsReceived", one: "Appreciation received", other: "Appreciations received" },
  { key: "saves", one: "Save", other: "Saves" },
];

// `stats` comes from getProfileStats (utils/profileStats.js)
export default function ProfileStats({ stats }) {
  return (
    <dl className="profile-stats">
      {STATS.map((stat) => {
        const value = stats[stat.key];

        return (
          <div key={stat.key} className="profile-stat">
            <dt>{value === 1 ? stat.one : stat.other}</dt>
            <dd>{value.toLocaleString("en-US")}</dd>
          </div>
        );
      })}
    </dl>
  );
}
