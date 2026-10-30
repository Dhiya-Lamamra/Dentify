import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignIn({ type }) {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    courriel: "",
    mot_de_passe: "",
    type_utilisateur: type
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("Tentative de connexion avec:", credentials);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(credentials),
        credentials: "include"
      });

      console.log("Réponse du serveur - Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la connexion");
      }

      const data = await response.json();

      // 🔹 Le compte doit correspondre à l'onglet choisi (clinique / professionnel)
      if (data.user?.type_utilisateur && data.user.type_utilisateur !== credentials.type_utilisateur) {
        throw new Error(
          data.user.type_utilisateur === "clinique"
            ? "Ce compte est un compte clinique : utilisez la connexion Clinique."
            : "Ce compte est un compte professionnel : utilisez la connexion Professionnel."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🔹 Redirection selon le type réel du compte
      if (data.user?.type_utilisateur === "clinique") {
        navigate("/pages/Connecte/PrincipaleClinique");
      } else {
        navigate("/pages/Connecte/Principale");
      }

    } catch (error) {
      console.error("Erreur complète:", error);
      setError(error.message || "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
      type_utilisateur: type
    }));
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1>{type === "clinique" ? "Connexion Clinique" : "Connexion Professionnel"}</h1>

        <div className="social-container">
          <a href="#" className="social"><FaFacebookF /></a>
          <a href="#" className="social"><FaGooglePlusG /></a>
          <a href="#" className="social"><FaLinkedinIn /></a>
        </div>

        <span>ou utilisez votre compte</span>

        <input
          type="email"
          name="courriel"
          placeholder="Courriel"
          value={credentials.courriel}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="mot_de_passe"
          placeholder="Mot de passe"
          value={credentials.mot_de_passe}
          onChange={handleChange}
          required
          minLength="6"
        />

        {error && (
          <p className="error-message" style={{ color: "red", margin: "10px 0" }}>
            {error}
          </p>
        )}

        <a href="#" style={{ fontSize: "12px", margin: "10px 0" }}>
          Mot de passe oublié?
        </a>

        <button
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: isLoading ? "#cccccc" : "" }}
        >
          {isLoading ? "Connexion en cours..." : "Connexion"}
        </button>
      </form>
    </div>
  );
}

export default SignIn;
