import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";

/**
 * health endpoint를 독립된 feature module로 등록한다.
 *
 * probe route를 business feature와 분리하기 위해 root app module에서 사용한다.
 * 관련 없는 application concern 때문에 health check가 실패하지 않도록 의존성을 추가하지 않는다.
 */
@Module({
    controllers: [HealthController]
})
export class HealthModule {}
