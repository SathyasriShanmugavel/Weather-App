import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_KEY = '31e04c3a73f13c52dce8349753aa8706';

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const searchCity = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');

    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );

      setWeatherData(weatherRes.data);
      
      const dailyForecasts = forecastRes.data.list
        .filter(item => item.dt_txt.includes('12:00:00'))
        .slice(0, 5);
      
      setForecastData(dailyForecasts);

      // Save to recent searches
      const newSearch = {
        name: weatherRes.data.name,
        country: weatherRes.data.sys.country,
        temp: weatherRes.data.main.temp
      };
      const updated = [newSearch, ...recentSearches.filter(s => s.name !== newSearch.name)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));

    } catch (err) {
      setError('City not found. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Haze': '🌫️'
    };
    return icons[condition] || '☀️';
  };

  const getNextFiveDays = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = currentTime.getDay();
    const nextDays = [];
    for (let i = 1; i <= 5; i++) {
      nextDays.push(days[(today + i) % 7]);
    }
    return nextDays;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatSunTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 20}s`
      }}
    >
      {['☀️', '☁️', '🌧️', '⛈️', '❄️'][Math.floor(Math.random() * 5)]}
    </div>
  ));

  return (
    <div className="weather-app">
      {particles}
      
      <div className="main-container">
        {/* Header */}
        <div className="header">
          <div className="logo">
            <span className="logo-icon">🌤️</span>
            <span className="logo-text">WeatherView</span>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCity(e)}
            />
            <button onClick={searchCity}>Search</button>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            {recentSearches.map((item, index) => (
              <span
                key={index}
                className="recent-item"
                onClick={() => {
                  setCity(item.name);
                  setTimeout(() => searchCity(new Event('submit')), 100);
                }}
              >
                {item.name}, {item.country} {Math.round(item.temp)}°
              </span>
            ))}
          </div>
        )}

        {/* Loading Screen */}
        {loading && (
          <div className="loading-screen">
            <div className="loader"></div>
          </div>
        )}

        {/* Error Screen */}
        {error && (
          <div className="error-screen">
            <div style={{ color: 'white', textAlign: 'center' }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 20 }}>⚠️</span>
              <h2 style={{ marginBottom: 10 }}>{error}</h2>
              <p style={{ opacity: 0.7 }}>Please try another city</p>
            </div>
          </div>
        )}

        {/* Weather Content */}
        {weatherData && forecastData && (
          <div className="weather-content">
            {/* Left Column - Current Weather */}
            <div className="current-weather">
              <div className="city-info">
                <div className="city-details">
                  <h1>{weatherData.name}</h1>
                  <span className="country-badge">{weatherData.sys.country}</span>
                </div>
                <div className="weather-tag">
                  <span>{getWeatherIcon(weatherData.weather[0].main)}</span>
                  {weatherData.weather[0].main}
                </div>
              </div>

              <div className="date-section">
                <div className="day">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="full-date">
                  <span>{currentTime.toLocaleDateString('en-US', { month: 'short' })}{currentTime.getDate()}</span>
                  <span>•</span>
                  <span>{currentTime.getFullYear()}</span>
                </div>
                <div className="time">
                  {formatTime(currentTime).replace(/(AM|PM)/, '')}
                  <span className="meridiem">{formatTime(currentTime).slice(-2)}</span>
                </div>
              </div>

              <div className="temp-display">
                <div className="temp-icon">{getWeatherIcon(weatherData.weather[0].main)}</div>
                <div>
                  <span className="temp-value">{Math.round(weatherData.main.temp)}</span>
                  <span className="temp-unit">°C</span>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">🌡️</div>
                  <div className="metric-content">
                    <div className="metric-label">FEELS LIKE</div>
                    <div>
                      <span className="metric-number">{Math.round(weatherData.main.feels_like)}</span>
                      <span className="metric-unit">°C</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">💧</div>
                  <div className="metric-content">
                    <div className="metric-label">HUMIDITY</div>
                    <div>
                      <span className="metric-number">{weatherData.main.humidity}</span>
                      <span className="metric-unit">%</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">💨</div>
                  <div className="metric-content">
                    <div className="metric-label">WIND</div>
                    <div>
                      <span className="metric-number">{weatherData.wind.speed}</span>
                      <span className="metric-unit">mph</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <div className="metric-label">PRESSURE</div>
                    <div>
                      <span className="metric-number">{weatherData.main.pressure}</span>
                      <span className="metric-unit">hPa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Sunrise & Sunset */}
              <div className="sun-card">
                <h2>
                  <span>🌅</span>
                  Sunrise & Sunset
                </h2>
                <div className="sun-times-grid">
                  <div className="sun-time-item">
                    <div className="sun-icon">🌅</div>
                    <div className="sun-text">
                      <div className="sun-label">SUNRISE</div>
                      <div className="sun-value">{formatSunTime(weatherData.sys.sunrise)}</div>
                    </div>
                  </div>
                  <div className="sun-time-item">
                    <div className="sun-icon">🌇</div>
                    <div className="sun-text">
                      <div className="sun-label">SUNSET</div>
                      <div className="sun-value">{formatSunTime(weatherData.sys.sunset)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast */}
              <div className="forecast-card">
                <div className="forecast-header">
                  <h2>
                    <span>📅</span>
                    5-Day Forecast
                  </h2>
                  <span className="forecast-badge">Next 5 days</span>
                </div>
                <div className="forecast-days">
                  {forecastData.map((day, index) => (
                    <div key={index} className="forecast-day-item">
                      <div className="forecast-day-name">{getNextFiveDays()[index]}</div>
                      <div className="forecast-day-icon">{getWeatherIcon(day.weather[0].main)}</div>
                      <div className="forecast-day-temp">{Math.round(day.main.temp)}°</div>
                      <div className="forecast-day-range">
                        {Math.round(day.main.temp_max)}°/{Math.round(day.main.temp_min)}°
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <div>© 2026 WeatherView • All rights reserved</div>
          <div className="footer-links">
            <span>About</span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;