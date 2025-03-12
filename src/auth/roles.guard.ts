import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>(
            "roles",
            context.getHandler()
        );

        console.log("Roles required for this route:", roles);

        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            console.log("User not authenticated");
            return false;
        }

        console.log("User in RolesGuard:", user);

        return roles.includes(user.role);
    }
}
