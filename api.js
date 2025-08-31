// api.js

// Import the getAuth function from Firebase Authentication (v9 modular).
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Define the base URL for your Railway backend.
const BASE_URL = "https://lab-rat-production-f62a.up.railway.app";

/**
 * Retrieves the current user's ID token using Firebase Authentication.
 * This token is needed to authenticate API calls to the secure backend.
 *
 * @return {Promise<string>} - A promise that resolves with the current user's ID token.
 * @throws Will throw an error if no user is authenticated.
 */
export async function getIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User is not authenticated. Please sign in first.");
  }
  // Optionally, you can pass 'true' to force refresh the token.
  return await user.getIdToken();
}

/**
 * Submits a leaderboard score to the secure '/submitLeaderboardScore' endpoint.
 * @param {string} playerName - The player's name.
 * @param {number} score - The player's score.
 * @param {number} level - The level reached.
 * @return {Promise<Object>} - A promise that resolves with the server response.
 */
export async function submitLeaderboardScore(playerName, score, level) {
  try {
    const token = await getIdToken();
    const payload = { playerName, score, level };

    const response = await fetch(`${BASE_URL}/submitLeaderboardScore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Sends the Firebase ID token in the format "Bearer <ID_TOKEN>"
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error submitting leaderboard score");
    }
    console.log("Leaderboard score submitted:", data);
    return data;
  } catch (error) {
    console.error("Error in submitLeaderboardScore:", error);
    throw error;
  }
}