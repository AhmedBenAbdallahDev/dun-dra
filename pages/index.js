import Head from "next/head";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar/Navbar";
import CharacterCreation from "../components/CharacterCreation/CharacterCreation";
import Adventure from "../components/Adventure/Adventure";
import Settings from "../components/Settings/Settings";
import { useRef, useState, useEffect } from "react";
import Footer from "../components/Footer/Footer";

export default function Home() {
  const ref = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMode, setCurrentMode] = useState('home'); // 'home', 'creation', 'adventure'
  const [currentCharacter, setCurrentCharacter] = useState(null);  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    textModel: 'deepseek/deepseek-chat',
    imageModel: 'black-forest-labs/flux-1.1-pro',
    textEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    imageEndpoint: 'https://openrouter.ai/api/v1/images/generations'
  });
  const [isConfigured, setIsConfigured] = useState(false);
  // Check for existing configuration on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    const savedTextModel = localStorage.getItem('text_model');
    const savedCustomTextModel = localStorage.getItem('custom_text_model');
    const savedUseCustomTextModel = localStorage.getItem('use_custom_text_model') === 'true';
    const savedImageModel = localStorage.getItem('image_model');
    const savedCustomImageModel = localStorage.getItem('custom_image_model');
    const savedUseCustomImageModel = localStorage.getItem('use_custom_image_model') === 'true';
    const savedTextEndpoint = localStorage.getItem('text_endpoint');
    const savedImageEndpoint = localStorage.getItem('image_endpoint');
    
    if (savedApiKey) {
      const finalTextModel = savedUseCustomTextModel ? savedCustomTextModel : savedTextModel;
      const finalImageModel = savedUseCustomImageModel ? savedCustomImageModel : savedImageModel;
      
      setApiSettings({
        apiKey: savedApiKey,
        textModel: finalTextModel || 'deepseek/deepseek-chat',
        imageModel: finalImageModel || 'black-forest-labs/flux-1.1-pro',
        textEndpoint: savedTextEndpoint || 'https://openrouter.ai/api/v1/chat/completions',
        imageEndpoint: savedImageEndpoint || 'https://openrouter.ai/api/v1/images/generations'
      });
      setIsConfigured(true);
    }
  }, []);
  const handleScroll = () => {
    if (!isConfigured) {
      setShowSettings(true);
      return;
    }
    setCurrentMode('creation');
    ref.current?.scrollIntoView({behavior: "smooth"});
  };

  const handleSettingsSave = (settings) => {
    setApiSettings(settings);
    setIsConfigured(true);
  };

  const handleSettingsOpen = () => {
    setShowSettings(true);
  };

  const handleStartAdventure = (character) => {
    setCurrentCharacter(character);
    setCurrentMode('adventure');
  };

  const handleBackToCreation = () => {
    setCurrentMode('creation');
    setCurrentCharacter(null);
  };

  const handleBackToHome = () => {
    setCurrentMode('home');
    setCurrentCharacter(null);
  };

  return (
    <>
      <Head>
        <title>Mythic Maker | Create your rpg character with AI</title>
        <meta
          name="description"
          content="Mythic maker is a rpg character generating app"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>      <main className={styles.main}>
        <Navbar onSettingsClick={handleSettingsOpen} />
        {currentMode === 'home' && (
          <div className={styles.mainInner}>
            <h2 className={styles.mainSubtitle}>With AI</h2>
            <h1 className={styles.mainTitle}>Generate Your Character</h1>
            <p className={styles.mainDescription}>
              Introducing the Mythic Maker! With just a few taps, this app will
              generate fully-fledged, unique characters for your next role-playing
              adventure using OpenRouter AI models!
            </p>
            {!isConfigured && (
              <div className={styles.configWarning}>
                ⚠️ Please configure your API settings first
              </div>
            )}
            <button onClick={handleScroll} className={styles.mainButton}>
              {isConfigured ? 'Create Character' : 'Setup API'}
            </button>
          </div>
        )}
        {currentMode === 'creation' && (
          <div style={{ padding: '20px 0' }}>
            <button onClick={handleBackToHome} className={styles.backToHomeButton}>
              ← Back to Home
            </button>
          </div>
        )}
      </main>      <div className={styles.seperator}></div>      {currentMode === 'creation' && (
        <section ref={ref} className={styles.creationSection}>
          <CharacterCreation 
            apiSettings={apiSettings} 
            onStartAdventure={handleStartAdventure}
          />
        </section>
      )}

      {currentMode === 'adventure' && currentCharacter && (
        <Adventure 
          character={currentCharacter} 
          apiSettings={apiSettings}
          onBackToCreation={handleBackToCreation}
        />
      )}

      {currentMode !== 'adventure' && <Footer />}
      
      <Settings 
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsSave={handleSettingsSave}
      />
    </>
  );
}
