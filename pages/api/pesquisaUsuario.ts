import type { NextApiRequest, NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { ResponseDefault } from "@/types/ResponseDefault";
import { UsuarioModel } from "@/models/UsuarioModel";
import { politicaCORS } from "@/middlewares/politicaCORS";

const pesquisaUsuarioEndPoint = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseDefault | any[]>
) => {
  try {
    if (req.method === "GET") {
      if (req?.query?.id) {
        const usuario = await UsuarioModel.findById(req.query.id);
        usuario.senha = null;

        if (!usuario) {
          return res.status(400).json({ erro: "Usuário não encontrado" });
        }
        return res.status(200).json(usuario);
      } else {
        const { filtro } = req.query;

        if (!filtro || filtro.length < 2) {
          return res
            .status(400)
            .json({
              erro: "Favor informar pelo menos 2 caracteres para a busca",
            });
        }

        const usuarios = await UsuarioModel.find({
          $or: [
            { nome: { $regex: filtro, $options: "i" } },
            { email: { $regex: filtro, $options: "i" } },
            { setor: { $regex: filtro, $options: "i" } },
          ],
        });

        usuarios.forEach((user) => {
          user.senha = null;
        });

        return res.status(200).json(usuarios);
      }
    }
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ erro: "Não foi possível encontrar o usuário" });
  }
};

export default politicaCORS(validarToken(connectMongoDB(pesquisaUsuarioEndPoint)));
