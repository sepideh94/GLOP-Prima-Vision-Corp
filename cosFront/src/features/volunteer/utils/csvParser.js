export const CSV_HEADER = "email;firstName;lastName";

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;

      if (!content) {
        reject("Fichier CSV invalide");
        return;
      }

      const lines = content
        .split("\n")
        .map((line) => line.replace(/\r/g, "").trim())
        .filter(Boolean);

      if (lines.length < 2) {
        reject("Le fichier CSV est vide ou invalide");
        return;
      }

      const header = lines[0].replace(/\s/g, "");

      if (header !== CSV_HEADER) {
        reject(
          "Format CSV invalide. L'en-tête doit être : email;firstName;lastName"
        );
        return;
      }

      const rows = lines.slice(1).map((line) => {
        const [email, firstName, lastName] = line.split(";");

        return {
          email: email?.trim(),
          firstName: firstName?.trim(),
          lastName: lastName?.trim(),
          status: "Invitation à envoyer",
        };
      });

      resolve(rows);
    };

    reader.readAsText(file);
  });
}