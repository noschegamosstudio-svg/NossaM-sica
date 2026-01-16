
export interface Music {
  id: string;
  title: string;
  artist: string;
  genre: string;
  price: number; // In AOA
  coverUrl: string;
  audioUrl: string;
  bpm: number;
  key: string;
}

export interface Purchase {
  id: string;
  musicId: string;
  date: string;
  amount: number;
  reference: string;
  buyerName: string;
  status: 'pending' | 'completed';
}

export interface User {
  name: string;
  email: string;
}
