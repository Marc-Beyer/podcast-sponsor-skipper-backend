import { Entity, Column, ManyToMany, JoinTable, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity.js";

@Entity()
export class Podcast {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    url!: string;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    link!: string;

    @Column()
    language!: string;

    @Column()
    imageUrl!: string;

    @Column()
    explicit!: boolean;

    @Column()
    locked!: boolean;

    @Column()
    complete!: boolean;

    @Column()
    lastUpdate!: Date;

    @Column()
    nrOdEpisodes!: number;

    @Column({ nullable: true })
    copyright?: string;

    @Column({ nullable: true })
    author?: string;

    @Column({ nullable: true })
    fundingText?: string;

    @Column({ nullable: true })
    fundingUrl?: string;

    @Column({ default: 0 })
    ranking!: number;

    @ManyToMany(() => Category, (category) => category.podcasts, { cascade: true })
    @JoinTable()
    categories!: Category[];
}
