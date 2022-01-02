/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {

  //request show list from the api, wait for response.
  let response = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`);
  
  //create an array of objects with the information we need from each show. (mapping so we have the info for each show returned)
  let shows = response.data.map(listing => {
    let show = listing.show;
    return{
      id: show.id,
      name: show.name,
      summary: show.summary,
      //if there is a show image, get the url (show.image.medium), otherwise use placeholder image.
      image: show.image ? show.image.medium: 'https://tinyurl.com/tv-missing'
    };
  });

  return shows;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  //create a reference to the shows list area
  const $showsList = $("#shows-list");
  //clear the area before repopulating
  $showsList.empty();

  //create a DOM card for every show in the list
  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
           </div>
           <button id="episode-btn" class="episode-btn">Show Episodes</button>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {

  //request info from the api for the selected id, wait for the response.
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  
  //creates array of objects from the episode array from the api with the info we need to use
  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
  
  //returns object list
  return episodes;
}

//add the episodes to the DOM
function populateEpisodes(episodeArr){
  //creates reference for the episode list section of the DOM
  let $episodeList = $('#episodes-list');
  //clears the info that was in the area previously, so we only show most recently clicked show info
  $episodeList.empty();

  //create the list item for each episode and add it to the list
  for (let ep of episodeArr){
    //create a li with the episode information
    let $li = $("<li>").text(`${ep.name} (Season ${ep.season}, Episode ${ep.number})`);

    //add the li to the list
    $episodeList.append($li);
  }

  //unhide the episode area
  $('#episodes-area').show();

}

//handle clicks on the show Episode button
$("#shows-list").on("click", ".card", async function buttonClick(e){
  //gets the closest card to the clicked button
  let showId = $(e.target).closest(".card").data("show-id");

  //fetches the episode list and waits for it to finish
  let episodes = await getEpisodes(showId);
  //once episode list is recieved, display the episodes
  populateEpisodes(episodes);

});
