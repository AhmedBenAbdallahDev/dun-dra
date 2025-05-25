import { useState, useEffect, useRef } from 'react';
import styles from './Adventure.module.css';

function Adventure({ character, apiSettings, onBackToCreation }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startAdventure = async () => {
    setIsLoading(true);
    setGameStarted(true);

    try {
      const response = await fetch("/api/adventure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: 'start',
          character: character,
          apiKey: apiSettings.apiKey,
          model: apiSettings.textModel,
          endpoint: apiSettings.textEndpoint
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start adventure');
      }

      const data = await response.json();
      setMessages([
        {
          type: 'system',
          content: `🎭 **Adventure Begins!**\n\n${data.scenario}`,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Adventure start error:', error);
      setMessages([
        {
          type: 'error',
          content: `❌ Error starting adventure: ${error.message}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch("/api/adventure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: 'continue',
          userAction: userInput,
          character: character,
          chatHistory: messages,
          apiKey: apiSettings.apiKey,
          model: apiSettings.textModel,
          endpoint: apiSettings.textEndpoint
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to continue adventure');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'system',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Adventure continue error:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adventureContainer}>
      {/* Character Stats Sidebar */}
      <div className={styles.statsSidebar}>
        <h3 className={styles.statsTitle}>📊 Character Stats</h3>
        <div className={styles.characterInfo}>
          <h4 className={styles.characterName}>{character.name}</h4>
          <p className={styles.characterDetail}><strong>Appearance:</strong> {character.appearance}</p>
          <p className={styles.characterDetail}><strong>Personality:</strong> {character.personality}</p>
          
          <div className={styles.statsGrid}>
            {character.stats.split(',').map((stat, index) => {
              const [name, value] = stat.split(':').map(s => s.trim());
              return (
                <div key={index} className={styles.statItem}>
                  <span className={styles.statName}>{name}:</span>
                  <span className={styles.statValue}>{value}</span>
                </div>
              );
            })}
          </div>
          
          <p className={styles.characterStory}><strong>Backstory:</strong> {character.story}</p>
        </div>
        
        <button onClick={onBackToCreation} className={styles.backButton}>
          ← Back to Character Creation
        </button>
      </div>

      {/* Chat Window */}
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h2 className={styles.chatTitle}>🏰 Adventure Chronicle</h2>
        </div>

        {!gameStarted ? (
          <div className={styles.startScreen}>
            <h3 className={styles.startTitle}>Ready to Begin Your Adventure?</h3>
            <p className={styles.startDescription}>
              Your character <strong>{character.name}</strong> stands at the threshold of an epic journey. 
              Click below to generate your unique adventure scenario!
            </p>
            <button 
              onClick={startAdventure} 
              disabled={isLoading}
              className={styles.startAdventureButton}
            >
              {isLoading ? '🎲 Generating Adventure...' : '⚔️ Start Adventure!'}
            </button>
          </div>
        ) : (
          <>
            <div className={styles.messagesContainer}>
              {messages.map((message, index) => (
                <div key={index} className={`${styles.message} ${styles[message.type]}`}>
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                  <div className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={styles.loadingMessage}>
                  <div className={styles.messageContent}>
                    🎭 The Game Master is weaving your fate...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className={styles.inputForm}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="What do you do? (e.g., 'I look around', 'I attack', 'I cast a spell')"
                className={styles.messageInput}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !userInput.trim()}
                className={styles.sendButton}
              >
                ⚡ Act
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Adventure;
