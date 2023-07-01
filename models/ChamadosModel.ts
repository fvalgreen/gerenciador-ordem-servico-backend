import mongoose, { Schema } from "mongoose";

const ChamadoSchema = new Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  local: { type: String, required: true },
  dataAbertura: { type: Date, required: true },
  foto: { type: String, required: false },
  setorExecutor: { type: String, default: "" },
  status: { type: String, required: true, default: "Aberta" },
  dataExecucao: { type: Date, default: null },
  funcionariosExecucao: { type: Array, required: true, default: [] },
  solicitante: { type: String, required: true },
  idSolicitante: { type: String, required: true },
  setorSolicitante: { type: String, required: true },
  emailSolicitante: { type: String, required: true },
  observacoesSobreOChamado: { type: String, default: "" },
  fotoFinalServico: { type: String, default: "" },
});

export const ChamadosModel =
  mongoose.models.chamados || mongoose.model("chamados", ChamadoSchema);
