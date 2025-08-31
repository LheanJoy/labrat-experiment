/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-undef */

// Import necessary Firebase Auth functions from the Firebase Client SDK using CDN URLs.
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

/**
 * Displays a modal with the provided message.
 * @param {string} message - The message to display in the modal.
 */
function showModal(message) {
  // Create the modal overlay element.
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

  // Create the modal container.
  const modalContainer = document.createElement("div");
  modalContainer.style.backgroundColor = "#fff";
  modalContainer.style.padding = "20px";
  modalContainer.style.borderRadius = "8px";
  modalContainer.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  modalContainer.style.maxWidth = "400px";
  modalContainer.style.width = "80%";
  modalContainer.style.textAlign = "center";

  // Create and append the message element.
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  modalContainer.appendChild(messageElement);

  // Create and append the close button.
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.marginTop = "15px";
  closeButton.style.padding = "10px 20px";
  closeButton.style.backgroundColor = "#007BFF";
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
 * Trims whitespace from both ends of the provided input.
 * @param {string} input - The string to sanitize.
 * @return {string} - The sanitized string.
 */
function sanitize(input) {
  return input.trim();
}

/**
 * Validates that the provided email matches a standard email format.
 * @param {string} email - The email address to validate.
 * @return {boolean} - True if the email is valid.
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validates password strength.
 * Ensures the password is at least 8 characters long and includes at least one uppercase letter, one lowercase letter, and one digit.
 * @param {string} password - The password to validate.
 * @return {boolean} - True if the password meets the conditions.
 */
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasDigit;
}

/**
 * Handles authentication errors.
 * Logs detailed error information and returns a user-friendly error message.
 * @param {Error} error - The error object.
 * @return {string} - A user-friendly error message.
 */
function handleAuthError(error) {
  console.error("Authentication error details:", error);
  if (error.code === "auth/user-not-found") {
    return "The email address does not match any account.";
  } else if (error.code === "auth/wrong-password") {
    return "The password entered is incorrect.";
  }
  return "An error occurred during login. Please try again.";
}

/**
 * Logs in a user using their email and password.
 *
 * @param {string} emailInput - The user's email address.
 * @param {string} passwordInput - The user's password.
 * @param {boolean} [remember=false] - Whether to remember the user's email for future logins.
 * @return {Promise<void>} - A promise that resolves when the login process is complete.
 */
export async function loginUser(emailInput, passwordInput, remember = false) {
  const email = sanitize(emailInput);
  const password = passwordInput;
  
  // Retrieve the current Firebase Auth instance.
  const auth = getAuth();

  // Validate the email format.
  if (!validateEmail(email)) {
    showModal("The email address is invalid. Please check your email and try again.");
    return;
  }

  // Validate the password strength.
  if (!validatePassword(password)) {
    showModal("Password must be at least 8 characters long and include uppercase, lowercase letters, and a digit.");
    return;
  }

  try {
    // Sign in using Firebase Authentication.
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    
    // Optionally remember the user's email.
    if (remember) {
      localStorage.setItem("remember_email", email);
    } else {
      localStorage.removeItem("remember_email");
    }

    // Display a success modal.
    showModal("Login successful!");
    
    // Redirect the user to the homepage after a short delay.
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (error) {
    const userMessage = handleAuthError(error);
    showModal(userMessage);
  }
}

/**
 * Sends a password reset email to the provided email address using Firebase's client SDK.
 *
 * @param {string} emailInput - The user's email address.
 * @return {Promise<void>} - A promise that resolves when the password reset email has been sent.
 */
export async function forgotPassword(emailInput) {
  const email = sanitize(emailInput);

  // Retrieve the current Firebase Auth instance.
  const auth = getAuth();

  // Validate the email format.
  if (!validateEmail(email)) {
    showModal("Please enter a valid email address to reset your password.");
    return;
  }

  try {
    // Trigger Firebase to send the password reset email.
    await sendPasswordResetEmail(auth, email);
    showModal("Password reset email sent! Please check your inbox for further instructions.");
  } catch (error) {
    console.error("Password reset error:", error);
    showModal("Error sending password reset email. Please try again later.");
  }
}
