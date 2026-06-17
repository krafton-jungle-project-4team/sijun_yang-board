import { Controller, Get } from "@nestjs/common";

/**
 * runtime probe를 위한 가벼운 health endpoint를 노출한다.
 *
 * authentication이나 database access가 필요 없는 단순 availability check에 사용한다.
 * infrastructure probe가 부하를 만들지 않도록 response는 저렴하고 결정적으로 유지한다.
 */
@Controller("health")
export class HealthController {
    @Get()
    getHealth() {
        return {
            ok: true
        };
    }
}
