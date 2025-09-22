import { supabase } from './supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload de imagem para o Supabase Storage
 * @param file - Arquivo de imagem a ser enviado
 * @param quizId - ID do quiz para organizar as imagens
 * @param questionId - ID da questão (opcional, para edição)
 * @returns Promise com resultado do upload
 */
export const uploadQuestionImage = async (
  file: File,
  quizId: string,
  questionId?: string
): Promise<ImageUploadResult> => {
  try {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.'
      };
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.'
      };
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = questionId 
      ? `question-${questionId}-${Date.now()}.${fileExt}`
      : `question-${Date.now()}.${fileExt}`;
    
    const filePath = `quiz-images/${quizId}/${fileName}`;

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload da imagem. Tente novamente.'
      };
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Erro inesperado no upload:', error);
    return {
      success: false,
      error: 'Erro inesperado. Tente novamente.'
    };
  }
};

/**
 * Remove uma imagem do Supabase Storage
 * @param imageUrl - URL da imagem a ser removida
 * @returns Promise com resultado da remoção
 */
export const deleteQuestionImage = async (imageUrl: string): Promise<ImageUploadResult> => {
  try {
    // Extrair o caminho do arquivo da URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const quizId = urlParts[urlParts.length - 2];
    const filePath = `quiz-images/${quizId}/${fileName}`;

    const { error } = await supabase.storage
      .from('question-images')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao remover imagem:', error);
      return {
        success: false,
        error: 'Erro ao remover a imagem.'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Erro inesperado ao remover imagem:', error);
    return {
      success: false,
      error: 'Erro inesperado ao remover a imagem.'
    };
  }
};

/**
 * Redimensiona uma imagem para otimizar o upload
 * @param file - Arquivo de imagem
 * @param maxWidth - Largura máxima (padrão: 1200px)
 * @param maxHeight - Altura máxima (padrão: 1200px)
 * @param quality - Qualidade da compressão (0-1, padrão: 0.8)
 * @returns Promise com arquivo redimensionado
 */
export const resizeImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Erro ao redimensionar a imagem'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar a imagem'));
    img.src = URL.createObjectURL(file);
  });
};
