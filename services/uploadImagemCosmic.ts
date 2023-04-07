import multer from "multer";
import cosmicjs from "cosmicjs";

const {
  CHAVE_GRAVACAO_CHAMADOS,
  BUCKET_CHAMADOS,
} = process.env;

const Cosmic = cosmicjs();
const bucketChamados = Cosmic.bucket({
  slug: BUCKET_CHAMADOS,
  write_key: CHAVE_GRAVACAO_CHAMADOS
});

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const uploadImagemCosmic = async (req: any) => {
  if(req?.file?.originalname){
    if(!req.file.originalname.includes('.png') && !req.file.originalname.includes('.jpg') && !req.file.originalname.includes('.jpeg')){
      throw new Error('Extensão de imagem inválida');
    }

    const media_object = {
      originalname: req.file.originalname,
      buffer: req.file.buffer
    }

    return await bucketChamados.addMedia({media: media_object});;
  };
};

export {upload, uploadImagemCosmic};