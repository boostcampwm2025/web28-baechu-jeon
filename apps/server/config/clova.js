require('dotenv').config();

module.exports = {
  apiUrl: 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007',
  apiKey: process.env.CLOVA_API_KEY,
  defaultParams: {
    maxCompletionTokens: 2000,
    temperature: 0,
    topP: 0.1,
    topK: 1,
    repetitionPenalty: 1,
    stop: [],
    thinking: { effort: 'medium' },
  },
};
