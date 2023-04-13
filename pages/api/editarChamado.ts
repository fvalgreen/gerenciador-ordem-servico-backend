import type { NextApiRequest, NextApiResponse } from "next";
import { validarToken } from "@/middlewares/validarToken";
import { connectMongoDB } from "@/middlewares/connectMongoDB";
import { ResponseDefault } from "@/types/ResponseDefault";
import { ChamadosModel } from "@/models/ChamadosModel";
import nc from "next-connect";
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic";
import { EditarChamadoPadrao } from "@/types/EditarChamadoPadrao";

const handler = nc()
  .use(upload.single("file"))
  .put(async (req: any, res: NextApiResponse<ResponseDefault>) => {
    try {
      const { id } = req?.query;

      const chamadoEditado = req.body as EditarChamadoPadrao;

      const chamado = await ChamadosModel.findById(id);

      if (!chamado) {
        return res.status(400).json({ erro: "Chamado não encontrado" });
      }

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
        chamado.funcionariosExecucao.push(chamadoEditado.funcionarioExecutor);
      }

      if (chamadoEditado.observacoes) {
        chamado.observacoesSobreOChamado = chamadoEditado.observacoes;
      }

      await ChamadosModel.findByIdAndUpdate({ _id: chamado._id }, chamado);

      return res.status(200).json({ msg: "Chamado alterado com sucesso" });
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

export default validarToken(connectMongoDB(handler));
