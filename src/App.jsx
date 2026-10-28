import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { AppFooter } from './components/AppFooter.jsx';
import { AppHeader } from './components/AppHeader.jsx';
import { EmptyState } from './components/EmptyState.jsx';
import { SkyPanel } from './components/SkyPanel.jsx';
import { SunArc } from './components/SunArc.jsx';
import { LocationPicker } from './components/location/LocationPicker.jsx';
import { DateHeader } from './components/sun-times/DateHeader.jsx';
import { SunTimesCard } from './components/sun-times/SunTimesCard.jsx';
import { useLocation } from './hooks/useLocation.js';
import { useNow } from './hooks/useNow.js';
import { useSunDay } from './hooks/useSunDay.js';
import { useSunNow } from './hooks/useSunNow.js';
import { findHighlights, summaryItems } from './lib/summary/cards.js';
import { civilDateOf } from './lib/time/zoned.js';

const CONTENT_WIDTH = 1100;

export default function App() {
  const { location, chooseLocation, chooseCoordinates, locate, geoStatus, clearGeoStatus } = useLocation();
  // First launch: open the picker straight away.
  const [pickerOpen, setPickerOpen] = useState(() => location === null);
  // null means "today", so the view rolls over at midnight on its own.
  const [selectedDate, setSelectedDate] = useState(null);
  const now = useNow();

  const today = location ? civilDateOf(now, location.timeZone) : null;
  const civilDate = selectedDate ?? today;
  const isToday = civilDate === today;

  const day = useSunDay(location, civilDate, isToday);
  const sun = useSunNow(location, now);
  const highlights = useMemo(
    () => (day ? findHighlights(summaryItems(day.summary), isToday ? now : null) : null),
    [day, isToday, now],
  );

  const statusFor = (id) => {
    if (!highlights) return null;
    if (highlights.nextId === id) return 'next';
    return highlights.activeIds.has(id) ? 'now' : null;
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          // border-box, so the 1100px content width plus side padding never exceeds the screen.
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: { xs: CONTENT_WIDTH + 32, sm: CONTENT_WIDTH + 48, md: CONTENT_WIDTH + 64 },
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppHeader location={location} onOpenPicker={() => setPickerOpen(true)} />

        <Box component="main" sx={{ flex: 1 }}>
          {location && day && sun ? (
            <>
              <SkyPanel now={now} sun={sun} location={location} />

              <Box sx={{ mt: { xs: 5, md: 7 }, mb: { xs: 2.5, md: 3 } }}>
                <DateHeader
                  civilDate={civilDate}
                  today={today}
                  timeZone={location.timeZone}
                  onChange={setSelectedDate}
                />
              </Box>

              <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 } }}>
                <SunTimesCard day={day} now={now} isToday={isToday} statusFor={statusFor} />
                <SunArc day={day} location={location} now={now} isToday={isToday} />
              </Box>
            </>
          ) : (
            <EmptyState onChooseLocation={() => setPickerOpen(true)} />
          )}
        </Box>

        <AppFooter location={location} />
      </Box>

      <LocationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onExited={clearGeoStatus}
        location={location}
        geoStatus={geoStatus}
        onChooseLocation={chooseLocation}
        onChooseCoordinates={chooseCoordinates}
        onLocate={locate}
      />
    </Box>
  );
}
