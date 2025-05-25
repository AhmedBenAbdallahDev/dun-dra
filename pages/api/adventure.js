export default async function (req, res) {
  try {
    const { action, character, userAction, chatHistory, apiKey, model, endpoint } = req.body;
    
    if (!apiKey || !model || !character) {
      return res.status(400).json({ error: 'API key, model, and character are required' });
    }

    const apiEndpoint = endpoint || 'https://openrouter.ai/api/v1/chat/completions';

    if (action === 'start') {
      // Generate initial adventure scenario
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Mythic Maker Adventure'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `You are an expert RPG Game Master creating an immersive fantasy adventure. 

CHARACTER PROFILE:
- Name: ${character.name}
- Appearance: ${character.appearance}
- Personality: ${character.personality}
- Stats: ${character.stats}
- Backstory: ${character.story}

Create an engaging opening scenario that:
1. Sets the scene in a fantasy world
2. Introduces an immediate challenge or mystery
3. Gives the player clear options for what to do next
4. Incorporates the character's backstory and abilities
5. Includes atmospheric details and vivid descriptions

Format your response with rich descriptions and present 2-3 clear action choices at the end. Keep it exciting and immersive!`
            },
            {
              role: 'user',
              content: `Begin an epic adventure for ${character.name}. Set the opening scene and present the first challenge.`
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Adventure API error:', errorData);
        return res.status(response.status).json({ error: `Adventure generation failed: ${response.statusText}` });
      }

      const data = await response.json();
      res.status(200).json({ scenario: data.choices[0].message.content });

    } else if (action === 'continue') {
      // Continue the adventure based on user action
      const conversationHistory = chatHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Mythic Maker Adventure'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `You are an expert RPG Game Master continuing an immersive fantasy adventure.

CHARACTER PROFILE:
- Name: ${character.name}
- Appearance: ${character.appearance}
- Personality: ${character.personality}
- Stats: ${character.stats}
- Backstory: ${character.story}

GAME MASTER RULES:
1. React to the player's action dynamically and realistically
2. Advance the plot based on their choices
3. Introduce new characters, enemies, or challenges as appropriate
4. Use dice rolls and stats for skill checks when relevant
5. Keep the story engaging with twists and surprises
6. Always end with clear options for what the player can do next
7. Include combat, dialogue, exploration, and puzzle-solving elements
8. Remember the character's abilities and personality in your responses

Current player action: "${userAction}"

Respond with what happens as a result of their action. Include vivid descriptions, any consequences, new developments, and present 2-3 options for their next move.`
            },
            ...conversationHistory,
            {
              role: 'user',
              content: userAction
            }
          ],
          temperature: 0.8,
          max_tokens: 400
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Adventure continue API error:', errorData);
        return res.status(response.status).json({ error: `Adventure continuation failed: ${response.statusText}` });
      }

      const data = await response.json();
      res.status(200).json({ response: data.choices[0].message.content });
    }

  } catch (error) {
    console.error('Adventure error:', error);
    res.status(500).json({ error: 'Failed to process adventure request. Please check your API key and try again.' });
  }
}
