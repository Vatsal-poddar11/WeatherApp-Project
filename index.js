const userTab = document.querySelector("[userWeather]");
const searchTab = document.querySelector("[searchWeather]");
const userContainer = document.querySelector(".container");
const userInfoContainer = document.querySelector(".user-weather-container");
const grantAccessContainer = document.querySelector(".grant-access-container");
const searchForm = document.querySelector(".search-weather-container");
const errorImg = document.querySelector(".error");

let currentTab = userTab;
currentTab.classList.add("current-tab");
const API_KEY = "f30389aa3190f198c2bdeda9662a77f7";
getFromSessionStorage();

function switchTab(clickedTab){
    if(currentTab != clickedTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            // user clicked on search weather tab
            userInfoContainer.classList.remove("active");
            grantAccessContainer.remove("active");
            searchForm.classList.add("active");
            errorImg.classList.remove("active");
        }
        else{
            // user clicked on your weather tab
            searchForm.classList.remove("active");
            errorImg.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

// Check if the coordinates are present in session storage or not

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if(!localCoordinates){
        // Location coordinates not present, means location access not given
        grantAccessContainer.classList.add("active");
    }
    else{
        // Local coordinates present
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // Make grantAccessContainer invisible
    grantAccessContainer.classList.remove("active");

    // API Call
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        userInfoContainer.classList.add("active");      
        renderWeatherInfo(data);
    }
    catch(error){
        alert("Unable to get Weather Details");
    }
}

function renderWeatherInfo(weatherInfo){

    // Fetch all the elements
    const cityName = document.querySelector("[placeName]");
    const countryIcon = document.querySelector("[placeFlag]");
    const weatherDescription = document.querySelector("[weatherDesc]");
    const weatherImage = document.querySelector("[weatherImg]");
    const temperature = document.querySelector("[currentTemp]");
    const windSpeed = document.querySelector("[windSpeed]");
    const humidity = document.querySelector("[humidityPercent]");
    const clouds = document.querySelector("[cloudiness]");

    // Fetch values from weatherInfo object and place them on UI
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDescription.innerText = weatherInfo?.weather?.[0]?.description;
    weatherImage.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temperature.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all} %`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("Cannot Access Your Location");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const searchInput = document.querySelector("[data-CityName]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let cityName = searchInput.value;
    if(cityName === "") 
        return;
    else
        fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city){
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();
        if(data?.message === "city not found"){
            errorImg.classList.add("active");
        }
        else{
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
    } 
    catch (error) {
        alert("Unable to fetch weather details for input city.")
    }
}
