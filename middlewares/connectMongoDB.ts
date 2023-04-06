import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import mongoose from "mongoose";
import type { ResponseDefault } from "@/types/ResponseDefault";

export const connectMongoDB =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse<ResponseDefault>) => {
    if(mongoose.connections[0].readyState){
      return handler(req, res);
    };
    const {CONNECT_DB_STRING} = process.env;

    if(!CONNECT_DB_STRING){
      return res.status(500).json({erro: 'ENV de configuração do banco de dados não informada'});
    };

    mongoose.connection.on('connected', () => console.log('Banco de dados conectado'));
    mongoose.connection.on('error', error => console.log('Ocorreu um erro ao conectar no banco de dados'));

    await mongoose.connect(CONNECT_DB_STRING);


    return handler(req, res);
  };
