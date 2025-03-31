import { useState, useEffect } from "react";
import useEnterKey from "./useEnterKey";


function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}





function App() {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState('');


 




 
 useEffect(function () {
  if (!location || location.length < 3) return;

  const controller = new AbortController(); // Create an AbortController
  const signal = controller.signal;

  async function featchWeather() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
        { signal } // Pass the signal to the fetch request
      );
      if (!response.ok) {
        throw new Error("Location not found");
      }
      const data = await response.json();
      console.log(data);
      if (!data.results) {
        throw new Error("Location not found");
      }
      const { latitude, longitude, timezone, name, country_code } = data.results[0];
      setLocationData(`${name} ${convertToFlag(country_code)}`);

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`,
        { signal } // Pass the signal to the fetch request
      );
      const weatherData = await weatherRes.json();
      console.log(weatherData.daily);
      setWeatherData(weatherData.daily);
      setLoading(false);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        setError(error);
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }

  featchWeather();

  return () => {
    console.log("cleanup");
    controller.abort(); 
    setWeatherData({});
  };
}, [location]);


  return (
    <div className="app">
      <div>
      <h1> Classy Weather</h1>
      <div className="container">
        < div className="wrapper" >
          <span></span>
          < span className="left"></span>
        </div>
        <div className="icon"><span className="material-symbols-outlined">
airwave
</span></div>
        < div className="wrapper" >
          <span></span>
          <span className="right"></span>
        </div>
        </div>
        </div>
      {/* <div> */}
        <Input location={location} onChange={setLocation}  />
      {/* </div> */}
      {loading && <p className="loader">Loading...</p>}
      {error && <p className="error">{error.message}</p>}
      {weatherData.weathercode && 
        <Weather location={locationData} weatherData={weatherData} />}
    
    </div>
  );
}


function Input({ location, onChange, }) {

 const inputRef = useEnterKey();




  return (
    <input
      ref={inputRef}
      className="input"
      type="text"
      placeholder="Search from Location..."
      value={location}
    onChange={(e) => onChange(e.target.value)}/>
      
  )
}

function Weather({ location, weatherData }) {
  const {
 temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: code,
  } = weatherData;
  return (
    <div className="weather">
      <h2>Weather <span>{location}</span></h2>
      <ul className="weather-list">
        {dates.map((day, index) => <Day
          key={day}
          day={day}
          code={code[index]}
          max={max[index]}
          min={min[index]}
          isToday={index === 0} />)
        }
      </ul>
    </div>
  )
}


function Day({ day, code, max, min, isToday }) {
  if (code === 1) console.log('ok');
  return (
    <li className="weather-item">
      <span className={code === 0 || code === 1 ? 'sun' : "" }>{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(day)}</p>
        <p>{Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}
        </strong>
      </p>

    </li>
  )
}
 

export default App;