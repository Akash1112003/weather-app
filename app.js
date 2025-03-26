const API_KEY='a2daca08781b4f968dd60135252403';

const weatherInfo=document.getElementById('weather-info');
const error=document.getElementById("error");
const loading=document.getElementById("loading");
const cityInput = document.getElementById("city-input");
const searchContainer = document.querySelector(".search-container");
const recentSearchesDropdown = document.createElement("div");
recentSearchesDropdown.id = "recent-searches";
recentSearchesDropdown.className = "absolute bg-white text-black rounded-lg shadow-md mt-2 hidden max-h-40 overflow-auto w-full border border-gray-300";
searchContainer.appendChild(recentSearchesDropdown);

async function getWeatherByCity(cityName) {
    showLoading();
    try{
        const weatherUrl= `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=7&alerts=no`;
        
        const response=await fetch(weatherUrl);
        const data =await response.json();
        console.log(data);

        if(!response.ok|| data.error){
            throw new Error(data.error?.message||"City not found");
        }
        displayWeather(data);
        saveRecentSearch(cityName);
    } 
    catch(err){
        showError(err.message);
    }
}

function getWeather(){
    const cityName = cityInput.value.trim();
    if(!cityName) return;
    getWeatherByCity(cityName);
}

function saveRecentSearch(cityName) {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentCities = recentCities.filter(city => city.toLowerCase() !== cityName.toLowerCase()); // Remove duplicate case variations
    recentCities.unshift(cityName);
    if (recentCities.length > 5) recentCities.pop();
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateRecentSearches();
}

function updateRecentSearches() {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentSearchesDropdown.innerHTML = "";
    if (recentCities.length === 0) {
        recentSearchesDropdown.classList.add("hidden");
        return;
    }
    recentCities.forEach(city => {
        let cityItem = document.createElement("div");
        cityItem.className = "p-2 hover:bg-gray-200 cursor-pointer border-b border-gray-300";
        cityItem.textContent = city;
        cityItem.onclick = () => {
            cityInput.value = city;
            getWeatherByCity(city);
            recentSearchesDropdown.classList.add("hidden");
        };
        recentSearchesDropdown.appendChild(cityItem);
    });
    recentSearchesDropdown.classList.remove("hidden");
}

cityInput.addEventListener("focus", updateRecentSearches);
cityInput.addEventListener("input", updateRecentSearches);

window.addEventListener("click", (e) => {
    if (!cityInput.contains(e.target) && !recentSearchesDropdown.contains(e.target)) {
        setTimeout(() => recentSearchesDropdown.classList.add("hidden"), 200);
    }
});

function displayWeather(data){
    weatherInfo.style.display='block';
    error.style.display='none';
    loading.style.display='none';

    document.getElementById("city-name").textContent=data.location.name;
    document.getElementById("date").textContent=data.location.localtime;
    document.getElementById("temperature").textContent= `${data.current.temp_c}°C`;
    document.getElementById("weather-description").textContent =data.current.condition.text;
    document.getElementById("weather-icon").src=data.current.condition.icon;
    document.getElementById("feels-like").textContent=`${data.current.feelslike_c}°C`;
    document.getElementById("humidity").textContent=`${data.current.humidity}%`;
    document.getElementById("wind-speed").textContent=`${data.current.wind_kph}km/h`;
    document.getElementById("uv-index").textContent=data.current.uv;

    const forecastContainer =document.getElementById("forecast");
    forecastContainer.innerHTML='';
    data.forecast.forecastday.forEach(day =>{
        const forecastDay=document.createElement("div");
        forecastDay.className ='forecast-day';
        forecastDay.innerHTML=`
        <h3>${ new Date(day.date).toLocaleDateString('en-us',{weekday:'long'})}</h3>
        <img class="forecast-icon" src="${day.day.condition.icon}" alt="weather-icon">
        <p>${Math.round(day.day.maxtemp_c)}°C / ${Math.round(day.day.mintemp_c)}°C</p>
        <p>${day.day.condition.text}</p>
        `;
        forecastContainer.appendChild(forecastDay);
    });
}

function showError(message){
    error.style.display='block';
    error.textContent=message;
    weatherInfo.style.display='none';
    loading.style.display='none';
}

function showLoading(){
    loading.style.display='block';
    error.style.display='none';
    weatherInfo.style.display='none';
}

document.getElementById("city-input").addEventListener('keypress',(e)=>{
    if(e.key ==='Enter'){
        getWeather();
    }
});

window.addEventListener('load',()=>{
    document.getElementById('city-input').value='London';
    getWeatherByCity("London");
    updateRecentSearches();
});
