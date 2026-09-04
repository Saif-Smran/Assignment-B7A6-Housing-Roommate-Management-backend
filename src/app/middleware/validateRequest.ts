import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { catchAsync } from "../utils/catchAsync.js";

export const validateRequest = (schema: ZodTypeAny) => {
	return catchAsync(
		async (req: Request, _res: Response, next: NextFunction) => {
			const parsed = (await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
				cookies: req.cookies,
			})) as Record<string, unknown>;

			if (parsed.body) {
				req.body = parsed.body as Record<string, unknown>;
			}

			next();
		},
	);
};
