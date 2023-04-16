import type { NextApiRequest, NextApiResponse } from "next";
import md5 from "md5";
import type { ResponseDefault } from "@/types/ResponseDefault";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { UsuarioModel } from "@/models/UsuarioModel";
import nc from "next-connect";
import { CadastroRequisicao } from "@/types/CadastroRequisicao";
import { politicaCORS } from "@/middlewares/politicaCORS";

const handler = nc().post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const usuario = req.body as CadastroRequisicao;

    if (!usuario.nome || usuario.nome.length < 2) {
      return res.status(400).json({ erro: "Nome inválido" });
    };
    if (
      !usuario.email ||
      usuario.email.length < 5 ||
      !usuario.email.includes("@") ||
      !usuario.email.includes(".")
    ) {
      return res.status(400).json({erro: 'Email inválido'});
    };
    if(!usuario.senha || usuario.senha.length < 6){
      return res.status(400).json({erro: 'Senha inválida'});
    };
    if(!usuario.setor || usuario.setor.length < 3){
      return res.status(400).json({erro: 'Setor inválido'});
    };

    const usuarioComMesmoEmail = await UsuarioModel.find({
      email: usuario.email,
    });
    if(usuarioComMesmoEmail && usuarioComMesmoEmail.length > 0){
      return res.status(400).json({erro: 'Já existe usuário cadastrado com esse email'});
    };

    const usuarioASerSalvo = {
      nome: usuario.nome,
      email: usuario.email,
      senha: md5(usuario.senha),
      setor: usuario.setor,
    };

    await UsuarioModel.create(usuarioASerSalvo);
    return res.status(200).json({msg: 'Usuário cadastrado com sucesso.'})

  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: "Erro ao cadastrar o usuário" });
  }
});

export default politicaCORS(connectMongoDB(handler));
