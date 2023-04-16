import type { NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic";
import type { ResponseDefault } from "@/types/ResponseDefault";
import nc from "next-connect";
import { UsuarioModel } from "@/models/UsuarioModel";
import { ChamadosModel } from "@/models/ChamadosModel";
import { ChamadosPadrao } from "@/types/ChamadosPadrao";
import { politicaCORS } from "@/middlewares/politicaCORS";

const handler = nc()
  .use(upload.single("file"))
  .post(async (req: any, res: NextApiResponse<ResponseDefault>) => {
    try {
      const { userId } = req.query;

      const usuario = await UsuarioModel.findById(userId);

      if(!usuario){
        return res.status(400).json({erro: 'Usuário não encontrado'});
      };

      if(!req || !req.body){
        return res.status(400).json({erro: 'Parâmetros de entrada inválidos'});
      };
      
      const chamado = req.body as ChamadosPadrao;

      if(!chamado.titulo || chamado.titulo.length < 5){
        return res.status(400).json({erro: 'Título inválido'});
      };
      if(!chamado.descricao || chamado.descricao.length < 6){
        return res.status(400).json({erro: 'Descrição inválida'});
      }
      if(!chamado.local || chamado.local.length < 3){
        return res.status(400).json({erro: 'Local inválido'});
      }
      
      const imagem = await uploadImagemCosmic(req);
      

      const chamadoASerRegistrado = {
        ...chamado,
        dataAbertura: new Date(),
        foto: imagem?.media.url,
        solicitante: usuario.nome,
        idSolicitante: userId,
        emailSolicitante: usuario.email
      }

      usuario.chamadosAbertos++;
      await UsuarioModel.findByIdAndUpdate({_id: usuario._id}, usuario);

      await ChamadosModel.create(chamadoASerRegistrado);

      return res.status(200).json({erro: 'Chamado aberto com sucesso'})


      
    } catch (e) {
      console.log(e);
      return res.status(400).json({erro: 'Erro ao cadastrar o chamado'});
            
    }
  });

  export const config = {
    api: {
      bodyParser : false
    }
  };

  export default politicaCORS(validarToken(connectMongoDB(handler)));
