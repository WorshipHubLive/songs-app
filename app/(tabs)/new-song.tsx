import { Redirect } from 'expo-router';

// Bridges the "new-song" native tab trigger (role="search", styled/docked
// to the side like a search tab) straight into the real full-screen song
// editor, which lives outside the tab navigator as a focused screen.
export default function NewSongTabBridge() {
  return <Redirect href="/song/new" />;
}
