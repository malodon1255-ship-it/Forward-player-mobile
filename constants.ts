import { MediaItem } from './types';

export const MEDIA_LIBRARY: MediaItem[] = [
  {
    id: '1',
    title: 'Interstellar',
    year: '2014',
    rating: 'PG-13',
    duration: '2h 49m',
    description: 'When Earth becomes uninhabitable, a team of ex-pilots and scientists is tasked with finding a new home for humanity by traveling through a wormhole.',
    poster: 'https://picsum.photos/seed/interstellar/400/600',
    backdrop: 'https://picsum.photos/seed/interstellar_bg/1200/800',
    category: 'Sci-Fi',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    format: 'MKV • 4K • HDR10',
    progress: 45,
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', image: 'https://picsum.photos/seed/matthew/100/100' },
      { name: 'Anne Hathaway', role: 'Brand', image: 'https://picsum.photos/seed/anne/100/100' },
      { name: 'Jessica Chastain', role: 'Murph', image: 'https://picsum.photos/seed/jessica/100/100' }
    ]
  },
  {
    id: '2',
    title: 'Dune: Part Two',
    year: '2024',
    rating: 'PG-13',
    duration: '2h 46m',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster: 'https://picsum.photos/seed/dune/400/600',
    backdrop: 'https://picsum.photos/seed/dune_bg/1200/800',
    format: 'MKV • DOLBY VISION • ATMOS',
    category: 'Epic Fantasy',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    progress: 12,
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', image: 'https://picsum.photos/seed/tim/100/100' },
      { name: 'Zendaya', role: 'Chani', image: 'https://picsum.photos/seed/zen/100/100' },
      { name: 'Austin Butler', role: 'Feyd-Rautha', image: 'https://picsum.photos/seed/austin/100/100' }
    ]
  },
  {
    id: '3',
    title: 'The Dark Knight',
    year: '2008',
    rating: 'PG-13',
    duration: '2h 32m',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster: 'https://picsum.photos/seed/batman/400/600',
    backdrop: 'https://picsum.photos/seed/batman_bg/1200/800',
    format: 'MKV • 10-BIT • 4K',
    category: 'Action',
    genres: ['Action', 'Crime', 'Drama'],
    progress: 80,
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne', image: 'https://picsum.photos/seed/bale/100/100' },
      { name: 'Heath Ledger', role: 'Joker', image: 'https://picsum.photos/seed/heath/100/100' },
      { name: 'Gary Oldman', role: 'James Gordon', image: 'https://picsum.photos/seed/gary/100/100' }
    ]
  },
  {
    id: '4',
    title: 'Oppenheimer',
    year: '2023',
    rating: 'R',
    duration: '3h 0m',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    poster: 'https://picsum.photos/seed/oppenheimer/400/600',
    backdrop: 'https://picsum.photos/seed/opp_bg/1200/800',
    format: 'MKV • IMAX • HDR',
    category: 'Drama',
    genres: ['Biography', 'Drama', 'History'],
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', image: 'https://picsum.photos/seed/cillian/100/100' },
      { name: 'Emily Blunt', role: 'Kitty Oppenheimer', image: 'https://picsum.photos/seed/emily/100/100' },
      { name: 'Matt Damon', role: 'Leslie Groves', image: 'https://picsum.photos/seed/matt/100/100' }
    ]
  },
  {
    id: '5',
    title: 'Succession',
    year: '2018',
    rating: 'TV-MA',
    duration: '4 Seasons',
    description: 'The Roy family is known for controlling the biggest media and entertainment company in the world.',
    poster: 'https://picsum.photos/seed/succession/400/600',
    backdrop: 'https://picsum.photos/seed/succ_bg/1200/800',
    format: 'MKV • 4K • 5.1',
    category: 'Drama',
    genres: ['Drama'],
    isTVShow: true,
    season: 4,
    episode: 10,
    progress: 10,
    cast: [
      { name: 'Brian Cox', role: 'Logan Roy', image: 'https://picsum.photos/seed/brian/100/100' },
      { name: 'Jeremy Strong', role: 'Kendall Roy', image: 'https://picsum.photos/seed/jeremy/100/100' },
      { name: 'Sarah Snook', role: 'Shiv Roy', image: 'https://picsum.photos/seed/sarah/100/100' }
    ]
  },
  {
    id: '6',
    title: 'The Bear',
    year: '2022',
    rating: 'TV-MA',
    duration: '2 Seasons',
    description: 'A young chef from the fine dining world returns to Chicago to run his family\'s sandwich shop.',
    poster: 'https://picsum.photos/seed/thebear/400/600',
    backdrop: 'https://picsum.photos/seed/bear_bg/1200/800',
    format: 'MKV • HD • STEREO',
    category: 'Comedy',
    genres: ['Drama', 'Comedy'],
    isTVShow: true,
    season: 2,
    episode: 3,
    progress: 65,
    cast: [
      { name: 'Jeremy Allen White', role: 'Carmy', image: 'https://picsum.photos/seed/carmy/100/100' },
      { name: 'Ebon Moss-Bachrach', role: 'Richie', image: 'https://picsum.photos/seed/ebon/100/100' },
      { name: 'Ayo Edebiri', role: 'Sydney', image: 'https://picsum.photos/seed/ayo/100/100' }
    ]
  }
];

export const CATEGORIES = ['Featured', 'Continue Watching', 'Just Added', 'Trending Now', 'Awards Winners'];