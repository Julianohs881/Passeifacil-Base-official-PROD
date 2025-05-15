
import React from "react";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (imageData: string | null) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  imagePreview, 
  onImageChange,
  disabled
}) => {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, envie apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          onImageChange(event.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    onImageChange(null);
  };

  return imagePreview ? (
    <div className="mt-4 border rounded-md p-3 relative">
      <button 
        onClick={clearImage}
        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
        disabled={disabled}
      >
        <X size={16} />
      </button>
      <img 
        src={imagePreview} 
        alt="Preview" 
        className="max-h-64 mx-auto object-contain rounded" 
      />
    </div>
  ) : (
    <div className="border-t pt-4">
      <p className="text-sm text-gray-500 mb-3">Ou envie uma imagem da questão:</p>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">
            <span className="font-medium text-blue-600">Clique para enviar</span> ou arraste uma imagem
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG (Máx. 5MB)</p>
        </div>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
