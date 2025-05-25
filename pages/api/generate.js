export default async function (req, res) {
  try {
    const { character, apiKey, model, endpoint } = req.body;
    
    if (!apiKey || !model) {
      return res.status(400).json({ error: 'API key and model are required' });
    }

    const apiEndpoint = endpoint || 'https://openrouter.ai/api/v1/images/generations';

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
        prompt: generatePrompt(character),
        n: 4,
        size: "1024x1024",
        quality: "standard"
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter Image API error:', errorData);
      return res.status(response.status).json({ error: `Image generation failed: ${response.statusText}` });
    }

    const data = await response.json();
    res.status(200).json({ result: data.data });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate images. Please check your API key and try again.' });
  }
}

function generatePrompt(character) {
  const capitalizedCharacter = character[0].toUpperCase() + character.slice(1).toLowerCase();
  return `${capitalizedCharacter} RPG fantasy character, highly detailed digital art, photorealistic style, fantasy setting, medieval armor and clothing, dynamic pose, professional character portrait, cinematic lighting, epic fantasy art style`;
}
