export type MockSong = {
  id: number;
  title: string;
  artist: string;
  snippet: string;
  languages: number;
  inService: boolean;
};

export const mockSongs: MockSong[] = [
  {
    id: 0,
    title: 'Océanos (Donde Mis Pies Pueden Fallar)',
    artist: 'Hillsong United',
    snippet: 'Tú me llamas sobre las aguas\nAdonde mis pies pueden fallar...',
    languages: 3,
    inService: true,
  },
  {
    id: 1,
    title: 'Way Maker',
    artist: 'Sinach',
    snippet: 'You are here, moving in our midst\nI worship You, I worship You...',
    languages: 2,
    inService: true,
  },
  {
    id: 2,
    title: 'Gracia Sublime',
    artist: 'Trad. arr. WorshipHub',
    snippet: 'Sublime gracia del Señor\nque a mí, pecador, salvó...',
    languages: 1,
    inService: false,
  },
  {
    id: 3,
    title: 'Goodness of God',
    artist: 'Bethel Music',
    snippet: "I love You, Lord\nOh, Your mercy never fails me...",
    languages: 4,
    inService: false,
  },
  {
    id: 4,
    title: 'Digno Es',
    artist: 'Miel San Marcos',
    snippet: 'Digno es, digno es\nEl Cordero que fue inmolado...',
    languages: 1,
    inService: false,
  },
  {
    id: 5,
    title: 'Reckless Love',
    artist: 'Cory Asbury',
    snippet: 'Before I spoke a word, You were singing over me...',
    languages: 2,
    inService: true,
  },
];
