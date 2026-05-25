import { TransactionStatus } from 'src/modules/wallet/enum/wallet.enum';

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

export interface IValidateMovieResponse {
  status: TransactionStatus;
  message: string;
  clientResponse?: IMovieValidationResponse;
}

export interface IMovieValidationResponse {
  movie_id: string;
  created_at: Date;
  status: TransactionStatus;
  transaction_id: string;
  customer_name: string;
}

export interface IBuyMovieResponse {
  message: string;
  status: TransactionStatus;
  payload: IBuyMovieResponsePayload;
}

export interface IBuyMovieResponsePayload {
  amount: number;
  movie_id: string;
  created_at: string;
  transaction_id: string;
  status: TransactionStatus;
}
