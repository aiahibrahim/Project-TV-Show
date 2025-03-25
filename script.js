let allEpisodes = [];
let filteredEpisodes = [];

async function setup() {
  const rootElem = document.getElementById("episode-container");
  rootElem.innerHTML = "<p>Loading episodes...</p>"; // Show loading message
  
  try {
    await fetchEpisodes();
    filteredEpisodes = [...allEpisodes]; 
    makePageForEpisodes(filteredEpisodes);
    setupSearchFeature();
    setupEpisodeSelector();
  } catch (error) {
    rootElem.innerHTML = "<p>Failed to load episodes. Please try again later.</p>";
    console.error(error);
  }
}
// Fetch episodes from the API
async function fetchEpisodes() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    allEpisodes = await response.json();
  } catch (error) {
    throw new Error("Failed to fetch episodes. Please check your connection.");
  }
}


// SEARCH FUNCTION
function setupSearchFeature() {
  const searchInput = document.getElementById("search-input");
  const resultCount = document.getElementById("search-result-count");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    filteredEpisodes = allEpisodes.filter(episode => 
      episode.name.toLowerCase().includes(searchTerm) || 
      episode.summary.toLowerCase().includes(searchTerm)
    );

    makePageForEpisodes(filteredEpisodes, searchTerm);
  });
}

// EPISODE SELECTOR FUNCTION
function setupEpisodeSelector() {
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML = ''; // Clear previous options

  // Add "All Episodes" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Episodes";
  episodeSelector.appendChild(allOption);

  // Populate dropdown with episodes
  allEpisodes.forEach(episode => {
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episodeNumber} - ${episode.name}`;
    episodeSelector.appendChild(option);
  });

  episodeSelector.addEventListener("change", (event) => {
    if (event.target.value === "all") {
      filteredEpisodes = [...allEpisodes]; // Reset to all episodes
      makePageForEpisodes(filteredEpisodes);
    } else {
      const selectedEpisode = allEpisodes.find(ep => ep.id == event.target.value);
      if (selectedEpisode) {
        makePageForEpisodes([selectedEpisode]); // Show only the selected episode
      }
    }
  });
}

// FUNCTION TO DISPLAY EPISODES
function makePageForEpisodes(episodeList, searchTerm = "") {
  const rootElem = document.getElementById("episode-container");
  rootElem.innerHTML = '';

  // Update search result count
  const resultCount = document.getElementById("search-result-count");
  resultCount.textContent = `Displaying ${episodeList.length} of ${allEpisodes.length} episodes`;

  const template = document.getElementById("episode-card-template");

  episodeList.forEach(episode => {
    const episodeCard = template.content.cloneNode(true);

    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;

    // Function to highlight search terms
    const highlight = (text) => searchTerm 
      ? text.replace(new RegExp(searchTerm, "gi"), match => `<span class="highlight">${match}</span>`)
      : text;

    episodeCard.querySelector(".episode-name").innerHTML = highlight(`${episode.name} - ${episodeNumber}`);
    episodeCard.querySelector("img").src = episode.image ? episode.image.medium : ''; // Check for image existence
    episodeCard.querySelector("[data-summary]").innerHTML = highlight(episode.summary);

    rootElem.appendChild(episodeCard);
  });
}

window.onload = setup;
