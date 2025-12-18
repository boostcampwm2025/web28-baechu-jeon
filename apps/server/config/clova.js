require('dotenv').config();

module.exports = {
  apiUrl: 'https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-007',
  apiKey: process.env.CLOVA_API_KEY,
  defaultParams: {
    topP: 0.8,
    topK: 0,
    maxTokens: 2000,
    temperature: 0.5,
    repeatPenalty: 5.0,
    stopBefore: [],
    includeAiFilters: true
  }
};
