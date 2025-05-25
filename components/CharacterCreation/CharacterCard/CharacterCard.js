import styles from "./CharacterCard.module.css";

function CharacterCard({ characterData }) {
  function slicer(string) {
    const slicedString = string.slice(string.indexOf(":") + 2);
    return slicedString;
  }

  function extractStats(string) {
    const statStrings = string.split(", ");
    const stats = {};

    for (const statString of statStrings) {
      let [name, value] = statString.split(" - ");
      if (value === undefined) {
        [name, value] = statString.split(" ");
      }
      stats[name] = parseInt(value);
    }
    return stats;
  }

  return (
    <div className={styles.main}>
      {characterData && (
        <>
          <h2>{slicer(characterData.name)}</h2>
          <p>
            <strong>Appearance: </strong>
            {slicer(characterData.appearance)}
          </p>
          <p>
            <strong>Personality: </strong>
            {slicer(characterData.personality)}
          </p>
          <p>
            <strong>Story: </strong>
            {slicer(characterData.story)}
          </p>
        </>
      )}
    </div>
  );
}

export default CharacterCard;
