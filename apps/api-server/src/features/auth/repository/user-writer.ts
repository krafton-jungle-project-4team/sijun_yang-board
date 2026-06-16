import type { SignupInput, UpdateMeInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { createUser, updateMe } from "../database/__generated__/auth.queries";

type CreateUserInput = Pick<SignupInput, "displayName" | "email" | "loginId"> & {
    passwordHash: string;
};

@Injectable()
export class UserWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async updateMe(userId: number, input: UpdateMeInput): Promise<number | null> {
        const user = await this.db.query(updateMe, { userId, displayName: input.displayName ?? null }).singleOrNull();

        return user?.id ?? null;
    }

    async create(input: CreateUserInput): Promise<number> {
        const user = await this.db.query(createUser, input).single();

        return user.id;
    }
}
