import React, { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState("");
  const [imageSrc, setImageSrc] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Segmentando imagen...");
    setImageSrc(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("image", imageFile);

    try {
      await axios.post("http://localhost:3001/api/segment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrompt("");
      pollForImage();
      setImageFile(null);
    } catch (err) {
      setStatus("Error al segmentar.");
      console.error(err);
    }
  };

  const pollForImage = async () => {
    const maxRetries = 60;
    const interval = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await axios.get("http://localhost:3001/api/latest-image");
        if (res.data.status === "ready") {
          setImageSrc(res.data.image);
          setStatus("¡Imagen segmentada lista!");
          return;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    setStatus("Timeout: imagen no disponible.");
  };

  return (
    <div className="bg-gray-400 p-6 text-center h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">
        Segmentador de Prendas
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-col items-center gap-2"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt (ej: jean, sweater...)"
          className="border border-gray-300 px-3 py-2 rounded w-96"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="border border-gray-300 px-3 py-2 rounded w-96"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Segmentar
        </button>
      </form>

      <p className="mb-4">{status}</p>

      {imageSrc && (
        <img
          src={imageSrc}
          alt="Resultado"
          className="mx-auto border rounded max-h-full bg-amber-50"
        />
      )}
    </div>
  );
}

export default App;
