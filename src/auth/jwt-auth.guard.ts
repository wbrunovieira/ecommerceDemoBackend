import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class JwtAuthGuard extends AuthGuard("jwt") {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        console.log("JwtAuthGuard - Request Headers:", request.headers);

        const result = (await super.canActivate(context)) as
            | boolean
            | Promise<boolean>;
        console.log("JwtAuthGuard - Result:", result);

        return result;
    }
}
