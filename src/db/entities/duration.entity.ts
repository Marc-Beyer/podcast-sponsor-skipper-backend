import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Duration {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    episodeUrl!: string;

    @Column()
    value!: number;

    @Column({ default: false })
    hasPreRollAds!: boolean;

    @Column({ default: false })
    hasPostRollAds!: boolean;

    @Column({ default: 1 })
    occurrences!: number;
}
