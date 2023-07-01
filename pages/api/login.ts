import { NextApiRequest, NextApiResponse } from "next";
import md5 from "md5";
import jwt from "jsonwebtoken";
import type { ResponseDefault } from "@/types/ResponseDefault";
import { UsuarioModel } from "@/models/UsuarioModel";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { politicaCORS } from "@/middlewares/politicaCORS";

const endPointLogin = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseDefault | any>
) => {
  const { JWT_KEY } = process.env;
  if (!JWT_KEY) {
    return res.status(500).json({ erro: "ENV JWT não informada" });
  }

  if (req.method === "POST") {
    const { login, senha } = req.body;
    const usuariosEncontrados = await UsuarioModel.find({
      email: login,
      senha: md5(senha),
    });
    if (usuariosEncontrados && usuariosEncontrados.length > 0) {
      const usuarioEncontrado = usuariosEncontrados[0];
      const token = jwt.sign(
        { id: usuarioEncontrado._id, role: usuarioEncontrado.nivelAcesso },
        JWT_KEY
      );

      return res.status(200).json({
        id: usuarioEncontrado._id,
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        nivelAcesso: usuarioEncontrado.nivelAcesso,
        token,
      });
    }
    return res.status(405).json({ erro: "Usuário ou senha não encontrado" });
  }
  return res.status(405).json({ erro: "Método informado não é válido" });
};

export default politicaCORS(connectMongoDB(endPointLogin));
