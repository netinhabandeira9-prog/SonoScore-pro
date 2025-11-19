import { UserData } from "../types";

// Atualizado para suportar Vite (import.meta.env) e Fallback
const ACCESS_KEY = (import.meta as any).env?.VITE_WEB3FORM_KEY || (typeof process !== 'undefined' ? (process as any).env?.REACT_APP_WEB3FORM_KEY : undefined) || 'YOUR_WEB3FORMS_PUBLIC_KEY_HERE';

export const submitLead = async (user: UserData, answers: any) => {
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `Novo Lead SleepMastery: ${user.name}`,
        from_name: "SleepMastery App",
        email: user.email,
        message: `Nome: ${user.name}\nEmail: ${user.email}\n\nRespostas Resumo: ${JSON.stringify(answers)}`,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Lead captured successfully");
    } else {
      console.warn("Lead capture failed", result);
    }
  } catch (error) {
    console.error("Web3Form Error:", error);
  }
};