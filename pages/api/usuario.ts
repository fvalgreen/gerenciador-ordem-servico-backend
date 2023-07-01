import type { NextApiRequest, NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { ResponseDefault } from "@/types/ResponseDefault";
import { UsuarioModel } from "@/models/UsuarioModel";
import { politicaCORS } from "@/middlewares/politicaCORS";
import md5 from "md5";

const pesquisaUsuarioEndPoint = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseDefault | any[]>
) => {
  try {
    const { userId, role } = req?.query;

    if (req.method === "GET") {
      if (role === "admin") {
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
            return res.status(400).json({
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
      } else {
        return res.status(403).json({ erro: "Usuário não possui autorização" });
      }
    } else if (req.method === "PUT") {
      if (req?.query?.id) {
        const usuario = await UsuarioModel.findById(req?.query?.id);

        if (!usuario) {
          return res
            .status(400)
            .json({ erro: "Não foi possível encontrar o usuário" });
        }

        const { nome, email, senha, setor, nivelAcesso } = req.body;

        if (nome && nome.length > 3) {
          usuario.nome = nome;
        }

        if (
          email &&
          email.length > 5 &&
          email.includes("@") &&
          email.includes(".")
        ) {
          usuario.email = email;
        }

        if (senha && senha.length >= 6) {
          usuario.senha = md5(senha);
        }

        if (setor && setor.length >= 3) {
          usuario.setor = setor;
        }

        if (nivelAcesso) {
          usuario.nivelAcesso = nivelAcesso;
        }

        await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

        return res.status(200).json({ msg: "Usuário alterado com sucesso" });
      } else {
        const { userId } = req?.query;

        console.log(userId);

        const usuario = await UsuarioModel.findById(userId);

        if (!usuario) {
          return res
            .status(400)
            .json({ erro: "Não foi possível encontrar o usuário" });
        }

        const { nome, email, senha, setor, nivelAcesso } = req.body;

        if (nome && nome.length > 3) {
          usuario.nome = nome;
        }

        if (
          email &&
          email.length > 5 &&
          email.includes("@") &&
          email.includes(".")
        ) {
          usuario.email = email;
        }

        if (senha && senha.length >= 6) {
          usuario.senha = md5(senha);
        }

        if (setor && setor.length >= 3) {
          usuario.setor = setor;
        }

        if (nivelAcesso) {
          usuario.nivelAcesso = nivelAcesso;
        }

        await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

        return res.status(200).json({ msg: "Usuário alterado com sucesso" });
      }
    } else {
      return res.status(405).json({ erro: "Método HTTP inmválido" });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ erro: "Não foi possível encontrar o usuário" });
  }
};

export default politicaCORS(
  validarToken(connectMongoDB(pesquisaUsuarioEndPoint))
);
