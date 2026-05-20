import React from 'react';
import CrudPage from '../components/CrudPage';
import { weatherForecastsApi } from '../services/api';

export default function WeatherForecastsPage() {
  return (
    <CrudPage
      title="Weather Forecasts"
      subtitle="Site-level wind / irradiance / temperature."
      api={weatherForecastsApi}
      fields={[
        { key: 'forecast_id',    label: 'Forecast ID' },
        { key: 'site',           label: 'Site' },
        { key: 'valid_at',       label: 'Valid At',       type: 'datetime-local' },
        { key: 'wind_mps',       label: 'Wind (m/s)',     type: 'number' },
        { key: 'irradiance_wm2', label: 'Irradiance (W/m2)', type: 'number' },
        { key: 'temperature_c',  label: 'Temp (C)',       type: 'number' },
      ]}
    />
  );
}
