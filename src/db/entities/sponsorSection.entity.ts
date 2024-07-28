import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity.js";

@Entity()
export class SponsorSection {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    episodeUrl!: string;

    @Column()
    podcastUrl!: string;

    @Column()
    startPosition!: number;

    @Column()
    endPosition!: number;

    @Column({ default: 0 })
    upVotes!: number;

    @Column({ default: 0 })
    downVotes!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    submittedBy!: User;
}
