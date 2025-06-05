
import React from 'react';

interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
  onViewPolicy: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ onAccept, onDecline, onViewPolicy }) => {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex min-h-full items-center justify-center p-4">
      {/* Modal Content: bg-white/90 and backdrop-blur-lg are richer than plain bg-white from spec, and fit glassmorphism well. rounded-2xl is fine. */}
      <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200/80">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Gizlilik ve Veri Kullanımı</h2>
        <p className="text-sm text-slate-600 mb-3">
          Uygulamamızı kullanarak, video ve sesli görüşmelerinizin gerçekleştirilmesi amacıyla kamera ve mikrofonunuza erişim izni vermiş olursunuz.
        </p>
        <p className="text-sm text-slate-600 mb-3">
          Ayrıca, hizmet kalitesini artırmak ve teknik sorunları gidermek için bağlantı verileriniz (IP adresi hariç, anonimleştirilmiş bağlantı meta verileri) ve kullanım istatistikleriniz işlenebilir.
        </p>
        <p className="text-sm text-slate-600 mb-6">
          Daha fazla bilgi için lütfen{' '}
          <button onClick={onViewPolicy} className="text-indigo-600 hover:text-indigo-700 font-medium underline focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded-sm">
            Gizlilik Politikamızı
          </button>{' '}
          inceleyin.
        </p>

        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row-reverse sm:gap-4">
          <button
            onClick={onAccept}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95"
          >
            Kabul Et ve Devam Et
          </button>
          <button
            onClick={onDecline}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white/95 text-slate-700 border-2 border-slate-200 hover:border-slate-300 backdrop-blur-sm shadow-md hover:shadow-lg font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95" // Adjusted to SecondaryButton
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;