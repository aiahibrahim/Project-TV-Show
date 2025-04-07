/* ========== GLOBAL VARIABLES ========== */
// Stores all shows fetched from API
let allShows = [];
// Stores shows matching current search criteria
let filteredShows = [];
// Stores all episodes for current show
let allEpisodes = [];
// Stores episodes matching current search
let filteredEpisodes = [];
// Cache to prevent duplicate API calls {showId: episodes[]}
let cachedEpisodes = {};


/* ========== DOM ELEMENTS ========== */
// View containers
const showsView = document.getElementById("shows-view");
const episodesView = document.getElementById("episodes-view");
// Navigation elements
const viewToggle = document.getElementById("view-toggle");
const showSearchInput = document.getElementById("show-search-input");
const showResultCount = document.getElementById("show-result-count");
const showSearchTerm = document.getElementById("show-search-term");
const showSelector = document.getElementById("show-selector");
const episodeSearchInput = document.getElementById("episode-search-input");
const episodeResultCount = document.getElementById("episode-result-count");
const episodeSearchTerm = document.getElementById("episode-search-term");
const episodeSelector = document.getElementById("episode-selector");
const showsContainer = document.getElementById("shows-container");
const episodeContainer = document.getElementById("episode-container");


/* ========== INITIALIZATION ========== */
// Main setup function when page loads
async function setup() {
 try {
   await fetchAllShows();
   setupShowSearch();
   setupViewToggle();
   setupShowMoreButtons();
 } catch (error) {
   console.error("Initialization failed:", error);
   showsContainer.innerHTML = `
     <div class="error">
       <p>Failed to load shows. Please check your connection.</p>
       <button onclick="window.location.reload()">Retry</button>
     </div>`;
 }
}


/* ========== SHOW FUNCTIONS ========== */
// Fetch all shows from API
async function fetchAllShows() {
 try {
   const response = await fetch("https://api.tvmaze.com/shows");
   if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
   allShows = await response.json();
   allShows.sort((a, b) => a.name.localeCompare(b.name));
   filteredShows = [...allShows];
  
   displayShows(filteredShows);
   updateShowResultCount();
   updateShowDropdown();
 } catch (error) {
   console.error("Fetch shows failed:", error);
   throw error;
 }
}


// Display shows in the UI
function displayShows(shows, searchTerm = "") {
 showsContainer.innerHTML = "";
 showSearchTerm.textContent = searchTerm || "all shows";
  const template = document.getElementById("show-card-template");


 shows.forEach(show => {
   const showCard = template.content.cloneNode(true);
  
   // Highlight search matches
   const highlight = (text) => searchTerm && text
     ? text.toString().replace(
         new RegExp(searchTerm, "gi"),
         match => `<span class="highlight">${match}</span>`
       )
     : text;
  
   // Set show content
   showCard.querySelector(".show-name").innerHTML = highlight(show.name);
   showCard.querySelector(".show-image").src =
     show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image';
  
   // Set metadata
   showCard.querySelector(".rating-value").textContent =
     show.rating?.average?.toFixed(1) || 'N/A';
   showCard.querySelector(".runtime-value").textContent =
     show.runtime || '?';
   showCard.querySelector(".status-value").textContent =
     show.status || 'Unknown';
  
   // Set summary (strip HTML tags)
   const summaryText = show.summary
     ? show.summary.replace(/<[^>]*>/g, "")
     : "No summary available";
   showCard.querySelector(".show-summary").innerHTML = highlight(summaryText);
  
   // Set genres
   const genresHTML = show.genres?.length
     ? show.genres.map(g => `<span>${highlight(g)}</span>`).join('')
     : '<span>No genres listed</span>';
   showCard.querySelector(".show-genres").innerHTML = genresHTML;
  
   // Click handler for episodes
   showCard.querySelector(".show-card").addEventListener("click", () => {
     displayEpisodesForShow(show);
   });
  
   showsContainer.appendChild(showCard);
 });
  setupShowMoreButtons();
}


