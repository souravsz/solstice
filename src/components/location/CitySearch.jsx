import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { CITIES } from '../../data/cities.js';
import { searchCities } from '../../lib/location/search.js';

const filterOptions = (options, { inputValue }) => searchCities(options, inputValue, 60);

/** Offline, searchable list of built-in cities. */
export function CitySearch({ onSelect, autoFocus = false }) {
  return (
    <Autocomplete
      options={CITIES}
      value={null}
      onChange={(_event, city) => {
        if (city) onSelect(city);
      }}
      filterOptions={filterOptions}
      getOptionLabel={(city) => `${city.name}, ${city.country}`}
      getOptionKey={(city) => city.id}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      autoHighlight
      blurOnSelect
      noOptionsText="No matching city. You can enter coordinates instead."
      renderOption={(props, city) => {
        const { key, ...optionProps } = props;
        return (
          <Box component="li" key={key} {...optionProps} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start !important' }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {city.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {city.country}
            </Typography>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search cities"
          placeholder="Lisbon, Tokyo, Nairobi…"
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
  );
}
