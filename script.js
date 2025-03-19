function setup() {
  const allEpisodes = getAllEpisodes(); // Assuming getAllEpisodes() is available
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("episode-container"); // The container where episodes will be displayed
  rootElem.innerHTML = ''; // Clear any existing content

  // Get the episode template from the HTML
  const template = document.getElementById("episode-card-template");

  episodeList.forEach((episode) => {
    const episodeCard = template.content.cloneNode(true); // Clone the template content
    
    // Format episode number (e.g., S01E01)
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`; // Format the episode code
    // Fill in the episode data
   
    episodeCard.querySelector(".episode-name").textContent = `${episode.name} - ${episodeNumber}`;;
    episodeCard.querySelector("img").src = episode.image.medium;
    episodeCard.querySelector("[data-summary]").innerHTML = episode.summary;

    // Append the card to the container
    rootElem.appendChild(episodeCard);
  });
}

window.onload = setup;
