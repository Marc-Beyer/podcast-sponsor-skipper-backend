import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { UserRole } from "../../enums/UserRole.js";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    token!: string;

    @Column({
        type: "int",
        enum: UserRole,
        default: UserRole.DEFAULT,
    })
    role!: UserRole;
}
