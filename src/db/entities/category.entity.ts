import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Podcast } from "./podcast.entity.js";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @ManyToMany(() => Podcast, (podcast) => podcast.categories)
    podcasts!: Podcast[];
}
