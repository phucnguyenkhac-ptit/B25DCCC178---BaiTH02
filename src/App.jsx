import React, { useState, useEffect } from "react";
import "./styles.css";


const CITIES = [
  { id: 1, name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { id: 2, name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { id: 3, name: "Huế", lat: 16.4637, lon: 107.5909 },
  { id: 4, name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { id: 5, name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { id: 6, name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { id: 7, name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { id: 8, name: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
];


const COLORS = [
  { label: "Xanh biển", value: "#0b6e8a" },
  { label: "Xanh lá", value: "#2e7d32" },
  { label: "Tím", value: "#6a3fa0" },
  { label: "Cam", value: "#d4601a" },
];

const DAY_NAMES = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];


function getWeatherInfo(code) {
  if (code === 0) return { icon: "☀️", text: "Trời quang" };
  if (code <= 2) return { icon: "🌤️", text: "Ít mây" };
  if (code === 3) return { icon: "☁️", text: "Nhiều mây" };
  if (code <= 48) return { icon: "🌫️", text: "Sương mù" };
  if (code <= 57) return { icon: "🌦️", text: "Mưa phùn" };
  if (code <= 65) return { icon: "🌧️", text: "Mưa" };
  if (code <= 82) return { icon: "🌧️", text: "Mưa rào" };
  return { icon: "⛈️", text: "Dông" };
}

function showTemp(celsius, unit) {
  if (unit === "F") {
    return Math.round((celsius * 9) / 5 + 32) + "°F";
  }
  return Math.round(celsius) + "°C";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function formatDay(text) {
  const parts = text.split("-");
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return { weekday: DAY_NAMES[date.getDay()], date: parts[2] + "/" + parts[1] };
}

function App() {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [nameInput, setNameInput] = useState("");
  const [color, setColor] = useState(localStorage.getItem("color") || COLORS[0].value);
  const [myCityId, setMyCityId] = useState(Number(localStorage.getItem("myCity")) || null);

  const [selectedId, setSelectedId] = useState(myCityId); 
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0); 
  const [unit, setUnit] = useState("C");

  const selectedCity = CITIES.find((c) => c.id === selectedId);

  useEffect(() => {
    if (!selectedCity) return;

    setLoading(true);
    setError(false);

    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=" + selectedCity.lat +
      "&longitude=" + selectedCity.lon +
      "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=Asia%2FHo_Chi_Minh&forecast_days=7";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi mạng");
        return res.json();
      })
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [selectedId, retryCount]);

  function saveName() {
    const clean = nameInput.trim();
    if (clean === "") return;
    setName(clean);
    localStorage.setItem("name", clean);
  }

  function changeColor(value) {
    setColor(value);
    localStorage.setItem("color", value);
  }

  function setMyCity() {
    setMyCityId(selectedId);
    localStorage.setItem("myCity", selectedId);
  }

  let content;

  if (selectedId === null) {
    content = <p className="message">Hãy chọn một thành phố ở danh sách bên trái.</p>;
  } else if (loading) {
    content = <p className="message">Đang tải thời tiết {selectedCity.name}...</p>;
  } else if (error) {
    content = (
      <div className="message">
        <p>Không tải được dữ liệu. Hãy kiểm tra mạng rồi thử lại.</p>
        <button className="btn" onClick={() => setRetryCount(retryCount + 1)}>
          Thử lại
        </button>
      </div>
    );
  } else if (weather) {
    const now = weather.current;
    const info = getWeatherInfo(now.weather_code);

    content = (
      <div>
        <h2>{selectedCity.name}</h2>
        <div className="now">
          <span className="now-icon">{info.icon}</span>
          <span className="now-temp">{showTemp(now.temperature_2m, unit)}</span>
        </div>
        <p>{info.text}</p>
        <p>Độ ẩm: {now.relative_humidity_2m}%</p>
        <p>Gió: {now.wind_speed_10m} km/h</p>
        <p>Cập nhật lúc: {now.time.replace("T", " ")}</p>

        {myCityId === selectedId ? (
          <p className="my-city">★ Đây là thành phố của bạn</p>
        ) : (
          <button className="btn" onClick={setMyCity}>
            ☆ Đặt làm thành phố của tôi
          </button>
        )}

        <h3>Dự báo 7 ngày tới</h3>
        {weather.daily.time.map((day, i) => {
          const d = formatDay(day);
          const dayInfo = getWeatherInfo(weather.daily.weather_code[i]);
          return (
            <div className="day" key={day}>
              <span className="day-name">
                {d.weekday} ({d.date})
              </span>
              <span>{dayInfo.icon}</span>
              <span>
                <b>{showTemp(weather.daily.temperature_2m_max[i], unit)}</b> /{" "}
                {showTemp(weather.daily.temperature_2m_min[i], unit)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  if (name === "") {
    return (
      <div className="app" style={{ "--mau": color }}>
        <div className="welcome">
          <h1>Xin chào! 👋</h1>
          <p>Bạn tên là gì?</p>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Nhập tên của bạn"
          />
          <button className="btn" onClick={saveName}>
            Bắt đầu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ "--mau": color }}>
      <header>
        <h1>
          {getGreeting()}, {name}!
        </h1>
        <div className="tools">
          {COLORS.map((c) => (
            <button
              key={c.value}
              className={color === c.value ? "dot active" : "dot"}
              style={{ background: c.value }}
              title={c.label}
              onClick={() => changeColor(c.value)}
            />
          ))}
          <button
            className="btn"
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
          >
            Đổi sang °{unit === "C" ? "F" : "C"}
          </button>
        </div>
      </header>

      <div className="layout">
        <ul className="city-list">
          {CITIES.map((city) => (
            <li key={city.id}>
              <button
                className={city.id === selectedId ? "city selected" : "city"}
                onClick={() => setSelectedId(city.id)}
              >
                {city.name} {city.id === myCityId ? "★" : ""}
              </button>
            </li>
          ))}
        </ul>

        <div className="detail">{content}</div>
      </div>
    </div>
  );
}

export default App;