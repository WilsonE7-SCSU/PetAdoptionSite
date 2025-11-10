// PHASE 1: RANDOM PET IMAGES ON LOADING PAGE
function loadImgs() {
    // Pet data is stored in json/pets.json

    // Get array of img elements
    const imageGrid = document.getElementsByTagName("img");

    // Get array of tooltip elements
    //const tooltips = document.getElementsByClassName("tooltip");

    // Request pet data
    const xhttp = new XMLHttpRequest();
    xhttp.onerror = function() {
        alert("Communication error");
    }
    xhttp.onload = function() {
        const petData = JSON.parse(this.responseText);
        let petNum = petData.pets.length;
        // For cells 1-9, map a random pet image to the grid
        for (let i = 0; i < imageGrid.length; i++) {
            let imgNum = Math.floor(Math.random() * petNum);
            imageGrid[i].src = petData.pets[imgNum].img;
            imageGrid[i].id = petData.pets[imgNum].id;
            let name = petData.pets[imgNum].name;
            let age = petData.pets[imgNum].age;
            let loc = petData.pets[imgNum].location;
            //tooltips[i].innerHTML = "Name: " + name + "<br>Age: " + age + "<br>Location: " + loc;
        }
    }
    xhttp.open("GET", "public_html/json/pets.json");
    xhttp.send();
}
