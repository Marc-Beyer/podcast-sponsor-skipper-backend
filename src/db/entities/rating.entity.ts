import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity.js";
import { SponsorSection } from "./sponsorSection.entity.js";

@Entity()
export class Rating {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    isPositive!: boolean;

    @ManyToOne(() => SponsorSection, { onDelete: "CASCADE" })
    sponsorSection!: SponsorSection;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    submittedBy!: User;
}
