import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { ResponseDefault } from "@/types/ResponseDefault";
import jwt, { JwtPayload } from "jsonwebtoken";

export const validarToken =
  (handler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse<ResponseDefault>) => {
    try {
      const { JWT_KEY } = process.env;

      if (!JWT_KEY) {
        return res
          .status(500)
          .json({ erro: "ENV da chave JWT não foi informada" });
      }

      if (!req || !req.headers) {
        return res
          .status(401)
          .json({ erro: "Não foi possível validar o token de acesso" });
      }

      if (req.method !== "OPTIONS") {
        const authorization = req.headers["authorization"];

        if (!authorization) {
          return res
            .status(401)
            .json({ erro: "Não foi possível validar o token de acesso" });
        }
        const token = authorization.substring(7);

        if (!token) {
          return res
            .status(401)
            .json({ erro: "Não foi possível validar o token de acesso" });
        }
        const decoded = jwt.verify(token, JWT_KEY) as JwtPayload;

        if (!decoded) {
          return res
            .status(401)
            .json({ erro: "Não foi possível validar o token de acesso" });
        }

        if (!req.query) {
          req.query = {};
        }

        req.query.userId = decoded.id;
        req.query.role = decoded.role;
      }
    } catch (e) {
      console.log(e);
      return res
        .status(401)
        .json({ erro: "Não foi possível validar o token de acesso" });
    }

    return handler(req, res);
  };
