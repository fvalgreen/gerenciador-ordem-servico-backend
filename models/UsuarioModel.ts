import mongoose, { Schema } from "mongoose";

const UsuarioSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  setor: { type: String, required: true },
  chamadosAbertos: { type: Number, default: 0 },
  nivelAcesso: { type: Number, default: 0 },
});

export const UsuarioModel =
  mongoose.models.usuarios || mongoose.model("usuarios", UsuarioSchema);
