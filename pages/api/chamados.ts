import type { NextApiRequest, NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic";
import type { ResponseDefault } from "@/types/ResponseDefault";
import nc from "next-connect";
import { UsuarioModel } from "@/models/UsuarioModel";
import { ChamadosModel } from "@/models/ChamadosModel";
import { ChamadosPadrao } from "@/types/ChamadosPadrao";
import { politicaCORS } from "@/middlewares/politicaCORS";
import { EditarChamadoPadrao } from "@/types/EditarChamadoPadrao";

const handler = nc()
  .use(upload.single("file"))
  .post(async (req: any, res: NextApiResponse<ResponseDefault>) => {
    try {
      const { userId } = req.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      if (!req || !req.body) {
        return res
          .status(400)
          .json({ erro: "Parâmetros de entrada inválidos" });
      }

      const chamado = req.body as ChamadosPadrao;

      if (!chamado.titulo || chamado.titulo.length < 5) {
        return res.status(400).json({ erro: "Título inválido" });
      }
      if (!chamado.descricao || chamado.descricao.length < 6) {
        return res.status(400).json({ erro: "Descrição inválida" });
      }
      if (!chamado.local || chamado.local.length < 3) {
        return res.status(400).json({ erro: "Local inválido" });
      }

      const imagem = await uploadImagemCosmic(req);

      const chamadoASerRegistrado = {
        ...chamado,
        dataAbertura: new Date(),
        foto: imagem?.media.url,
        solicitante: usuario.nome,
        idSolicitante: userId,
        emailSolicitante: usuario.email,
        setorSolicitante: usuario.setor
      };

      usuario.chamadosAbertos++;
      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

      await ChamadosModel.create(chamadoASerRegistrado);

      return res.status(200).json({ erro: "Chamado aberto com sucesso" });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: "Erro ao cadastrar o chamado" });
    }
  })
  .get(
    async (
      req: NextApiRequest,
      res: NextApiResponse<ResponseDefault | any[]>
    ) => {
      try {
        const { userId, role } = req.query;

        if(role !== "admin"){
          const usuario = await UsuarioModel.findById(userId);
          if(!usuario){
            return res.status(400).json({erro: "Usuário não encontrado."})
          }

          const chamadosUsuario = await ChamadosModel.find({
            idSolicitante: userId,
          })
          return res.status(200).json(chamadosUsuario);
        }else if(role === 'admin'){
          if (req?.query?.id) {
            const usuarioId = req?.query?.id;
            const usuario = await UsuarioModel.findById(usuarioId);
  
            if (!usuario) {
              return res.status(400).json({ erro: "Usuário não encontrado" });
            }
  
            const chamadosUsuario = await ChamadosModel.find({
              idSolicitante: usuarioId,
            });
  
            return res.status(200).json(chamadosUsuario);
          } else {
            const chamados = await ChamadosModel.find();
  
            return res.status(200).json(chamados);
          }
        }else{
          return res.status(403).json({erro: "Usuário não autorizado"})
        }

      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .json({ erro: "Não foi possível buscar os chamados" });
      }
    }
  )
  .put(async (req: any, res: NextApiResponse<ResponseDefault>) => {
    try {
      const { userId, role } = req?.query;
      const idChamado = req?.query?.id;

      if(!idChamado){
        return res.status(500).json({erro: "É necessário um id para editar um chamado"})
      }

      const chamadoEditado = req.body as EditarChamadoPadrao;

      const chamado = await ChamadosModel.findById(idChamado);

      if (!chamado) {
        return res.status(400).json({ erro: "Chamado não encontrado" });
      }
      
      if(chamado.idSolicitante === userId || role === "admin"){

        if (chamadoEditado.descricao && chamadoEditado.descricao.length > 5) {
          chamado.descricao = chamadoEditado.descricao;
        }
  
        const { file } = req;
  
        if (file && file.originalname) {
          const image = await uploadImagemCosmic(req);
          if (image && image.media && image.media.url) {
            if (chamadoEditado.modificarFotoFinal) {
              chamado.fotoFinalServico = image.media.url;
            } else {
              chamado.foto = image.media.url;
            }
          }
        }
  
        if (chamadoEditado.local && chamadoEditado.local.length >= 3) {
          chamado.local = chamadoEditado.local;
        }
  
        if (chamadoEditado.setorExecutor) {
          chamado.setorExecutor = chamadoEditado.setorExecutor;
        }
  
        if (chamadoEditado.status) {
          chamado.status = chamadoEditado.status;
        }
  
        if (chamadoEditado.dataExecucao) {
          chamado.dataExecucao = chamadoEditado.dataExecucao;
        }
  
        if (chamadoEditado.funcionarioExecutor) {
          chamado.funcionariosExecucao = chamadoEditado.funcionarioExecutor;
        }
  
        if (chamadoEditado.observacoes) {
          chamado.observacoesSobreOChamado = chamadoEditado.observacoes;
        }
  
        await ChamadosModel.findByIdAndUpdate({ _id: chamado._id }, chamado);
  
        return res.status(200).json({ msg: "Chamado alterado com sucesso" });
      }else {
        return res.status(403).json({erro: "O usuário não possui autorização para editar esse chamado"});
      }

    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ erro: "Não foi possível alterar o chamado" + e });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default politicaCORS(validarToken(connectMongoDB(handler)));