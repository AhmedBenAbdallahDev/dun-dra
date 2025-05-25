import styles from "./CharacterCreation.module.css";
import Image from "next/image";
import { useState } from "react";
import CharacterCard from "./CharacterCard/CharacterCard";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

function CharacterCreation({ apiSettings, onStartAdventure }) {
  const [nameInput, setNameInput] = useState("");
  const [result, setResult] = useState();
  const [gender, setGender] = useState("");

  const [pictureResult, setPictureResult] = useState();
  const [nameInputPicture, setNameInputPicture] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryAction, setRetryAction] = useState(null);

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
  
  function formatStats(statsString) {
    if (!statsString) return [];
    
    // Handle different stat formats
    const cleanStats = statsString.replace(/Stats:\s*/i, '').trim();
    const statPairs = cleanStats.split(/,\s*/);
    
    return statPairs.map(pair => {
      const [name, value] = pair.split(/:\s*|\s+/);
      return {
        name: name ? name.trim() : 'Unknown',
        value: value ? parseInt(value) || 0 : 0
      };
    }).filter(stat => stat.name && stat.name !== 'Unknown');
  }

  async function onSubmit(event) {
    event.preventDefault();
    
    if (!apiSettings.apiKey) {
      setError('Please configure your API settings first');
      return;
    }
    
    if (!gender) {
      setError('Please select a character gender');
      return;
    }
    
    if (!nameInput.trim()) {
      setError('Please enter a character class');
      return;
    }
    
    setIsLoading(true);
    setResult("");
    setPictureResult("");
    setError(null);
    
    try {      const nameResponse = await fetch("/api/name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          character: `${gender} ${nameInput}`,
          apiKey: apiSettings.apiKey,
          model: apiSettings.textModel,
          endpoint: apiSettings.textEndpoint
        }),
      });
      
      if (!nameResponse.ok) {
        const errorData = await nameResponse.json();
        throw new Error(errorData.error || 'Failed to generate character');
      }
      
      const nameData = await nameResponse.json();
      setResult(nameData);
      setNameInput("");
    } catch (error) {
      console.error('Character generation error:', error);
      setError(`Error generating character: ${error.message}`);
      setRetryAction(() => () => onSubmit(event));
    } finally {
      setIsLoading(false);
    }  }
  
  function useDefaultImage() {
    const defaultImageSrc = gender === 'female' ? '/character-female.png' : '/character-male.png';
    setPictureResult([
      <img
        key="default-character"
        src={defaultImageSrc}
        alt="default character"
        className={styles.imagesSingle}
      />
    ]);
  }  
    async function onPictureGenerate() {
    if (!apiSettings.apiKey) {
      setError('Please configure your API settings first to generate AI images, or use the default image option');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          character: `${result.appearance} ${nameInputPicture}`,
          apiKey: apiSettings.apiKey,
          model: apiSettings.imageModel,
          endpoint: apiSettings.imageEndpoint
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate images');
      }
      
      const data = await response.json();
      setPictureResult(
        data.result.map((picture, index) => {
          return (
            <img
              key={picture.url || index}
              src={picture.url}
              alt="character picture"
              className={styles.imagesSingle}
            />
          );
        })
      );
    } catch (error) {
      console.error('Image generation error:', error);
      setError(`Error generating images: ${error.message}`);
      setRetryAction(() => () => onPictureGenerate());
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Create Your Character</h1>
      <Image
        className={styles.iconSeperator}
        src="/icon-seperator.png"
        alt="Next.js Logo"
        width={100}
        height={40}
        priority
      />

      <form onSubmit={onSubmit}>
        <div className={styles.genderContainer}>
          <h3 className={styles.chooseGenderText}>Choose a gender</h3>
          <div className={styles.genderImagesContainer}>
            <div>
              <Image
                src="/character-male.png"
                alt="Next.js Logo"
                width={180}
                height={300}
                priority
                style={{ display: "block" }}
              />
              <input
                onChange={(e) => setGender(e.target.value)}
                id="male"
                type="radio"
                name="gender"
                value="male"
              />
              <label htmlFor="male">Male</label>
            </div>
            <div>
              <Image
                src="/character-female.png"
                alt="Next.js Logo"
                width={220}
                height={300}
                priority
                style={{ display: "block" }}
              />
              <input
                onChange={(e) => setGender(e.target.value)}
                id="female"
                type="radio"
                name="gender"
                value="female"
              />
              <label htmlFor="female">Female</label>
            </div>
          </div>
        </div>
        <div className={styles.nameInputContainer}>
          <h3 className={styles.chooseClassText}>Choose a class</h3>
          <input
            type="text"
            name="character"
            required
            placeholder="Enter a class e.g., wizard, ninja"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setNameInputPicture(e.target.value);
            }}
            className={styles.nameInput}
          />
          <input
            disabled={isLoading ? true : false}
            type="submit"
            value="Generate character"
            className={styles.submitButton}
          />
        </div>
      </form>      {result && (
        <div className={styles.characterFullContainer}>
          <h1 className={styles.characterFullTitle}>{result.name}</h1>
          
          <div className={styles.characterSection}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            <p className={styles.characterFeature}>{result.appearance}</p>
          </div>
          
          <div className={styles.characterSection}>
            <h3 className={styles.sectionTitle}>Personality</h3>
            <p className={styles.characterFeature}>{result.personality}</p>
          </div>
          
          <div className={styles.characterSection}>
            <h3 className={styles.sectionTitle}>Backstory</h3>
            <p className={styles.characterFeature}>{result.story}</p>
          </div>
            <div className={styles.characterSection}>
            <h3 className={styles.sectionTitle}>Stats</h3>
            <div className={styles.statsContainer}>
              {formatStats(result.stats).map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <span className={styles.statName}>{stat.name}:</span>
                  <span className={styles.statValue}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Adventure Start Button */}
          <div className={styles.adventureSection}>
            <button
              onClick={() => onStartAdventure(result)}
              className={styles.startAdventureButton}
            >
              ⚔️ Begin Epic Adventure!
            </button>
            <p className={styles.adventureDescription}>
              Ready to embark on a legendary journey? Click above to start your personalized RPG adventure!
            </p>
          </div>
        </div>
      )}{result && (
        <div className={styles.ImagesContainer}>
          <div className={styles.imageButtonsContainer}>
            <button
              disabled={isLoading ? true : false}
              onClick={onPictureGenerate}
              className={styles.pictureGenerateButton}
            >
              Generate AI Images
            </button>
            <button
              onClick={useDefaultImage}
              className={styles.defaultImageButton}
            >
              Use Default Image
            </button>
          </div>
          {pictureResult && (
            <div className={styles.imagesMultiple}>{pictureResult}</div>
          )}
        </div>
      )}{isLoading && <LoadingScreen />}
      
      {error && (
        <ErrorMessage 
          message={error}
          onRetry={retryAction}
          onClose={() => {
            setError(null);
            setRetryAction(null);
          }}
        />
      )}
    </div>
  );
}

export default CharacterCreation;

{
  /* <Image
        className={styles.logo}
        src="/character.png"
        alt="Next.js Logo"
        width={180}
        height={300}
        priority
     /> */
}
