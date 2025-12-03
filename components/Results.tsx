import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, ActionPlanPhase, SupplementRecommendation } from '../types';
import { Lock, CheckCircle, Star, Unlock, Moon, Activity, Clock, ShieldCheck, Brain, Check, Share2, Download, MessageCircle, Sun, Coffee, QrCode, Calendar, Pill, ChevronRight, RotateCcw, Copy, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { paymentService } from '../services/paymentService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Helmet } from 'react-helmet-async';

interface ResultsProps {
  analysis: AnalysisResult;
  userEmail: string;
  isPaid: boolean;
  onPay: () => void;
  onRetake: () => void;
}

// Logo Component (Reused)
const Logo = () => (
  <div className="flex items-center gap-2 select-none">
    <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-accent-500 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.6)] border border-white/10">
      <Moon className="text-white w-4 h-4 absolute top-1.5 left-1.5" fill="currentColor" />
      <Activity className="text-white w-3 h-3 absolute bottom-1.5 right-1.5" />
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-display font-bold text-lg tracking-tight text-white drop-shadow-md">SonoScore</span>
      <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-accent-400 text-right -mt-0.5 text-shadow-glow">PRO</span>
    </div>
  </div>
);

export const Results: React.FC<ResultsProps> = ({ analysis, userEmail, isPaid, onPay, onRetake }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Estados do Pagamento (Somente PIX)
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixData, setPixData] = useState<{ image: string, code: string, id: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleUnlockClick = () => {
    setShowPaymentModal(true);
  };

  const scoreColor = analysis.score > 80 ? 'text-green-400' : analysis.score > 50 ? 'text-yellow-400' : 'text-red-400';
  const efficiencyColor = analysis.sleepEfficiency > 85 ? 'bg-green-500' : analysis.sleepEfficiency > 75 ? 'bg-yellow-500' : 'bg-red-500';

  // Lógica de Compartilhamento Universal (Web Share API)
  const handleShare = async () => {
    const chronotypeMatch = analysis.circadianProfile.match(/\*\*(.*?)\*\*/);
    const chronotype = chronotypeMatch ? chronotypeMatch[1] : "Indefinido";

    const shareData = {
        title: 'Meu Diagnóstico SonoScore',
        text: `🌙 Fiz a análise biométrica do meu sono no SonoScore!\n\n🧠 Score: ${analysis.score}/100\n⏳ Eficiência: ${analysis.sleepEfficiency}%\n🦁 Cronotipo: ${chronotype}\n\nDescubra o que está sabotando seu descanso:`,
        url: 'https://sonoscore.app' 
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Usuário cancelou ou erro no share', err);
        }
    } else {
        const whatsappText = `${shareData.text} ${shareData.url}`;
        const url = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        window.open(url, '_blank');
    }
  };

  // PDF Download (Restricted)
  const handleDownloadPdf = async () => {
    if (!isPaid) {
        setShowPaymentModal(true);
        return;
    }

    if (!resultRef.current) {
        alert("Erro ao gerar PDF. Elemento não encontrado.");
        return;
    }
    
    setIsGeneratingPdf(true);
    try {
        const element = resultRef.current;
        
        // 1. Hide interactive elements (buttons, active tabs)
        const buttons = document.querySelectorAll('.no-print');
        buttons.forEach((el: any) => el.style.display = 'none');

        // 2. Swap Interactive View for Full List View
        const interactivePlan = document.getElementById('interactive-plan');
        const staticFullPlan = document.getElementById('static-full-plan');

        if (interactivePlan) interactivePlan.style.display = 'none';
        if (staticFullPlan) staticFullPlan.style.display = 'block';

        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#0f172a', // Force dark background
            useCORS: true,
            logging: false,
            allowTaint: true,
            windowWidth: 1200 // Force desktop width for better layout
        });

        // 3. Restore elements
        if (interactivePlan) interactivePlan.style.display = 'block';
        if (staticFullPlan) staticFullPlan.style.display = 'none';
        buttons.forEach((el: any) => el.style.display = 'flex');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`SonoScore_${analysis.userName.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
        console.error("PDF Error", error);
        alert("Erro ao baixar PDF.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  // Lógica de Pagamento PIX
  const handleGeneratePix = async () => {
    if (pixData) return; 
    setIsLoadingPix(true);
    setPaymentError('');
    
    try {
        const response = await paymentService.createPixPayment({
            name: analysis.userName,
            email: userEmail || "cliente@sonoscore.app" 
        });

        if (response.success && response.encodedImage && response.payload && response.paymentId) {
            setPixData({
                image: response.encodedImage,
                code: response.payload,
                id: response.paymentId
            });
        } else {
            setPaymentError(response.error || "Erro ao comunicar com Asaas.");
        }
    } catch (e) {
        setPaymentError("Erro de conexão.");
    } finally {
        setIsLoadingPix(false);
    }
  };

  // Polling para verificar status do pagamento
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (showPaymentModal && pixData?.id && !isPaid) {
        interval = setInterval(async () => {
            const isApproved = await paymentService.checkPaymentStatus(pixData.id);
            if (isApproved) {
                onPay();
                setShowPaymentModal(false);
                clearInterval(interval);
            }
        }, 5000); 
    }

    return () => {
        if (interval) clearInterval(interval);
    };
  }, [showPaymentModal, pixData, isPaid, onPay]);

  // Auto-trigger pix generation when modal opens
  useEffect(() => {
      if (showPaymentModal && !pixData) {
          handleGeneratePix();
      }
  }, [showPaymentModal]);

  const copyToClipboard = () => {
      if (pixData?.code) {
          navigator.clipboard.writeText(pixData.code);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
      }
  };

  return (
  <>
    <Helmet>
      <title>SonoScore {analysis.score}/100 • Protocolo Personalizado de 30 Dias</title>
      <meta name="description" content={`Score ${analysis.score}/100 • Eficiência ${analysis.sleepEfficiency}% • Cronotipo detectado. Receba seu protocolo de 30 dias com fases Reset, Higiene Avançada e Consolidação + suplementos (Magnésio, Ashwagandha KSM-66, L-Teanina).`} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.sonoscorepro.com.br/resultado" />
      
      <meta property="og:title" content={`Meu SonoScore é ${analysis.score}/100 – Veja meu protocolo completo`} />
      <meta property="og:description" content="Análise biométrica completa do sono + protocolo de 30 dias com suplementação personalizada" />
      <meta property="og:image" content="https://www.sonoscorepro.com.br/og-relatorio.jpg" />
      <meta property="og:url" content="https://www.sonoscorepro.com.br/resultado" />
    </Helmet>

    <div className="min-h-screen bg-night-900 text-slate-200 selection:bg-accent-500/30 pb-12">
      {/* Top Navigation */}
      <nav className="bg-night-950/50 border-b border-white/5 py-4 backdrop-blur-md sticky top-0 z-50 print:hidden">
         <div className="container mx-auto px-6 flex justify-between items-center">
            <Logo />
            <div className="flex gap-3">
                <button onClick={onRetake} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white hidden md:block" title="Refazer Teste">
                    <RotateCcw size={20} />
                </button>
                <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-full transition-colors text-green-400" title="Compartilhar Resultado">
                    <Share2 size={20} />
                </button>
                <button 
                    onClick={handleDownloadPdf} 
                    className={`p-2 hover:bg-white/10 rounded-full transition-colors ${isPaid ? 'text-accent-400' : 'text-slate-500'}`} 
                    title={isPaid ? "Baixar PDF" : "Desbloquear PDF"}
                >
                    {isGeneratingPdf ? (
                        <div className="w-5 h-5 border-2 border-accent-400 border-t-transparent rounded-full animate-spin"/>
                    ) : isPaid ? (
                        <Download size={20} />
                    ) : (
                        <Lock size={20} />
                    )}
                </button>
            </div>
         </div>
      </nav>

      {/* Main Content Wrapper for PDF Capture */}
      <div ref={resultRef} className="bg-night-900">
        
        {/* Hero Section */}
        <div className="bg-night-800 border-b border-white/5 pt-12 pb-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-600/10 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="container mx-auto px-6 text-center relative z-10">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                    Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-purple-400">{analysis.userName}</span>!
                </h1>
                <p className="text-slate-400 text-sm mb-10">Sua análise completa está pronta.</p>
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-12">
                    {/* Score Circle */}
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                        <circle 
                            cx="100" 
                            cy="100" 
                            r="80" 
                            stroke="currentColor" 
                            strokeWidth="12" 
                            fill="transparent" 
                            strokeDasharray={502} 
                            strokeDashoffset={502 - (502 * analysis.score) / 100}
                            className={`${scoreColor} transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]`}
                            strokeLinecap="round"
                        />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className={`text-5xl font-bold text-white tracking-tighter`}>{analysis.score}</span>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest mt-1">Score</span>
                        </div>
                    </div>

                    {/* Efficiency Stats */}
                    <div className="bg-night-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm max-w-xs w-full text-left">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Eficiência do Sono</span>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${efficiencyColor} text-night-950`}>{analysis.sleepEfficiency}%</span>
                        </div>
                        
                        {/* Bar Chart */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300">Tempo de Cama</span>
                                    <span className="text-white font-bold">{analysis.timeInBed}</span>
                                </div>
                                <div className="w-full bg-night-950 h-2 rounded-full overflow-hidden">
                                    <div className="bg-slate-600 h-full w-full"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-accent-400 font-medium">Sono Real</span>
                                    <span className="text-accent-300 font-bold">{analysis.actualSleepTime}</span>
                                </div>
                                <div className="w-full bg-night-950 h-2 rounded-full overflow-hidden">
                                    <div className="bg-accent-500 h-full" style={{ width: `${analysis.sleepEfficiency}%` }}></div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs text-red-400">
                                    <Clock size={12} />
                                    <span>Você perde <b>{analysis.lostTime}</b> acordado na cama.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <p className="mt-10 text-xl font-medium text-slate-300 max-w-2xl mx-auto">
                    {analysis.summary}
                </p>
            </div>
        </div>

        <div className="container mx-auto px-6 -mt-8 pb-16 relative z-20">
            <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* FREE TIER VALUE: Checklist & Chronotype */}
                <div className="bg-night-800 rounded-2xl border border-white/10 p-6 md:p-8 shadow-lg relative overflow-hidden">
                   
                   {/* Checklist Section - Visual "Prescription" */}
                   <div className="mb-10">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <CheckCircle className="text-green-400" size={20} />
                            Seu Protocolo de Higiene
                        </h3>
                        <div className="grid gap-3">
                            {analysis.checklist.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-night-900/50 p-4 rounded-xl border border-white/5 hover:border-accent-500/30 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                                        ${item.time === 'Manhã' ? 'bg-yellow-500/10 text-yellow-500' : 
                                          item.time === 'Tarde' ? 'bg-orange-500/10 text-orange-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                        {item.iconType === 'sun' && <Sun size={20} />}
                                        {item.iconType === 'coffee' && <Coffee size={20} />}
                                        {item.iconType === 'moon' && <Moon size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{item.time}</div>
                                        <div className="text-sm text-slate-200 font-medium">{item.action}</div>
                                    </div>
                                    <div className="ml-auto w-5 h-5 rounded-full border-2 border-slate-700"></div>
                                </div>
                            ))}
                        </div>
                   </div>

                    {/* Chronotype */}
                    <div className="pt-8 border-t border-white/5">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="text-accent-400" size={20} />
                            Seu Cronotipo Biológico
                        </h3>
                        <div className="bg-night-900/50 p-5 rounded-xl border border-white/5">
                            <ReactMarkdown className="prose prose-invert text-slate-300 prose-sm">
                            {analysis.circadianProfile}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* LOCKED: Deep Diagnosis (THE WHY) */}
                <div className={`relative rounded-2xl border border-white/10 p-8 shadow-lg transition-all ${isPaid ? 'bg-night-800' : 'bg-night-800/50 overflow-hidden'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-red-400" size={20} />
                        Diagnóstico Profundo
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">A Raiz do Problema + Bioquímica</p>
                    </div>
                    {!isPaid && <Lock className="text-slate-600" size={20} />}
                </div>

                {isPaid ? (
                    <div className="prose prose-invert max-w-none text-slate-300">
                    <ReactMarkdown>{analysis.fullAnalysis}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="relative">
                    <div className="filter blur-sm select-none opacity-40 space-y-4">
                        <p>Identificamos que sua arquitetura de sono sofre de fragmentação na fase REM devido ao consumo de substâncias específicas que você relatou. Isso impede a consolidação da memória...</p>
                        <p>A adenosina não está sendo metabolizada corretamente devido à inibição competitiva da cafeína consumida no período vespertino...</p>
                        <p>Seus níveis de cortisol parecem estar invertidos, com pico noturno causado por estímulos luminosos e mentais...</p>
                        <div className="h-24"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-t from-night-900 via-night-900/95 to-transparent pt-10">
                        <div className="bg-night-800 p-4 rounded-full mb-4 border border-white/10 shadow-xl">
                            <Lock className="w-8 h-8 text-accent-500" />
                        </div>
                        <p className="font-bold text-white mb-2 text-lg">Por que você está cansado?</p>
                        <p className="text-sm text-slate-400 mb-6 max-w-xs text-center leading-relaxed">
                            Desbloqueie a análise neuroquímica detalhada (Cortisol, Adenosina, Melatonina).
                        </p>
                    </div>
                    </div>
                )}
                </div>

                {/* LOCKED: Advanced Protocol (THE HOW) */}
                {isPaid && (
                    <div className="bg-night-800 rounded-2xl border border-white/10 p-8 shadow-lg animate-fade-in-up">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-green-400" size={20} />
                                Protocolo de Transformação
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-bold">
                                <span className="px-2 py-1 bg-accent-500/20 text-accent-300 rounded">Plano de 30 Dias</span> & 
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">Suplementação</span>
                            </div>
                        </div>

                        {/* --- INTERACTIVE TABS (VISIBLE ON SCREEN) --- */}
                        <div id="interactive-plan">
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                                {analysis.recoveryPlan.map((phase, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActivePlanTab(idx)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                            activePlanTab === idx 
                                            ? 'bg-accent-600 border-accent-500 text-white shadow-lg' 
                                            : 'bg-night-900 border-white/5 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {phase.duration}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setActivePlanTab(3)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${
                                        activePlanTab === 3 
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                                        : 'bg-night-900 border-white/5 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Pill size={14} /> Suplementos
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {activePlanTab < 3 ? (
                                    // Interactive Content: Phases
                                    <div className="animate-fade-in">
                                        <div className="mb-4">
                                            <h4 className="text-lg font-bold text-white">{analysis.recoveryPlan[activePlanTab].title}</h4>
                                            <p className="text-accent-400 text-sm font-medium">Foco: {analysis.recoveryPlan[activePlanTab].focus}</p>
                                        </div>
                                        <div className="space-y-3">
                                            {analysis.recoveryPlan[activePlanTab].steps.map((step, sIdx) => (
                                                <div key={sIdx} className="flex gap-3 items-start bg-night-900/50 p-3 rounded-lg border border-white/5">
                                                    <div className="mt-1 w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-xs font-bold flex-shrink-0">
                                                        {sIdx + 1}
                                                    </div>
                                                    <div className="text-slate-300 text-sm leading-relaxed">
                                                        <ReactMarkdown>{step}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    // Interactive Content: Supplements
                                    <div className="animate-fade-in grid gap-4">
                                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl mb-2">
                                            <p className="text-xs text-purple-300 leading-relaxed">
                                                <strong>Nota:</strong> Esta é uma sugestão educacional baseada em neuroquímica. Consulte seu médico antes de iniciar qualquer suplementação.
                                            </p>
                                        </div>
                                        {analysis.supplementStack.map((supp, sIdx) => (
                                            <div key={sIdx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-night-900 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                    <Pill size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-white text-lg">{supp.name}</h4>
                                                        <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-slate-400 border border-white/5">{supp.dosage}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-purple-400 font-bold mt-1 mb-2 uppercase tracking-wide">
                                                        <Clock size={12} /> {supp.timing}
                                                    </div>
                                                    <p className="text-sm text-slate-400 leading-relaxed">{supp.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- STATIC FULL LIST (HIDDEN ON SCREEN, VISIBLE ON PDF) --- */}
                        <div id="static-full-plan" style={{ display: 'none' }}>
                            <div className="space-y-8">
                                {analysis.recoveryPlan.map((phase, pIdx) => (
                                    <div key={pIdx} className="border-l-2 border-accent-500/50 pl-4 ml-2">
                                        <div className="mb-4">
                                            <h4 className="text-lg font-bold text-white">{phase.title}</h4>
                                            <p className="text-accent-400 text-sm font-medium">Foco: {phase.focus}</p>
                                        </div>
                                        <div className="space-y-3 mb-6">
                                            {phase.steps.map((step, sIdx) => (
                                                <div key={sIdx} className="flex gap-3 items-start bg-night-900/30 p-3 rounded-lg border border-white/5">
                                                    <div className="mt-1 w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-xs font-bold flex-shrink-0">
                                                        {sIdx + 1}
                                                    </div>
                                                    <div className="text-slate-300 text-sm leading-relaxed">
                                                        <ReactMarkdown>{step}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Pill className="text-purple-400" size={20} />
                                        Stack de Suplementação
                                    </h4>
                                    <div className="grid gap-4">
                                        <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl">
                                            <p className="text-[10px] text-purple-300">
                                                *Sugestão educacional. Consulte seu médico.
                                            </p>
                                        </div>
                                        {analysis.supplementStack.map((supp, sIdx) => (
                                            <div key={sIdx} className="bg-night-900 p-4 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-white">{supp.name}</h4>
                                                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400">{supp.dosage}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-purple-400 font-bold mt-1 mb-2">
                                                    <Clock size={12} /> {supp.timing}
                                                </div>
                                                <p className="text-sm text-slate-400">{supp.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* NEW: Share Section Footer */}
                {isPaid && (
                    <div className="mt-12 pt-8 border-t border-white/10 text-center no-print animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-2">Sua Jornada Começa Agora</h3>
                        <p className="text-slate-400 mb-6 text-sm">Salve seu relatório ou compartilhe sua pontuação com amigos.</p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button 
                            onClick={handleDownloadPdf}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-night-800 hover:bg-night-700 border border-white/10 rounded-xl text-white font-medium transition-all hover:-translate-y-1"
                            >
                            <Download size={18} className="text-accent-400" /> 
                            {isGeneratingPdf ? "Gerando PDF..." : "Baixar Relatório Completo"}
                            </button>
                            
                            <button 
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-xl text-green-400 font-medium transition-all hover:-translate-y-1"
                            >
                            <Share2 size={18} /> 
                            Compartilhar Resultado
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Offer Card (Sticky) */}
            <div className="lg:col-span-1">
                {!isPaid && (
                    <div className="sticky top-24 bg-gradient-to-b from-night-800 to-night-900 border border-accent-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden group">
                        {/* Animated Border */}
                        <div className="absolute inset-0 border-2 border-accent-500/20 rounded-3xl pointer-events-none"></div>
                        
                        <div className="absolute top-0 right-0 bg-accent-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">
                            Oferta Única
                        </div>

                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-display font-bold text-white mb-2">Protocolo Completo</h3>
                            <p className="text-slate-400 text-sm">Desbloqueie sua recuperação total</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {[
                                "Diagnóstico Neuroquímico Completo",
                                "Plano de Reset de 7/14/30 Dias",
                                "Stack de Suplementação Personalizada",
                                "Guia de Higiene do Sono Avançada"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check size={12} className="text-green-400" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-slate-500 line-through text-sm">R$ 29,90</span>
                                <span className="text-green-400 font-bold text-sm uppercase tracking-wider">66% OFF</span>
                            </div>
                            <div className="text-4xl font-bold text-white">R$ 9,90</div>
                            <p className="text-slate-500 text-xs mt-2">Pagamento único via PIX.</p>
                        </div>

                        <button 
                            onClick={handleUnlockClick}
                            className="w-full py-4 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-xl shadow-lg shadow-accent-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mb-4 group-hover:shadow-accent-500/40"
                        >
                            <Unlock size={18} /> Desbloquear Agora
                        </button>
                        
                    </div>
                )}
                
                {/* Retake Test Button in Sidebar for Desktop */}
                <button 
                    onClick={onRetake}
                    className="hidden lg:flex w-full mt-6 py-3 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-colors items-center justify-center gap-2 text-sm font-medium no-print"
                >
                    <RotateCcw size={16} /> Refazer Teste Gratuitamente
                </button>
            </div>
            </div>

            {/* Mobile Retake Button */}
            <div className="lg:hidden mt-12 text-center no-print">
                 <button 
                    onClick={onRetake}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm border-b border-transparent hover:border-white pb-1"
                >
                    <RotateCcw size={16} /> Quero refazer minha análise
                </button>
            </div>
        </div>

        {/* Payment Modal (PIX ONLY) */}
        {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-950/80 backdrop-blur-md">
                <div className="bg-night-900 border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in-up">
                    <button 
                        onClick={() => {
                            setShowPaymentModal(false);
                            setPixData(null);
                        }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white"
                    >
                        ✕
                    </button>
                    
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent-500/20">
                            <QrCode className="text-accent-400 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Checkout via PIX</h3>
                        <p className="text-slate-400 text-sm">Acesso liberado em segundos</p>
                    </div>

                    <div className="text-center space-y-4">
                            {paymentError && (
                                <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20 mb-2 flex items-center gap-2 justify-center">
                                    <AlertCircle size={14} /> {paymentError}
                                </div>
                            )}
                            
                            {isLoadingPix ? (
                                <div className="py-8 flex flex-col items-center justify-center bg-night-950 rounded-xl border border-white/5">
                                    <Loader2 className="w-10 h-10 text-accent-500 animate-spin mb-3" />
                                    <span className="text-sm text-slate-300 font-medium">Gerando QR Code Exclusivo...</span>
                                </div>
                            ) : pixData ? (
                                <>
                                <div className="bg-white p-4 rounded-xl inline-block mx-auto relative group shadow-lg shadow-white/5">
                                    <img src={`data:image/png;base64,${pixData.image}`} alt="Pix QR Code" className="w-48 h-48" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-base text-white font-bold">Total: R$ 9,90</p>
                                    <div className="flex gap-2 items-center">
                                        <input 
                                            readOnly 
                                            value={pixData.code} 
                                            className="flex-1 bg-night-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-400 truncate"
                                        />
                                        <button 
                                            onClick={copyToClipboard}
                                            className={`p-2 rounded-lg border transition-all ${copySuccess ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-night-800 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                            title="Copiar código"
                                        >
                                            {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-accent-400 animate-pulse pt-2 font-medium uppercase tracking-wider">
                                        Aguardando confirmação bancária...
                                    </p>
                                </div>
                                </>
                            ) : (
                                <div className="py-8">
                                    <button 
                                    onClick={handleGeneratePix}
                                    className="px-8 py-4 bg-accent-600 hover:bg-accent-500 rounded-xl text-white font-bold shadow-lg shadow-accent-500/20 flex items-center gap-2 mx-auto"
                                    >
                                        <QrCode size={20} /> Gerar PIX Agora
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
