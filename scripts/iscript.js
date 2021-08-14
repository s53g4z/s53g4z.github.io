//
// WARN: don't enable strict null checks
// Fill out the left side of the card.
function fillLeft(result, newCard) {
    var left = newCard.querySelector(".left");
    var longtitle = result.collectionName;
    if (longtitle) { // the API changed; longtitle is no longer guaranteed
        var title = longtitle.substring(0, 100);
        if (longtitle.length > 100)
            title += "...";
        left.querySelector(".title").innerText = title;
    }
    var img = document.createElement("img");
    img.src = result.artworkUrl100;
    left.querySelector(".icon").appendChild(img);
}
// Fill out the right side of the card.
function fillRight(result, newCard) {
    var right = newCard.querySelector(".right");
    if (result.description) {
        var description = "Description: " + result.description;
        var desc = description.substring(0, 300);
        if (description.length > 300)
            desc += "...";
        right.querySelector(".description").innerHTML = desc; // dangerous
    }
    else if (result.wrapperType == "track") {
        var pageDescription = right.querySelector(".description");
        var pageArtist = document.createElement("div");
        pageArtist.innerText += "Artist: " + result.artistName;
        pageDescription.appendChild(pageArtist);
        var left = newCard.querySelector(".left");
        left.querySelector(".title").innerText = result.trackName;
    }
}
// Display the result in a card.
function displayResult(result) {
    var template = document.querySelector(".card");
    var newCard = template.cloneNode(true);
    document.body.appendChild(newCard);
    fillLeft(result, newCard);
    fillRight(result, newCard);
    newCard.style.display = ""; // show card
}
function makeCards(json) {
    var results = json.results;
    if (results.length == 0) {
        alert("No results. Try another search query?");
    }
    for (var i = 0; i < results.length; i++) {
        displayResult(results[i]);
    }
}
function getJSON(url) {
    //let url = "https://itunes.apple.com/search?country=US&limit=5&term=html%20";
    fetch(url)
        .then(function (resp) {
        if (!resp.ok || resp.status != 200) {
            throw new Error(resp.status.toString());
        }
        return resp.json();
    }).then(function (json) {
        makeCards(json);
    })["catch"](function (e) {
        document.body.innerHTML = e.message.toString();
    });
}
// Run me on page load! Hides the template card.
function hideTemplate() {
    var template = document.querySelector(".card");
    template.style.display = "none";
}
// Delete all cards except for the template one.
function destroyCards() {
    var cards = document.getElementsByClassName("card");
    while (cards.length > 1) {
        cards[1].parentNode.removeChild(cards[1]);
    }
}
// Activate the search button.
function activateButton() {
    var btn = document.getElementById("go");
    btn.onmousedown = function () {
        btn.style.backgroundColor = "silver";
    };
    btn.onmouseup = function () {
        btn.style.backgroundColor = "white";
    };
    btn.onclick = function () {
        //btn.onmousedown();
        btn.dispatchEvent(new Event("onmousedown"));
        setTimeout(btn.onmouseup, 100);
        destroyCards();
        var query = document.getElementById("query").value;
        var nresults = document.getElementById("nresults").value;
        var url = "https://itunes.apple.com/search?country=US";
        url += "&limit=" + nresults;
        url += "&term=" + encodeURIComponent(query);
        getJSON(url);
    };
}
// Make query search on return key press;
function activateQuery() {
    var query = document.getElementById("query");
    if (!query)
        throw new Error("unrecognized DOM");
    query.onkeypress = function (e) {
        if (e.keyCode == 13)
            document.getElementById("go").click();
    };
}
// main?
(function () {
    hideTemplate();
    activateButton();
    activateQuery();
    //getjsontest();
})();
