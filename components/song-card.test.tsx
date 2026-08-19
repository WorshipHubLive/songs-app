import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Song } from '@/db/schema';
import { SongCard } from './song-card';

jest.mock('@/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    background: '#000',
    foreground: '#fff',
    card: '#111',
    mutedForeground: '#888',
    primary: '#0f0',
    primaryForeground: '#000',
    secondary: '#00f',
    secondaryForeground: '#fff',
    accent: '#f00',
    destructive: '#f00',
    border: '#333',
  }),
}));

const baseSong: Song = {
  id: 1,
  title: 'Amazing Grace',
  artist: 'John Newton',
  lyrics: '',
  chords: '',
  language: 'en',
  inService: false,
  serviceOrder: 0,
  createdAt: '',
};

// @testing-library/react-native v14's render()/fireEvent() are async
// (they wrap in `act` internally to flush React 19's concurrent work) —
// every call here needs an `await`, unlike the sync v12-era API.
describe('SongCard', () => {
  it('renders the title and artist', async () => {
    await render(<SongCard song={baseSong} />);
    expect(screen.getByText('Amazing Grace')).toBeTruthy();
    expect(screen.getByText('John Newton')).toBeTruthy();
  });

  it('calls onPress when the title area is tapped, in non-selectable mode', async () => {
    const onPress = jest.fn();
    await render(<SongCard song={baseSong} onPress={onPress} />);
    await fireEvent.press(screen.getByText('Amazing Grace'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleService when the service button is tapped', async () => {
    const onToggleService = jest.fn();
    await render(<SongCard song={baseSong} onToggleService={onToggleService} />);
    await fireEvent.press(screen.getByTestId('song-card-toggle-service'));
    expect(onToggleService).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleSelect instead of onPress when selectable', async () => {
    const onPress = jest.fn();
    const onToggleSelect = jest.fn();
    await render(<SongCard song={baseSong} onPress={onPress} selectable onToggleSelect={onToggleSelect} />);
    await fireEvent.press(screen.getByText('Amazing Grace'));
    expect(onToggleSelect).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });
});
