import React, { useState } from "react";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

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
    <div
      className=" min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(to top, #b8d8c6, #e6f4ec)",
      }}
    >
      <h1 className="text-4xl font-bold text-gray-950 mb-6">SEGMENTADOR</h1>

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
          className="border border-gray-300 px-4 py-2 rounded w-80 hover:border-gray-900 hover:cursor-pointer"
          required
        />
        <button
          type="submit"
          className="bg-gray-950 text-white px-6 py-2 rounded hover:bg-gray-600 transition hover:cursor-pointer"
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
      {status.includes("Segmentando") && (
        <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold">
          <ClipLoader size={24} color="#2563eb" />
        </div>
      )}

      {imageSrc && (
        <div className="flex flex-col items-center gap-4">
          <img
            src={imageSrc}
            alt="Resultado"
            className="max-w-[600px] max-h-[500px] border shadow-md rounded"
          />
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition hover:cursor-pointer"
          >
            Descargar Imagen
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