/* ========== EPISODE FUNCTIONS ========== */
// Display episodes for a specific show
async function displayEpisodesForShow(show) {
 try {
   // Validate show object
   if (!show?.id) throw new Error("Invalid show data");
  
   // Show loading state
   episodeContainer.innerHTML = `<div class="loading">Loading episodes...</div>`;
   episodeSearchTerm.textContent = show.name;
   showsView.style.display = "none";
   episodesView.style.display = "block";
   viewToggle.style.display = "block";
  
   // Check cache or fetch
   if (cachedEpisodes[show.id]?.length > 0) {
     allEpisodes = cachedEpisodes[show.id];
   } else {
     const response = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`);
     if (!response.ok) throw new Error(`Server error: ${response.status}`);
    
     allEpisodes = await response.json();
     if (!allEpisodes?.length) throw new Error("No episodes available");
    
     cachedEpisodes[show.id] = allEpisodes;
   }
  
   // Update UI
   filteredEpisodes = [...allEpisodes];
   displayEpisodes(filteredEpisodes);
   setupEpisodeSelector();
   setupEpisodeSearch();
   updateEpisodeResultCount();
  
 } catch (error) {
   console.error("Episode load error:", {
     show: show?.name,
     id: show?.id,
     error: error.message
   });
  
   episodeContainer.innerHTML = `
     <div class="error">
       <p>Couldn't load episodes for <strong>${show?.name || 'this show'}</strong></p>
       <p><small>${error.message}</small></p>
       <button onclick="location.reload()">Try Again</button>
     </div>`;
 }
}


// Display episode cards
function displayEpisodes(episodes, searchTerm = "") {
 episodeContainer.innerHTML = "";
 episodeSearchTerm.textContent = searchTerm || "all episodes";
  const template = document.getElementById("episode-card-template");


 episodes.forEach(episode => {
   const episodeCard = template.content.cloneNode(true);
   const epNumber = `S${episode.season.toString().padStart(2, '0')}E${episode.number.toString().padStart(2, '0')}`;
  
   // Highlight search matches
   const highlight = (text) => searchTerm && text
     ? text.replace(
         new RegExp(searchTerm, "gi"),
         match => `<span class="highlight">${match}</span>`
       )
     : text;
  
   // Set episode content
   episodeCard.querySelector(".episode-name").innerHTML =
     highlight(`${episode.name} - ${epNumber}`);
   episodeCard.querySelector("img").src =
     episode.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image';
  
   const summaryText = episode.summary
     ? episode.summary.replace(/<[^>]*>/g, "")
     : "No summary available";
   episodeCard.querySelector("[data-summary]").innerHTML = highlight(summaryText);
  
   episodeContainer.appendChild(episodeCard);
 });
  setupShowMoreButtons();
}


/* ========== UTILITY FUNCTIONS ========== */
// Set up show search functionality
function setupShowSearch() {
 showSearchInput.addEventListener("input", () => {
   const term = showSearchInput.value.toLowerCase();
   filteredShows = allShows.filter(show =>
     show.name.toLowerCase().includes(term) ||
     (show.summary && show.summary.toLowerCase().includes(term)) ||
     (show.genres && show.genres.some(g => g.toLowerCase().includes(term)))
   );
   displayShows(filteredShows, term);
   updateShowResultCount();
   updateShowDropdown();
 });
}


// Update show dropdown selector
function updateShowDropdown() {
 showSelector.innerHTML = '<option value="">Select a show</option>';
 filteredShows.forEach(show => {
   const option = document.createElement("option");
   option.value = show.id;
   option.textContent = show.name;
   showSelector.appendChild(option);
 });
  showSelector.addEventListener("change", (e) => {
   if (e.target.value) {
     const selectedShow = filteredShows.find(s => s.id == e.target.value);
     if (selectedShow) displayEpisodesForShow(selectedShow);
   }
 });
}


// Set up episode selector dropdown
function setupEpisodeSelector() {
 episodeSelector.innerHTML = '<option value="all">All Episodes</option>';
 allEpisodes.forEach(ep => {
   const epNumber = `S${ep.season.toString().padStart(2, '0')}E${ep.number.toString().padStart(2, '0')}`;
   const option = document.createElement("option");
   option.value = ep.id;
   option.textContent = `${epNumber} - ${ep.name}`;
   episodeSelector.appendChild(option);
 });
  episodeSelector.addEventListener("change", (e) => {
   filteredEpisodes = e.target.value === "all"
     ? [...allEpisodes]
     : allEpisodes.filter(ep => ep.id == e.target.value);
   displayEpisodes(filteredEpisodes);
   updateEpisodeResultCount();
 });
}


// Set up episode search
function setupEpisodeSearch() {
 episodeSearchInput.addEventListener("input", () => {
   const term = episodeSearchInput.value.toLowerCase();
   filteredEpisodes = allEpisodes.filter(ep =>
     ep.name.toLowerCase().includes(term) ||
     (ep.summary && ep.summary.toLowerCase().includes(term))
   );
   displayEpisodes(filteredEpisodes, term);
   updateEpisodeResultCount();
 });
}


// Initialize "Show more" buttons
function setupShowMoreButtons() {
 document.querySelectorAll('.show-more-btn').forEach(btn => {
   btn.addEventListener('click', (e) => {
     e.stopPropagation();
     const summary = e.target.closest('div').querySelector('p');
     summary.classList.toggle('expanded');
     e.target.textContent = summary.classList.contains('expanded')
       ? 'Show less'
       : 'Show more';
   });
 });
}


// Set up view toggle button
function setupViewToggle() {
 viewToggle.addEventListener("click", () => {
   showsView.style.display = "block";
   episodesView.style.display = "none";
   viewToggle.style.display = "none";
   showSearchTerm.textContent = "all shows";
   showResultCount.textContent = `found ${filteredShows.length} shows`;
 });
}


// Update show counter
function updateShowResultCount() {
 showResultCount.textContent = `found ${filteredShows.length} shows`;
}


// Update episode counter
function updateEpisodeResultCount() {
 episodeResultCount.textContent = `found ${filteredEpisodes.length} episodes`;
}


// Start the application
window.onload = setup;
