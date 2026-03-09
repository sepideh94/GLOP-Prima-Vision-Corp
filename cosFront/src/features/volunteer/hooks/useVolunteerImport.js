import { useState } from "react";
import { parseCsvFile } from "../utils/csvParser";
import volunteerService from "../services/volunteerService";

export default function useVolunteerImport(competitionId) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFile = async (selectedFile) => {
    setError("");
    setSuccess("");

    try {
      const rows = await parseCsvFile(selectedFile);
      setFile(selectedFile);
      setPreview(rows);
    } catch (err) {
      setError(err);
    }
  };

  const sendInvitations = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await volunteerService.importVolunteers(competitionId, file);

      setPreview((prev) =>
        prev.map((p) => ({
          ...p,
          status: "Invitation envoyée",
        }))
      );

      setSuccess("Invitations envoyées avec succès !");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'import des volontaires"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    preview,
    loading,
    error,
    success,
    handleFile,
    sendInvitations,
  };
}