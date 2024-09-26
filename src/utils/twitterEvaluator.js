import axios from 'axios';

async function evaluateTwitterProfile(twitterHandle) {
  console.log('Evaluating Twitter profile for handle:', twitterHandle);
  try {
    const response = await axios.get(`/api/twitter-evaluation/${twitterHandle}`);
    console.log('Twitter evaluation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error evaluating Twitter profile:', error);
    throw new Error('Failed to evaluate Twitter profile');
  }
}

export default evaluateTwitterProfile;
