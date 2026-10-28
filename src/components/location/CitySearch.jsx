import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { usePlaceSearch } from '../../hooks/usePlaceSearch.js';
import { MIN_QUERY_LENGTH } from '../../lib/location/geocoding.js';

// Results are already filtered and ranked by usePlaceSearch.
const keepAll = (options) => options;

/** Search every city in the world (online), with the built-in list as an instant offline fallback. */
export function CitySearch({ onSelect, autoFocus = false }) {
  const [input, setInput] = useState('');
  const { options, loading, error } = usePlaceSearch(input);
  const tooShort = input.trim().length < MIN_QUERY_LENGTH;

  return (
    <Box>
      <Autocomplete
        options={options}
        value={null}
        inputValue={input}
        onInputChange={(_event, value, reason) => {
          if (reason !== 'reset') setInput(value);
        }}
        onChange={(_event, location) => {
          if (location) onSelect(location);
        }}
        filterOptions={keepAll}
        getOptionLabel={(location) => `${location.name}, ${location.detail}`}
        getOptionKey={(location) => location.id}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        loading={loading && options.length === 0}
        loadingText="Searching cities worldwide…"
        noOptionsText={
          tooShort ? 'Type at least 2 letters' : 'No matching place. You can enter coordinates instead.'
        }
        autoHighlight
        blurOnSelect
        renderOption={(props, location) => {
          const { key, ...optionProps } = props;
          return (
            <Box
              component="li"
              key={key}
              {...optionProps}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start !important' }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {location.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {location.detail}
              </Typography>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search cities and towns"
            placeholder="Kannur, Lisbon, Nairobi…"
            autoFocus={autoFocus}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                startAdornment: (
                  <>
                    <SearchRounded fontSize="small" sx={{ color: 'text.secondary', ml: 0.5 }} aria-hidden />
                    {params.slotProps.input.startAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
      <Box role="status" aria-live="polite">
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
          {error ? (
            `${error} Showing built-in cities only.`
          ) : (
            <>
              Worldwide search by{' '}
              <Link href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" color="inherit">
                Open-Meteo
              </Link>{' '}
              with{' '}
              <Link href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" color="inherit">
                GeoNames
              </Link>{' '}
              data (
              <Link
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                CC BY 4.0
              </Link>
              ).
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
