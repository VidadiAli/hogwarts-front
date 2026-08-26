import axios from "axios";
import api from "../api/api";

export const uploadImage = async (file: File) => {

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
        "upload_preset",
        "preset_images"
    );

    const cloudName = "nqbcsnwm";

    const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
    );

    return {
        publicId: res.data.public_id,
        url: res.data.secure_url
    };
};

export const deleteImage = async (publicId: string) => {
  try {
    const response = await api.delete(`/images/delete?publicId=${publicId}`);
    return response.data;
  } catch (error) {
    console.error("Şəkil silinərkən xəta baş verdi:", error);
    throw error;
  }
};