require('dotenv').config({ path: '.env' });
const { HfInference } = require('@huggingface/inference');

const token = process.env.HUGGING_FACE_API_KEY;
console.log('Token starts with:', token ? token.substring(0, 5) : 'none');

const hf = new HfInference(token);
const text = "I am so incredibly angry that the new update broke all my projects!";

hf.textClassification({
  model: 'j-hartmann/emotion-english-distilroberta-base',
  inputs: text
}).then(res => {
  console.log('Success:', res);
}).catch(err => {
  console.error('HF Error:', err.message, err.response?.data || err);
});
