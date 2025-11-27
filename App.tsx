import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import ThankYou from './src/pages/ThankYou';
import { AppState, QuizAnswers, UserData, AnalysisResult } from './types';
import { analyzeSleep } from './services/geminiService';
import { submitLead } from './services/web3FormService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.LANDING);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // DETECÇÃO 100% CONFIÁVEL DA PÁGINA /obrigado (funciona em Vercel + SPA)
  const isThankYouPage = typeof window !== 'undefined' && window.location.href.includes('/obrigado');

  if (isThankYouPage) {
    return <ThankYou />;
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentState === AppState.PRE_RESULT || currentState === AppState.FULL_RESULT) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentState]);

  const startQuiz = () => setCurrentState(AppState.QUIZ);

  const handleQuizSubmit = async (user: UserData, answers: QuizAnswers) => {
    setUserData(user);
    setCurrentState(AppState.PROCESSING);
    try {
      submitLead(user, answers);
      const result = await analyzeSleep(user, answers);
      setAnalysis(result);
      setCurrentState(AppState.PRE_RESULT);
    } catch (error) {
      console.error('Process failed', error);
      setCurrentState(AppState.LANDING);
      alert('Ocorreu um erro. Tente novamente.');
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    setCurrentState(AppState.FULL_RESULT);
  };

  const handleRetake = () => {
    if (window.confirm('Tem certeza? Ao reiniciar, você perderá o resultado atual.')) {
      setAnalysis(null);
      setIsPaided(false);
      setCurrentState(AppState.QUIZ);
    }
  };

  return (
    <div className="min-h-screen bg-night-900 text-slate-200 font-sans">
      {currentState === AppState.LANDING && <LandingPage onStart={startQuiz} />}

      {currentState === AppState.QUIZ && (
        <Quiz onSubmit={handleQuizSubmit} onBack={() => setCurrentState(AppState.LANDING)} />
      )}

      {currentState === AppState.PROCESSING && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-night-900 p-6 text-center relative">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent-500/20 blur-xl rounded-full animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-accent-500 animate-spin relative z-10" />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">Analisando seus dados...</h2>
            <p className="text-slate-400 mt-2">Comparando seus biomarcadores com +10.000 padrões clínicos.</p>
            <div className="mt-8 w-64 h-1 bg-night-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent-500 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
            </div>
            <style>{`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(300%); }
              }
            `}</style>
          </div>
          <div className="pb-6 opacity-60 px-4">
            <p className="text-slate-600 text-[10px] leading-relaxed max-w-2xl mx-auto">
              <strong>Aviso Legal de Saúde:</strong> O conteúdo fornecido pelo SonoScore-Pro é estritamente para fins informativos e educativos e não constitui aconselhamento médico, diagnóstico ou tratamento. As estratégias de higiene do sono sugeridas são baseadas em práticas de bem-estar geral. Este aplicativo não substitui a consulta com médicos ou especialistas do sono. Se você suspeita que tem um distúrbio do sono ou qualquer outra condição médica, procure sempre a orientação de um profissional de saúde qualificado.
            </p>
            <p className="text-slate-700 text-[10px] mt-1">© 2025 SonoScore-Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      )}

      {(currentState === AppState.PRE_RESULT || currentState === AppState.FULL_RESULT) && analysis && (
        <Results
          analysis={analysis}
          userEmail={userData?.email || ''}
          isPaid={isPaid}
          onPay={handlePaymentSuccess}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
};

export default App;
