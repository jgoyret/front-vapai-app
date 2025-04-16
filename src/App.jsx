import React, { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState("");
  const [imageSrc, setImageSrc] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("⏳ Segmentando imagen...");
    setImageSrc(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("image", imageFile);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACK_URL}/api/segment`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setPrompt("");
      setImageFile(null);
      pollForImage();
    } catch (err) {
      setStatus("❌ Error al segmentar.");
      console.error(err);
    }
  };

  const pollForImage = async () => {
    const maxRetries = 120;
    const interval = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACK_URL}/api/latest-image`
        );
        if (res.data.status === "ready") {
          setImageSrc(res.data.image);
          setStatus("✅ ¡Imagen segmentada lista!");
          return;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    setStatus("⛔ Timeout: imagen no disponible.");
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = "imagen_segmentada.png";
    link.click();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-purple-600 mb-6">Segmentador</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col items-center gap-4"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt (ej: jean, sweater...)"
          className="border border-gray-300 px-4 py-2 rounded w-80"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="border border-gray-300 px-4 py-2 rounded w-80"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Segmentar
        </button>
      </form>

      <p
        className={`mb-4 font-semibold ${
          status.includes("Error") || status.includes("Timeout")
            ? "text-red-600"
            : "text-green-600"
        }`}
      >
        {status}
      </p>

      {imageSrc && (
        <div className="flex flex-col items-center gap-4">
          <img
            src={imageSrc}
            alt="Resultado"
            className="max-w-[600px] max-h-[500px] border shadow-md rounded"
          />
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Descargar Imagen
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
