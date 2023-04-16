import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { validarToken } from "@/middlewares/validarToken";
import { UsuarioModel } from "@/models/UsuarioModel";
import { ResponseDefault } from "@/types/ResponseDefault";
import md5 from "md5";
import { NextApiRequest, NextApiResponse } from "next";


const editarusuario = async (req: NextApiRequest, res: NextApiResponse<ResponseDefault>) => {
  try {
    if(req.method === "PUT"){
      if(req?.query?.id){

        const usuario = await UsuarioModel.findById(req?.query?.id);

        if(!usuario){
          return res.status(400).json({erro: "Não foi possível encontrar o usuário"});
        };

        const {nome, email, senha, setor, nivelAcesso} = req.body;

        if(nome && nome.length > 3){
          usuario.nome = nome;
        };

        if(email && email.length > 5 && email.includes("@") && email.includes(".")){
          usuario.email = email;
        };

        if(senha && senha.length >= 6){
          usuario.senha = md5(senha);
        };

        if(setor && setor.length >= 3){
          usuario.setor = setor;
        };

        if(nivelAcesso){
          usuario.nivelAcesso = nivelAcesso;
        };

        await UsuarioModel.findByIdAndUpdate({_id: usuario._id}, usuario);

        return res.status(200).json({msg: "Usuário alterado com sucesso"});

      }else{
        const {userId} = req?.query;

        console.log(userId)

        const usuario = await UsuarioModel.findById(userId);

        if(!usuario){
          return res.status(400).json({erro: "Não foi possível encontrar o usuário"});
        };

        const {nome, email, senha, setor, nivelAcesso} = req.body;

        if(nome && nome.length > 3){
          usuario.nome = nome;
        };

        if(email && email.length > 5 && email.includes("@") && email.includes(".")){
          usuario.email = email;
        };

        if(senha && senha.length >= 6){
          usuario.senha = md5(senha);
        };

        if(setor && setor.length >= 3){
          usuario.setor = setor;
        };

        if(nivelAcesso){
          usuario.nivelAcesso = nivelAcesso;
        };

        await UsuarioModel.findByIdAndUpdate({_id: usuario._id}, usuario);

        return res.status(200).json({msg: "Usuário alterado com sucesso"});

      }
    }
    return res
  } catch (e) {
    console.log(e);
    return res.status(500).json({erro: "Não foi possível editar o usuário" + e});
  }
};

export default validarToken(connectMongoDB(editarusuario));