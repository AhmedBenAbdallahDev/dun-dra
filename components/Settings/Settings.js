import { useState, useEffect } from 'react';
import styles from './Settings.module.css';

function Settings({ onSettingsSave, isVisible, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [textModel, setTextModel] = useState('deepseek/deepseek-chat');
  const [customTextModel, setCustomTextModel] = useState('');
  const [useCustomTextModel, setUseCustomTextModel] = useState(false);
  const [imageModel, setImageModel] = useState('black-forest-labs/flux-1.1-pro');
  const [customImageModel, setCustomImageModel] = useState('');
  const [useCustomImageModel, setUseCustomImageModel] = useState(false);
  const [textEndpoint, setTextEndpoint] = useState('https://openrouter.ai/api/v1/chat/completions');
  const [imageEndpoint, setImageEndpoint] = useState('https://openrouter.ai/api/v1/images/generations');
  const [useCustomEndpoints, setUseCustomEndpoints] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  // Load settings from localStorage on component mount
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
    const savedUseCustomEndpoints = localStorage.getItem('use_custom_endpoints') === 'true';
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsConfigured(true);
    }
    if (savedTextModel) setTextModel(savedTextModel);
    if (savedCustomTextModel) setCustomTextModel(savedCustomTextModel);
    setUseCustomTextModel(savedUseCustomTextModel);
    if (savedImageModel) setImageModel(savedImageModel);
    if (savedCustomImageModel) setCustomImageModel(savedCustomImageModel);
    setUseCustomImageModel(savedUseCustomImageModel);
    if (savedTextEndpoint) setTextEndpoint(savedTextEndpoint);
    if (savedImageEndpoint) setImageEndpoint(savedImageEndpoint);
    setUseCustomEndpoints(savedUseCustomEndpoints);
  }, []);
  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter your OpenRouter API key');
      return;
    }

    const finalTextModel = useCustomTextModel ? customTextModel : textModel;
    const finalImageModel = useCustomImageModel ? customImageModel : imageModel;

    if (useCustomTextModel && !customTextModel.trim()) {
      alert('Please enter a custom text model or disable custom text model');
      return;
    }

    if (useCustomImageModel && !customImageModel.trim()) {
      alert('Please enter a custom image model or disable custom image model');
      return;
    }

    // Save to localStorage
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('text_model', textModel);
    localStorage.setItem('custom_text_model', customTextModel);
    localStorage.setItem('use_custom_text_model', useCustomTextModel.toString());
    localStorage.setItem('image_model', imageModel);
    localStorage.setItem('custom_image_model', customImageModel);
    localStorage.setItem('use_custom_image_model', useCustomImageModel.toString());
    localStorage.setItem('text_endpoint', textEndpoint);
    localStorage.setItem('image_endpoint', imageEndpoint);
    localStorage.setItem('use_custom_endpoints', useCustomEndpoints.toString());
    
    setIsConfigured(true);
    
    // Pass settings to parent component
    onSettingsSave({
      apiKey,
      textModel: finalTextModel,
      imageModel: finalImageModel,
      textEndpoint,
      imageEndpoint
    });
    
    onClose();
  };
  const handleClear = () => {
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('text_model');
    localStorage.removeItem('custom_text_model');
    localStorage.removeItem('use_custom_text_model');
    localStorage.removeItem('image_model');
    localStorage.removeItem('custom_image_model');
    localStorage.removeItem('use_custom_image_model');
    localStorage.removeItem('text_endpoint');
    localStorage.removeItem('image_endpoint');
    localStorage.removeItem('use_custom_endpoints');
    setApiKey('');
    setTextModel('deepseek/deepseek-chat');
    setCustomTextModel('');
    setUseCustomTextModel(false);
    setImageModel('black-forest-labs/flux-1.1-pro');
    setCustomImageModel('');
    setUseCustomImageModel(false);
    setTextEndpoint('https://openrouter.ai/api/v1/chat/completions');
    setImageEndpoint('https://openrouter.ai/api/v1/images/generations');
    setUseCustomEndpoints(false);
    setIsConfigured(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>API Settings</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <label className={styles.label}>OpenRouter API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className={styles.input}
            />
            <p className={styles.helper}>
              Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className={styles.link}>OpenRouter</a>
            </p>
          </div>          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <label className={styles.label}>Text Generation Model:</label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={useCustomTextModel}
                  onChange={(e) => setUseCustomTextModel(e.target.checked)}
                  className={styles.checkbox}
                />
                Use Custom Model
              </label>
            </div>
            
            {!useCustomTextModel ? (
              <select
                value={textModel}
                onChange={(e) => setTextModel(e.target.value)}
                className={styles.select}              >
                <option value="deepseek/deepseek-chat">DeepSeek V3 Chat</option>
                <option value="deepseek/deepseek-v3-03-05">DeepSeek V3 03-05</option>
                <option value="deepseek/deepseek-coder">DeepSeek V3 Coder</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
                <option value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B</option>
              </select>
            ) : (              <input
                type="text"
                value={customTextModel}
                onChange={(e) => setCustomTextModel(e.target.value)}
                placeholder="e.g., deepseek/deepseek-v3-03-05"
                className={styles.input}
              />
            )}
            <p className={styles.helper}>
              {useCustomTextModel 
                ? "Enter the exact model string (e.g., deepseek/deepseek-v3-03-05)" 
                : "Select from available models"
              }
            </p>
          </div>          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <label className={styles.label}>Image Generation Model:</label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={useCustomImageModel}
                  onChange={(e) => setUseCustomImageModel(e.target.checked)}
                  className={styles.checkbox}
                />
                Use Custom Model
              </label>
            </div>
            
            {!useCustomImageModel ? (
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className={styles.select}
              >
                <option value="black-forest-labs/flux-1.1-pro">FLUX 1.1 Pro</option>
                <option value="black-forest-labs/flux-pro">FLUX Pro</option>
                <option value="stability-ai/stable-diffusion-3.5-large">Stable Diffusion 3.5 Large</option>
                <option value="openai/dall-e-3">DALL-E 3</option>
                <option value="midjourney/midjourney">Midjourney</option>
              </select>
            ) : (
              <input
                type="text"
                value={customImageModel}
                onChange={(e) => setCustomImageModel(e.target.value)}
                placeholder="e.g., custom/model-name"
                className={styles.input}
              />
            )}
            <p className={styles.helper}>
              {useCustomImageModel 
                ? "Enter the exact image model string" 
                : "Select from available image models"
              }
            </p>          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <label className={styles.label}>API Endpoints:</label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={useCustomEndpoints}
                  onChange={(e) => setUseCustomEndpoints(e.target.checked)}
                  className={styles.checkbox}
                />
                Use Custom Endpoints
              </label>
            </div>
            
            {useCustomEndpoints && (
              <>
                <div className={styles.endpointGroup}>
                  <label className={styles.subLabel}>Text Generation Endpoint:</label>
                  <input
                    type="url"
                    value={textEndpoint}
                    onChange={(e) => setTextEndpoint(e.target.value)}
                    placeholder="https://api.example.com/v1/chat/completions"
                    className={styles.input}
                  />
                </div>
                <div className={styles.endpointGroup}>
                  <label className={styles.subLabel}>Image Generation Endpoint:</label>
                  <input
                    type="url"
                    value={imageEndpoint}
                    onChange={(e) => setImageEndpoint(e.target.value)}
                    placeholder="https://api.example.com/v1/images/generations"
                    className={styles.input}
                  />
                </div>
              </>
            )}
            <p className={styles.helper}>
              {useCustomEndpoints 
                ? "Configure custom API endpoints for text and image generation" 
                : "Using default OpenRouter endpoints"
              }
            </p>
          </div>

          <div className={styles.actions}>
            <button onClick={handleSave} className={styles.saveButton}>
              Save Settings
            </button>
            <button onClick={handleClear} className={styles.clearButton}>
              Clear Settings
            </button>
          </div>

          {isConfigured && (
            <div className={styles.status}>
              ✅ API configured successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
