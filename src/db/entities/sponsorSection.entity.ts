import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity.js";
import { Duration } from "./duration.entity.js";

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

    @Column("float", { default: 0 })
    rating!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    submittedBy!: User;

    @ManyToOne(() => Duration, { onDelete: "CASCADE" })
    duration!: Duration;
}
