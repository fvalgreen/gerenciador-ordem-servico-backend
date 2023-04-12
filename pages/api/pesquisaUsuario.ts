import type { NextApiRequest, NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { ResponseDefault } from "@/types/ResponseDefault";
import { UsuarioModel } from "@/models/UsuarioModel";

const pesquisaUsuarioEndPoint = async (req: NextApiRequest, res: NextApiResponse<ResponseDefault | any[]>) => {
  try {
    if(req.method === 'GET'){
      if(req?.query?.id){
        const usuario = await UsuarioModel.findById(req.query.id);
        usuario.senha = null;

        if(!usuario){
          return res.status(400).json({erro: 'Usuário não encontrado'});
        };
        return res.status(200).json(usuario);

      }
      return res.status(400).json({erro: 'Não foi possível encontrar o usuário'})
    };
  } catch (e) {
    console.log(e);
    return res.status(500).json({erro: 'Não foi possível encontrar o usuário'});
  };

};

export default validarToken(connectMongoDB(pesquisaUsuarioEndPoint));