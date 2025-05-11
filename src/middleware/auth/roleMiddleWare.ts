import { Request, Response, NextFunction } from "express";
import { RoleRequest } from "@app/utils/types/userRoles"
import asyncHandler from "@app/middleware/asyncHandler/asyncHandler";
//ensure user has required roles 
export const roleGuard = (allowedRoles: string[]) =>
    asyncHandler<void, RoleRequest>(async (req:RoleRequest, res:Response, next:NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role_name)) {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }
        next();
    });



// Specific guards
export const adminGuard = roleGuard(["SuperAdmin"]);         // Full app control
export const managerGuard = roleGuard(["AdminManager"]); // Event creation & management
export const memberGuard = roleGuard(["NormalMember"]);   // member-only actions(READ and maybe WRITE (On his/her profile))

export const adminOrRecruiterGuard= roleGuard(["SuperAdmin", "NormalMember"]);  