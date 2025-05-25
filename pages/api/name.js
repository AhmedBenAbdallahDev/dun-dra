export default async function (req, res) {
  try {
    const { character, apiKey, model, endpoint } = req.body;
    
    if (!apiKey || !model) {
      return res.status(400).json({ error: 'API key and model are required' });
    }

    const apiEndpoint = endpoint || 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Mythic Maker'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a fantasy RPG character generator. Create detailed character profiles with exactly 5 lines: name, stats, appearance, personality, and backstory. Format each as a complete sentence or phrase.'
          },
          {
            role: 'user',
            content: generatePrompt(character)
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API error:', errorData);
      return res.status(response.status).json({ error: `API request failed: ${response.statusText}` });
    }

    const data = await response.json();
    const result = data.choices[0].message.content.split('\n').filter(item => item.trim() !== '');
    
    console.log('Generated result:', result);
    
    // Ensure we have at least 5 parts, pad with defaults if necessary
    const paddedResult = [
      result[0] || 'Unknown Adventurer',
      result[1] || 'Strength: 12, Dexterity: 14, Intelligence: 13, Wisdom: 11, Constitution: 15, Charisma: 10',
      result[2] || 'A mysterious figure with an air of adventure.',
      result[3] || 'Brave and curious, always ready for the next quest.',
      result[4] || 'Their past is shrouded in mystery, but their future is full of possibilities.'
    ];

    res.status(200).json({ 
      name: paddedResult[0], 
      stats: paddedResult[1], 
      appearance: paddedResult[2], 
      personality: paddedResult[3], 
      story: paddedResult[4] 
    });
  } catch (error) {
    console.error('Character generation error:', error);
    res.status(500).json({ error: 'Failed to generate character. Please check your API key and try again.' });
  }
}

function generatePrompt(character) {
  const capitalizedCharacter = character[0].toUpperCase() + character.slice(1).toLowerCase();
  return `Generate a ${capitalizedCharacter} class RPG character with the following format:
Name: [Character Name]
Stats: Strength: X, Dexterity: X, Intelligence: X, Wisdom: X, Constitution: X, Charisma: X (use numbers 8-18)
Appearance: [Physical description in 1-2 sentences]
Personality: [Character traits and demeanor in 1-2 sentences]
Backstory: [Brief background story in 2-3 sentences]

Make it creative and fitting for a fantasy RPG setting.`;
}