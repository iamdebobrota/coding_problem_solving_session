
const usernameInput = document.querySelector("#usernameInput");
const searchBtn = document.querySelector("#searchBtn");
const message = document.querySelector("#message");
const repoContainer = document.querySelector("#repoContainer");
const showMoreBtn = document.querySelector("#showMoreBtn");

// Store repositories for the Show More feature
let repositories = [];
let visibleCount = 5;

// Search button event
searchBtn.addEventListener("click", handleSearch);

// Also allow pressing Enter in the input
usernameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

function handleSearch() {
  const username = usernameInput.value.trim();

  // Requirement 1: Empty input
  if (username === "") {
    message.textContent = "Please enter a GitHub username.";
    repoContainer.replaceChildren();
    showMoreBtn.classList.add("hidden");
    return;
  }

  // Reset previous results
  repositories = [];
  visibleCount = 5;

  repoContainer.replaceChildren();
  showMoreBtn.classList.add("hidden");

  // Show loading message
  message.textContent = "Loading...";

  // Requirement 2: Fetch API
  fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos`)
    .then((response) => {
      // Important: fetch does not reject automatically for 404
      if (!response.ok) {
        throw new Error(
          `GitHub request failed with status ${response.status}`
        );
      }

      // Convert response into JSON
      return response.json();
    })
    .then((data) => {
      repositories = data;

      // Handle empty results
      if (repositories.length === 0) {
        message.textContent = "No repositories found.";
        return;
      }

      message.textContent = `Found ${repositories.length} repositories.`;

      // Display first 5 repositories
      renderRepositories();

      // Bonus: Show More button
      if (repositories.length > visibleCount) {
        showMoreBtn.classList.remove("hidden");
      }
    })
    .catch((error) => {
      console.error(error);

      // Handle errors
      message.textContent =
        "Unable to fetch repositories. Please check the username and try again.";

      repoContainer.replaceChildren();
      showMoreBtn.classList.add("hidden");
    });
}

// Render repositories dynamically
function renderRepositories() {
  repoContainer.replaceChildren();

  const visibleRepositories = repositories.slice(0, visibleCount);

  visibleRepositories.forEach((repo) => {
    const card = createRepositoryCard(repo);
    repoContainer.append(card);
  });

  // Hide Show More when all repos are visible
  if (visibleCount >= repositories.length) {
    showMoreBtn.classList.add("hidden");
  }
}

// Create a single repository card
function createRepositoryCard(repo) {
  const card = document.createElement("div");
  card.classList.add("repo-card");

  // Repository name
  const title = document.createElement("h3");
  title.textContent = repo.name;

  // Description
  const description = document.createElement("p");
  description.textContent =
    repo.description || "No description available.";

  // Language
  const language = document.createElement("p");
  language.classList.add("repo-language");
  language.textContent =
    `Language: ${repo.language || "Not specified"}`;

  // Stars
  const stars = document.createElement("p");
  stars.classList.add("repo-stars");
  stars.textContent = `⭐ Stars: ${repo.stargazers_count}`;

  // Hide button
  const hideBtn = document.createElement("button");
  hideBtn.textContent = "Hide";
  hideBtn.classList.add("hide-btn");

  // Remove only this card
  hideBtn.addEventListener("click", () => {
    card.remove();
  });

  // Add elements to card
  card.append(title, description, language, stars, hideBtn);

  return card;
}

// Bonus: Show More button
showMoreBtn.addEventListener("click", () => {
  visibleCount = repositories.length;
  renderRepositories();
});