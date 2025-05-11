import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "@app/db/db";
import { UserRequest } from "@app/utils/types/userTypes";
import asyncHandler from "@app/middleware/asyncHandler/asyncHandler";

// Middleware to protect routes
export const protect = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
    let token;

    // Get token from Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Get token from cookies
    if (!token && req.cookies?.access_token) {
        token = req.cookies.access_token;
    }

    //console.log("🔍 Token Received:", token); // Debugging

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number; roleId: number };

        console.log("Decoded User:", decoded.userId);

        const userQuery = await pool.query(
            `SELECT 
                a.id AS id, 
                a.username, 
                a.email, 
                a.role_id, 
                ur.role_name
             FROM auth a
             JOIN userroles ur ON a.role_id = ur.id
             WHERE a.id = $1`,
            [decoded.userId]
        );

        if (userQuery.rows.length === 0) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        req.user = userQuery.rows[0];

        next();
    } catch (error) {
        console.error("❌ JWT Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
        return;
    }
});
