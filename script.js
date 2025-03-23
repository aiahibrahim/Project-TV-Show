let allEpisodes =[];
let filteredEpisodes =[];

function setup() {
  allEpisodes = getAllEpisodes(); // Assuming getAllEpisodes() is available
  filteredEpisodes = [...allEpisodes];// set initial value of filtered episodes to all episodes
  render();
  setupSearch();
  setupEpisodeSelect();
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("episode-container"); // The container where episodes will be displayed
  rootElem.innerHTML = ''; // Clear any existing content

  // Get the episode template from the HTML
  const template = document.getElementById("episode-card-template");

  episodeList.forEach((episode, index) => {
    const episodeCard = template.content.cloneNode(true); // Clone the template content
    
    // Format episode number (e.g., S01E01)
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`; // Format the episode code
    // Fill in the episode data
   
    episodeCard.querySelector(".episode-name").textContent = `${episode.name} - ${episodeNumber}`;;
    episodeCard.querySelector("img").src = episode.image.medium;
    episodeCard.querySelector("[data-summary]").innerHTML = episode.summary;
    episodeCard.querySelector(".episode-card").id = `episode-${index}`; //set unique id episode scrolling
    
    // Append the card to the container
    rootElem.appendChild(episodeCard);
  });
}

function render(){
  filterEpisodes();
  makePageForEpisodes(filteredEpisodes);
  updateEpisodeCount(filteredEpisodes.length);
  updateEpisodeDropdown(allEpisodes);

}

function setupSearch(){
  const searchInput = document.getElementById("q");

  searchInput.addEventListener("input", () => {
    filterEpisodes();  // Filter the episodes based on the search content
    render();  // Re-render the filtered episodes
  });

  searchInput.addEventListener("change", () => {
    const selectedValue = searchInput.value;

    if (selectedValue) {
      const episodeIndex = filteredEpisodes.findIndex(
        (episode) => `${episode.name} - S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}` === selectedValue
      );

      if (episodeIndex !== -1) {
        scrollToEpisode(episodeIndex);
      }
    }
  });
}

function filterEpisodes(){
  const searchInput = document.getElementById("q");
  const searchTerm = searchInput.value.toLowerCase();

  filteredEpisodes = allEpisodes.filter((episode) =>
    episode.name.toLowerCase().includes(searchTerm) ||
    episode.summary.toLowerCase().includes(searchTerm)
  );
}

function updateEpisodeCount(count) {
  const countElement = document.getElementById("episode-count");
  countElement.textContent = `${count} episode(s) found`;
}

function updateEpisodeDropdown(allEpisodes) {
  const select = document.getElementById("episode-select");
  select.innerHTML = ''; // Clear options

//  Ensure only one "All Episodes" option exists on dropdown bar
  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "";
  allEpisodesOption.textContent = "All Episodes";
  select.appendChild(allEpisodesOption);

  // Populate the dropdown with all episodes
  allEpisodes.forEach((episode, index) => {
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;
    const option = document.createElement("option");
    option.value = index; // Store index
    option.textContent = `${episodeNumber} - ${episode.name}`;
    select.appendChild(option);
  });
}

function setupEpisodeSelect() {
  const episodeSelect = document.getElementById("episode-select");
  
  episodeSelect.addEventListener("change", function () {
    const selectedIndex = this.value;
      if (selectedIndex === "") {
      // If "All Episodes" is selected, clear the search and display all episodes
      document.getElementById("q").value = ""; // Clear search box
      filteredEpisodes = [...allEpisodes]; // Reset to all episodes
      render(); // Refresh the display with all episodes
    } else {
      document.getElementById("q").value = ""; // Clear search box
      filteredEpisodes = [...allEpisodes]; // Reset to all episodes
      render();
      // Scroll to the selected episode
      scrollToEpisode(selectedIndex);
      episodeSelect.value = selectedIndex; // Ensure selected value stays
    }
  });
}

function scrollToEpisode(index) {
  // Find the episode card with the correct index and scroll to it
  const episodeCard = document.getElementById(`episode-${index}`);
  if (episodeCard) {
    episodeCard.scrollIntoView({ behavior: "smooth", block: "center" });
    // Optionally, update the search bar to show the selected episode
    const episode = allEpisodes[index];
    document.getElementById("q").value = `${episode.name} - S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;
  }
}

window.onload = setup;
