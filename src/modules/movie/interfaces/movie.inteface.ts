export interface IMovieResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  genre: string;
  status: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  author: string;
  release_date: Date;
  created_at: Date;
}
