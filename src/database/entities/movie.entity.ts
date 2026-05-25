import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from './base.entity';
import { User } from './user.entity';
import { Admin } from './admin.entity';

export enum MovieStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

export enum MovieGenre {
  ACTION = 'action',
  COMEDY = 'comedy',
  DRAMA = 'drama',
  HORROR = 'horror',
  ROMANCE = 'romance',
  THRILLER = 'thriller',
  DOCUMENTARY = 'documentary',
  ANIMATION = 'animation',
}

@Entity('movies')
export class Movie extends AbstractEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  price: number;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ type: 'int', default: 0 })
  duration: number; // in minutes

  @Column({
    type: 'enum',
    enum: MovieGenre,
    nullable: true,
  })
  genre: MovieGenre;

  @Column({
    type: 'enum',
    enum: MovieStatus,
    default: MovieStatus.DRAFT,
  })
  status: MovieStatus;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  purchases: number;

  @Column({ nullable: true })
  release_date: Date;

  // Author who uploaded the movie (nullable because admin can also upload)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  // Admin who uploaded the movie (nullable because author can also upload)
  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  toPayload(): Partial<Movie> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      price: this.price,
      thumbnail_url: this.thumbnail_url,
      video_url: this.video_url,
      duration: this.duration,
      genre: this.genre,
      status: this.status,
      views: this.views,
      purchases: this.purchases,
      author: this.author,
      admin: this.admin,
      created_at: this.created_at,
    };
  }
}
