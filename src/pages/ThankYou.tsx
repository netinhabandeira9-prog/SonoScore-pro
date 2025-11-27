import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id') || 'unknown';

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: R$9,90,                  
        currency: 'BRL',
        content_name: 'SonoScore Pro - Relatório Completo',
        transaction_id: paymentId,
      });
    }
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-night-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold mb-4">Pagamento Confirmado!</h1>
        <p className="text-xl text-gray-300 mb-8">
          Seu relatório completo já está liberado. Volte para o app e aproveite seu SonoScore Pro.
        </p>
        <a
          href="/"
          className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition"
        >
          Voltar para o App
        </a>
      </div>
    </div>
  );
}
