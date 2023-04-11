import type { NextApiRequest, NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { ResponseDefault } from "@/types/ResponseDefault";
import { ChamadosModel } from "@/models/ChamadosModel";
import { UsuarioModel } from "@/models/UsuarioModel";

const pesquisaEndPoint = async (req: NextApiRequest, res: NextApiResponse<ResponseDefault | any[]>) => {
  try {
    if(req.method === 'GET'){
      if(req?.query?.id){
        const {userId} = req.query;
        const usuarioLogado = await UsuarioModel.findById(req.query.id);
        usuarioLogado.senha = null;
        if(!usuarioLogado){
          return res.status(400).json({erro: 'Usuário não encontrado'})
        }

        const chamadosUsuario = await ChamadosModel.find({idSolicitante: usuarioLogado._id});

        return res.status(200).json(chamadosUsuario);
      }else{
        const chamados = await ChamadosModel.find();

        return res.status(200).json(chamados);
      }
    }
    return res.status(400).json({erro: 'Método HTTP inválido'})
  } catch (e) {
    console.log(e);  
    return res.status(500).json({erro: 'Não foi possível buscar os chamados'}) 
  };

};

export default validarToken(connectMongoDB(pesquisaEndPoint));