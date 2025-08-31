/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-undef */

// Import necessary functions from Firebase using CDN URLs.
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

/**
 * Displays a modal with the provided message.
 * This helps reassure the user with clear, user-friendly feedback.
 * @param {string} message - The message to display in the modal.
 */
function showModal(message) {
  // Create overlay element.
  const modalOverlay = document.createElement("div");
  modalOverlay.style.position = "fixed";
  modalOverlay.style.top = "0";
  modalOverlay.style.left = "0";
  modalOverlay.style.width = "100%";
  modalOverlay.style.height = "100%";
  modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modalOverlay.style.display = "flex";
  modalOverlay.style.justifyContent = "center";
  modalOverlay.style.alignItems = "center";
  modalOverlay.style.zIndex = "1000";

  // Create modal container.
  const modalContainer = document.createElement("div");
  modalContainer.style.backgroundColor = "#fff";
  modalContainer.style.padding = "20px";
  modalContainer.style.borderRadius = "8px";
  modalContainer.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  modalContainer.style.maxWidth = "400px";
  modalContainer.style.width = "80%";
  modalContainer.style.textAlign = "center";

  // Create and append the message element.
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  messageElement.style.color = "#333";
  messageElement.style.fontSize = "16px";
  modalContainer.appendChild(messageElement);

  // Create and append the close button.
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.marginTop = "15px";
  closeButton.style.padding = "10px 20px";
  closeButton.style.backgroundColor = "#8806CE";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    if (modalOverlay.parentElement) {
      modalOverlay.parentElement.removeChild(modalOverlay);
    }
  });

  modalContainer.appendChild(closeButton);
  modalOverlay.appendChild(modalContainer);
  document.body.appendChild(modalOverlay);
}

/**
 * Utility: Validate the email format using a regex pattern.
 * @param {string} email - The email string to validate.
 * @return {boolean} - True if the email is valid.
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Registers a new user (for players) with the provided information.
 *
 * @param {string} usernameInput - The username provided by the user.
 * @param {string} emailInput - The email address provided by the user.
 * @param {string} passwordInput - The password provided by the user.
 * @param {string} confirmPasswordInput - The confirm password provided by the user.
 */
export async function registerUser(usernameInput, emailInput, passwordInput, confirmPasswordInput) {
  // Retrieve the auth and firestore instances now, after Firebase is initialized.
  const auth = getAuth();
  const db = getFirestore();

  // Sanitize inputs.
  const username = usernameInput.trim();
  const email = emailInput.trim();
  const password = passwordInput; // Do not trim passwords.
  const confirmPassword = confirmPasswordInput; // Do not trim passwords.

  // Validate that all required fields are provided.
  if (!username || !email || !password || !confirmPassword) {
    showModal("All fields are required.");
    return;
  }

  // Validate that the password and confirmPassword match.
  if (password !== confirmPassword) {
    showModal("Passwords do not match. Please retype your password.");
    // Clear the password fields (if they exist in the DOM)
    const pwdInput = document.getElementById("password");
    const cpwdInput = document.getElementById("confirmPassword");
    if (pwdInput) pwdInput.value = "";
    if (cpwdInput) cpwdInput.value = "";
    return;
  }

  // Validate email format.
  if (!validateEmail(email)) {
    showModal("Invalid email format.");
    return;
  }

  try {
    // Create new user using Firebase Authentication.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created successfully:", userCredential.user);

    // Update the user's profile with the displayName.
    await updateProfile(userCredential.user, { displayName: username });
    console.log("User profile updated with displayName:", username);

    // Trigger email verification.
    console.log("Attempting to send verification email...");
    try {
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent successfully.");
    } catch (verificationError) {
      console.error("Error during email verification:", verificationError);
      throw verificationError;
    }

    // Store additional user information in Firestore.
    await setDoc(doc(db, "users", userCredential.user.uid), {
      username: username,
      email: email,
      user_type: "player", // Set default user type.
      createdAt: new Date(),
    });
    console.log("User information saved in Firestore.");

    // Inform the user of successful registration and prompt email verification.
    showModal("Registration successful! A verification email has been sent to your address. Please verify your email before logging in.");

    // Redirect to login page after a short delay.
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    console.error("Registration error:", error);
    showModal("Registration failed: " + error.message);
  }
}
