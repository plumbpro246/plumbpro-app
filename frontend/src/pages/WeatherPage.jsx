import { useState, useEffect } from "react";
import { API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cloud, Sun, CloudRain, Wind, Droplets, ThermometerSun,
  AlertTriangle, MapPin, Search, Loader2, Sunrise, Sunset,
  Snowflake, CloudLightning, Eye
} from "lucide-react";

const getWeatherIcon = (condition) => {
  const c = (condition || "").toLowerCase();
  if (c.includes("clear") || c.includes("sunny")) return Sun;
  if (c.includes("thunder")) return CloudLightning;
  if (c.includes("snow") || c.includes("hail")) return Snowflake;
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return CloudRain;
  if (c.includes("fog")) return Eye;
  if (c.includes("cloud") || c.includes("overcast")) return Cloud;
  return Sun;
};

const alertStyles = {
  freeze: { bg: "bg-blue-900/40 border-blue-500", icon: Snowflake, color: "text-blue-400" },
  heat: { bg: "bg-red-900/40 border-red-500", icon: ThermometerSun, color: "text-red-400" },
  wind: { bg: "bg-amber-900/40 border-amber-500", icon: Wind, color: "text-amber-400" },
  rain: { bg: "bg-cyan-900/40 border-cyan-500", icon: CloudRain, color: "text-cyan-400" },
};

export default function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [geoError, setGeoError] = useState(false);

  const fetchWeather = async (params) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/weather`, { params });
      setWeather(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  const loadByGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => { setGeoError(true); setLoading(false); },
      { timeout: 10000 }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;
    fetchWeather({ location: searchLocation.trim() });
  };

  useEffect(() => {
    loadByGeolocation();
  }, []);

  const cur = weather?.current;
  const WeatherIcon = cur ? getWeatherIcon(cur.condition) : Sun;

  return (
    <div className="space-y-6" data-testid="weather-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Job Site Weather</h1>
        <p className="text-muted-foreground text-sm">Real-time conditions & plumber safety alerts</p>
      </div>

      {/* Location Search */}
      <form onSubmit={handleSearch} className="flex gap-2" data-testid="weather-search-form">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Enter city or zip code..."
            className="pl-10 h-12"
            data-testid="weather-location-input"
          />
        </div>
        <Button type="submit" className="h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase px-6" disabled={loading} data-testid="weather-search-btn">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
        <Button type="button" variant="outline" className="h-12" onClick={loadByGeolocation} disabled={loading} data-testid="weather-gps-btn">
          <MapPin className="w-4 h-4" />
        </Button>
      </form>

      {geoError && !weather && (
        <p className="text-sm text-muted-foreground">Could not detect location. Search manually above.</p>
      )}

      {loading && !weather && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Loading weather...</p>
        </div>
      )}

      {weather && (
        <>
          {/* Plumber Safety Alerts */}
          {weather.alerts && weather.alerts.length > 0 && (
            <div className="space-y-2" data-testid="weather-alerts">
              {weather.alerts.map((alert, i) => {
                const style = alertStyles[alert.type] || alertStyles.rain;
                const AlertIcon = style.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-sm border ${style.bg}`}>
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.color}`} />
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current Conditions */}
          <Card className="bg-[#003366] text-white border-0 rounded-sm" data-testid="current-weather">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 text-sm text-slate-300">
                <MapPin className="w-4 h-4" />
                <span>{weather.location}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="text-center sm:text-left">
                  <WeatherIcon className="w-16 h-16 text-[#FF5F00] mx-auto sm:mx-0" />
                  <p className="text-sm text-slate-300 mt-1">{cur.condition}</p>
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-6xl font-bold tracking-tight">{Math.round(cur.temp)}°F</p>
                  <p className="text-slate-300 text-sm">Feels like {Math.round(cur.feels_like)}°F</p>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-200 sm:ml-auto">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <span>Humidity: {cur.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-slate-400" />
                    <span>Wind: {cur.wind_speed} mph</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-amber-400" />
                    <span>Gusts: {cur.wind_gusts} mph</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span>Precip: {cur.precipitation}" </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">7-Day Forecast</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7" data-testid="weather-forecast">
              {weather.forecast?.map((day, i) => {
                const DayIcon = getWeatherIcon(day.condition);
                const date = new Date(day.date + "T00:00:00");
                const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <Card key={i} className="border border-border rounded-sm text-center">
                    <CardContent className="p-4">
                      <p className="font-bold text-sm uppercase">{dayName}</p>
                      <p className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      <DayIcon className="w-8 h-8 mx-auto my-2 text-[#FF5F00]" />
                      <p className="text-xs text-muted-foreground">{day.condition}</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <span className="font-bold text-sm">{Math.round(day.high)}°</span>
                        <span className="text-muted-foreground text-sm">{Math.round(day.low)}°</span>
                      </div>
                      {day.precipitation > 0 && (
                        <p className="text-xs text-cyan-500 mt-1 flex items-center justify-center gap-1">
                          <CloudRain className="w-3 h-3" /> {day.precipitation}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
