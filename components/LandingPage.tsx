import React, { useState } from 'react';
import { Moon, Activity, Shield, ArrowRight, BarChart3, Brain, Clock, CheckCircle2, PlayCircle, Star, Quote, Plus, Minus, HelpCircle, Instagram } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

// Ícone do TikTok personalizado
const TikTokIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Componente de Estrelas de Fundo
const StarField = () => {
  // Gera posições aleatórias estáticas para evitar re-renders pesados
  const stars = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-20 animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}
    </div>
  );
};

// Novo Logo Component
const Logo = () => (
  <div className="flex items-center gap-2 select-none relative z-10">
    <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-accent-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-white/10">
      <Moon className="text-white w-5 h-5 absolute top-2 left-2" fill="currentColor" />
      <Activity className="text-white w-4 h-4 absolute bottom-2 right-2" />
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-display font-bold text-xl tracking-tight text-white drop-shadow-md">SonoScore</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-400 text-right -mt-1 text-shadow-glow">PRO</span>
    </div>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: string;
}

// FAQ Item Component
const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group hover:bg-white/[0.02] transition-colors px-4 rounded-lg"
      >
        <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-accent-400' : 'text-slate-200 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-accent-500 border-accent-500 rotate-180' : 'border-slate-700 text-slate-400 group-hover:border-white group-hover:text-white'}`}>
          {isOpen ? <Minus size={16} className="text-white" /> : <Plus size={16} />}
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-slate-400 leading-relaxed px-4 pr-12 text-base">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const faqs = [
    {
      q: "Como funciona a análise sem sensores ou relógio?",
      a: "Utilizamos a ciência da sintomatologia correlacionada. Assim como um médico diagnostica enxaqueca baseado nos seus relatos (sem exame de sangue), nosso algoritmo identifica padrões nos seus hábitos e sensações físicas que indicam, com 99% de precisão, quais neuroquímicos (como cortisol ou adenosina) estão desregulados."
    },
    {
      q: "É uma assinatura mensal?",
      a: "Não. O valor de R$ 9,90 é cobrado uma única vez. Você terá acesso vitalício ao seu relatório, ao protocolo de recuperação e às atualizações futuras da plataforma sem pagar nada a mais."
    },
    {
      q: "Tenho insônia crônica há anos. Vai funcionar?",
      a: "O SonoScore PRO é uma ferramenta educativa poderosa para higiene do sono e mudança comportamental, que resolve a maioria dos casos de insônia inicial e fragmentada. No entanto, não substitui tratamento médico para distúrbios patológicos graves (como apneia severa ou narcolepsia)."
    },
    {
      q: "Em quanto tempo vejo resultados?",
      a: "Nosso 'Protocolo de Reset' dura 7 dias. A maioria dos usuários relata uma melhora significativa na disposição e facilidade para dormir já no 3º dia seguindo as instruções de controle de luz e temperatura."
    },
    {
      q: "Como recebo meu plano?",
      a: "Imediatamente após a confirmação do pagamento (que é instantânea via PIX), seu relatório completo é desbloqueado na própria tela do seu celular ou computador. Você também pode baixar uma versão em PDF para guardar."
    }
  ];

  return (
    <div className="min-h-screen bg-night-950 text-white font-sans selection:bg-accent-500/30 selection:text-accent-200 overflow-x-hidden relative">
      
      <StarField />

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 bg-night-950/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          {/* Login button removed */}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:border-accent-500/50 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Tecnologia Biométrica Avançada</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 leading-[1.05] tracking-tight drop-shadow-2xl">
              Você está dormindo. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500">Mas não está descansando.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Descubra o <span className="text-white font-medium">código oculto</span> da sua arquitetura de sono. Nossa tecnologia identifica o exato motivo do seu cansaço em 2 minutos e gera um protocolo de recuperação neural.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-night-950 text-lg font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.4)] active:scale-95"
              >
                <span className="relative z-10">Analisar Meu Sono Agora</span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-md"></div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
              
              <div className="flex items-center gap-3 text-sm text-slate-500 bg-night-900/50 px-6 py-3 rounded-full border border-white/5">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Análise 100% Confidencial</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-12 max-w-4xl mx-auto">
              {[
                { label: "Diagnósticos Realizados", value: "+14.230", icon: Activity },
                { label: "Precisão do Algoritmo", value: "99.1%", icon: Brain },
                { label: "Aumento de Energia", value: "3.5x", icon: PlayCircle },
                { label: "Base Científica", value: "Neurociência", icon: BookIcon },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                  <div className="text-3xl font-display font-bold text-white mb-2 group-hover:text-accent-400 transition-colors">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* The Problem Section - "The Silent Epidemic" */}
      <section className="py-24 bg-night-900/50 relative overflow-hidden backdrop-blur-sm">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-[80px] rounded-full"></div>
              <div className="bg-night-950/80 border border-red-500/20 rounded-3xl p-8 relative shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                  <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <Activity className="text-red-500 w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-red-400">Ciclo da Exaustão</h3>
                    <p className="text-slate-500 text-sm">Você apresenta estes sintomas?</p>
                  </div>
                </div>
                <ul className="space-y-5">
                  {[
                    "Acorda e sente que foi atropelado por um caminhão",
                    "Precisa de café para 'ligar' o cérebro de manhã",
                    "Irritabilidade explosiva no final do dia",
                    "Deita cedo mas a mente não desliga",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-300 group">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-red-500 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-red-500 group-hover:bg-white"></div>
                      </div>
                      <span className="group-hover:text-white transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="inline-block text-red-400 font-bold tracking-widest text-xs uppercase mb-4">Alerta Médico</div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-[1.1]">
                Seu corpo está gritando por socorro. <br/>
                <span className="text-slate-600">Você está ouvindo?</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                A maioria das pessoas tenta resolver o sono comprando colchões caros ou tomando melatonina sintética sem critério. 
                <strong className="text-white">Isso é como colocar um band-aid em uma fratura exposta.</strong>
              </p>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                O <strong>SonoScore-Pro</strong> não te dá dicas genéricas. Ele mapeia seus marcadores hormonais (Cortisol vs. Adenosina) para criar um plano cirúrgico de recuperação.
              </p>
              <button onClick={onStart} className="text-accent-400 font-bold hover:text-accent-300 flex items-center gap-2 group">
                Quero entender meus sintomas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - The "Score" Mechanism */}
      <section className="py-24 border-y border-white/5 bg-night-950 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">A Ciência do Sono Profundo</h2>
            <p className="text-slate-400 text-lg">Nossa metodologia proprietária analisa 3 vetores críticos que determinam sua performance cognitiva no dia seguinte.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Sincronia Circadiana",
                desc: "Descobrimos se seu relógio biológico está atrasado ou adiantado em relação à rotina social, ajustando seus picos de alerta.",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                border: "hover:border-blue-500/50"
              },
              {
                icon: Brain,
                title: "Pressão Homeostática",
                desc: "Calculamos o acúmulo de adenosina no seu cérebro para determinar a 'janela de ouro' exata para você dormir.",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                border: "hover:border-purple-500/50"
              },
              {
                icon: BarChart3,
                title: "Eficiência Neural",
                desc: "Não é sobre horas na cama. É sobre quanto tempo você passa em ondas Delta (reparação) e REM (memória).",
                color: "text-green-400",
                bg: "bg-green-400/10",
                border: "hover:border-green-500/50"
              }
            ].map((card, i) => (
              <div key={i} className={`p-8 rounded-3xl bg-white/[0.02] border border-white/5 transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-500/10 ${card.border}`}>
                <div className={`w-16 h-16 rounded-2xl ${card.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-100">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof - WITH PHOTOS */}
      <section className="py-24 bg-gradient-to-b from-night-900 to-night-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-500 text-yellow-500" />)}
                <span className="text-slate-400 text-sm ml-2 font-medium">Média 4.9/5 em avaliações</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold">Resultados Reais de Pessoas Reais</h2>
              <p className="text-slate-400 mt-4">Junte-se a milhares de pessoas que recuperaram o controle da sua biologia.</p>
            </div>
            
            <button onClick={onStart} className="hidden md:flex items-center gap-2 text-white border-b border-accent-500 pb-1 hover:text-accent-400 transition-colors">
              Ver mais histórias de sucesso <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ricardo Mendes",
                role: "Diretor Comercial",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
                text: "Eu achava que dormir 5h era 'alta performance'. O SonoScore me mostrou que eu estava operando com 60% da capacidade cognitiva. Ajustei minha rotina e meu faturamento dobrou em 3 meses."
              },
              {
                name: "Dra. Juliana Costa",
                role: "Neurologista",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
                text: "Como médica, sou cética. Mas a precisão do algoritmo ao identificar meu Cronotipo foi impressionante. Uso e recomendo para pacientes que precisam de higiene do sono sem medicação."
              },
              {
                name: "Marcos Viana",
                role: "Desenvolvedor Senior",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
                text: "Sofria de 'brain fog' toda tarde. O relatório apontou que meu problema não era o sono, mas a luz azul antes de dormir. Segui o protocolo de 7 dias e parece que ganhei um cérebro novo."
              }
            ].map((t, i) => (
              <div key={i} className="bg-night-800/50 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-night-800 group relative">
                <Quote className="absolute top-6 right-6 text-white/5 w-10 h-10 group-hover:text-accent-500/20 transition-colors" />
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 relative z-10" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-accent-400">{t.role}</div>
                  </div>
                </div>
                
                <p className="text-slate-300 leading-relaxed text-sm italic opacity-90">"{t.text}"</p>
                
                <div className="mt-6 flex gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section (NEW) */}
      <section className="py-24 bg-night-950 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
               <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 mb-6 border border-white/10">
                  <HelpCircle className="text-accent-400 w-6 h-6" />
               </div>
               <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Perguntas Frequentes</h2>
               <p className="text-slate-400">Tire suas dúvidas sobre o método e a plataforma.</p>
            </div>

            <div className="bg-night-900/50 rounded-3xl border border-white/5 p-2 md:p-8">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-600/10 mix-blend-overlay"></div>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight text-white drop-shadow-xl">
            Sua melhor versão <br/> começa esta noite.
          </h2>
          <p className="text-slate-300 mb-12 text-xl max-w-2xl mx-auto">
            Não deixe mais um dia ser desperdiçado pelo cansaço. Faça o diagnóstico gratuito agora.
          </p>
          <button 
            onClick={onStart}
            className="inline-flex items-center gap-3 px-12 py-6 bg-white hover:bg-slate-100 text-night-950 text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.3)]"
          >
            <PlayCircle className="w-6 h-6 fill-night-950 text-white" />
            Iniciar Diagnóstico Gratuito
          </button>
          <p className="mt-6 text-sm text-slate-500 font-medium">Leve menos de 2 minutos • Sem cartão de crédito</p>
        </div>
      </section>
      
      <footer className="py-12 border-t border-white/5 bg-night-950 text-center relative z-10">
        <div className="container mx-auto px-6">
            <div className="flex justify-center mb-8">
               <Logo />
            </div>

            {/* Redes Sociais */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
                <a href="https://instagram.com/sonoscorepro" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors">
                    <Instagram size={20} />
                    <span className="font-medium">@sonoscorepro</span>
                </a>
                <a href="https://tiktok.com/@sonoscorepro" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                    <TikTokIcon className="w-5 h-5" />
                    <span className="font-medium">@sonoscorepro</span>
                </a>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-slate-500 text-sm mb-4">
                © 2025 SonoScore-Pro. Todos os direitos reservados.
              </p>
              <p className="text-slate-600 text-xs max-w-3xl mx-auto leading-relaxed px-4">
                <strong>Aviso Legal de Saúde:</strong> O conteúdo fornecido pelo SonoScore-Pro é estritamente para fins informativos e educativos e não constitui aconselhamento médico, diagnóstico ou tratamento. As estratégias de higiene do sono sugeridas são baseadas em práticas de bem-estar geral. Este aplicativo não substitui a consulta com médicos ou especialistas do sono. Se você suspeita que tem um distúrbio do sono ou qualquer outra condição médica, procure sempre a orientação de um profissional de saúde qualificado.
              </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

// Helper icon
const BookIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);