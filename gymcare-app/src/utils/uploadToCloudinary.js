export const uploadToCloudinary = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "avatar.jpg",
      type: "image/jpeg",
    });
    formData.append("upload_preset", "ml_default"); 

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dohsfqs6d/image/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data", 
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Upload thất bại:", result);
      throw new Error(result?.error?.message || "Upload thất bại");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Lỗi upload:", error);
    throw error;
  }
};
