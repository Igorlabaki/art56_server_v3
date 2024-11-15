import { NextFunction, Request, Response } from "express";
import {verify} from "jsonwebtoken"

export function ensureAutheticate(req: Request,resp: Response,next: NextFunction){
    const authToken = req.headers.authorization

    if(!authToken){
        return resp.status(401).json({
            message: "Token is missing"
        })
    }

    const [, token]  = authToken.split(' ')

    try {
        verify(token, process.env.JWT_SECRET_KEY!)
        return next();
    } catch (error) {
        return resp.status(401).json({
            message: "Token invalid"
        })
    }

}