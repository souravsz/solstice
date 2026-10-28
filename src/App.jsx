import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { AppFooter } from './components/AppFooter.jsx';
import { AppHeader } from './components/AppHeader.jsx';
import { DateNav } from './components/DateNav.jsx';
import { DayTimeline } from './components/DayTimeline.jsx';
import { EmptyState } from './components/EmptyState.jsx';
import { SkyPanel } from './components/SkyPanel.jsx';
import { SunArc } from './components/SunArc.jsx';
import { SunCard } from './components/SunCard.jsx';
import { LocationPicker } from './components/location/LocationPicker.jsx';
import { useLocation } from './hooks/useLocation.js';
import { useNow } from './hooks/useNow.js';
import { useSunDay } from './hooks/useSunDay.js';
import { useSunNow } from './hooks/useSunNow.js';
import { CARD, findHighlights } from './lib/summary/cards.js';
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
  const highlights = useMemo(() => (day ? findHighlights(day.cards, isToday ? now : null) : null), [day, isToday, now]);

  const statusFor = (id) => {
    if (!highlights) return null;
    if (highlights.nextId === id) return 'next';
    return highlights.activeIds.has(id) ? 'now' : null;
  };

  const eventCards = day?.cards.filter((c) => c.id !== CARD.DAY_LENGTH) ?? [];
  const dayLengthCard = day?.cards.find((c) => c.id === CARD.DAY_LENGTH);

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
                <DateNav
                  civilDate={civilDate}
                  today={today}
                  timeZone={location.timeZone}
                  onChange={setSelectedDate}
                />
              </Box>

              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={12}>
                  <SunArc day={day} location={location} now={now} isToday={isToday} />
                </Grid>
                {eventCards.map((card) => (
                  <Grid key={card.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <SunCard card={card} day={day} status={statusFor(card.id)} />
                  </Grid>
                ))}
                <Grid size={{ xs: 12, md: 4 }}>
                  <SunCard card={dayLengthCard} day={day} status={null} />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <DayTimeline day={day} now={now} isToday={isToday} />
                </Grid>
              </Grid>
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
