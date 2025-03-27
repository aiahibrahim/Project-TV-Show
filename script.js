let allEpisodes = [];
let filteredEpisodes = [];
let cachedEpisodes={};//to prevent duplicate Api calls

const showSelector = document.getElementById("show-selector");
const episodeSelector = document.getElementById("episode-selector");
const searchInput = document.getElementById("search-input");
const resultCount = document.getElementById("search-result-count");

async function setup() {
  document.getElementById("episode-container").innerHTML = "<p>Loading...</p>";
  
  try {
    await fetchShows();// to fetch all Tv Shows 
  } catch (error) {
    
    console.error("Error initializing app:",error);
  }
  setupSearchFeature();// to ensure search works after fetching shows
}

// Fetch list of TV shows and populate dropdown
async function fetchShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error("Failed to fetch shows.");

    const shows = await response.json();
   
    // Sort shows alphabetically
    shows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

    // Populate dropdown
    showSelector.innerHTML = '<option value="">Select a Show</option>';
    shows.forEach(show => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showSelector.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading shows:", error);
    showSelector.innerHTML = '<option value="">Error loading shows</option>';
  }
}

async function fetchEpisodesForShow(showId) {
  if (cachedEpisodes[showId]) {
    allEpisodes = cachedEpisodes[showId];
    filteredEpisodes = [...allEpisodes];
    makePageForEpisodes(cachedEpisodes[showId]);
    setupEpisodeSelector();
    return;
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) throw new Error("Failed to fetch episodes.");

    const episodes = await response.json();
    cachedEpisodes[showId] = episodes; // Store in cache

    allEpisodes = episodes;
    filteredEpisodes= [...allEpisodes];
    makePageForEpisodes(filteredEpisodes);
    setupEpisodeSelector();
    

  } catch (error) {
    console.error("Error fetching episodes:", error);
    document.getElementById("episode-container").innerHTML = "<p style='color:red;'>Error loading episodes.</p>";
  }
}

showSelector.addEventListener("change", (event)=>{
  const selectedShowId = event.target.value;
  if(selectedShowId){
    fetchEpisodesForShow(selectedShowId);

  };
});

// SEARCH FUNCTIONALITY for new show selection
function setupSearchFeature() {
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    filteredEpisodes = allEpisodes.filter(episode => 
      episode.name.toLowerCase().includes(searchTerm) || 
      episode.summary.toLowerCase().includes(searchTerm)
    );

    makePageForEpisodes(filteredEpisodes, searchTerm);
  });
}

function setupEpisodeSelector(){
  episodeSelector.innerHTML = ''; //to clear previous options

  //add all episodes option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Episodes";
  episodeSelector.appendChild(allOption);

  allEpisodes.forEach(episode =>{
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

