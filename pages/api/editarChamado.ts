import type { NextApiRequest, NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { ResponseDefault } from "@/types/ResponseDefault";
import { ChamadosModel } from "@/models/ChamadosModel";

const editarChamado = (req: NextApiRequest, res: NextApiResponse<ResponseDefault>) => {
  try {
    
  } catch (e) {
    console.log(e);
    return res.status(500).json({erro: 'Não foi possível alterar o chamado'})
    
  }
}