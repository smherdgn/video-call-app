
import React from 'react';
import { ArrowLeftIcon } from '../components/icons'; // Assuming icons are in components

interface PrivacyPolicyScreenProps {
  onReturn: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onReturn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 sm:p-6 md:p-8">
      {/* Using rounded-2xl for main screen cards is a common and acceptable enhancement over rounded-xl for prominence */}
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl p-6 sm:p-8"> {/* Adjusted to Card Pattern, p-6, space-y-6 (implicitly by content) */}
        <button
          onClick={onReturn}
          className="mb-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white/95 text-slate-700 border-2 border-slate-200 hover:border-slate-300 backdrop-blur-sm shadow-md hover:shadow-lg font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95 text-sm" // Adjusted to SecondaryButton, kept text-sm for compactness
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Geri Dön
        </button>

        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Gizlilik Politikası</h1>
        
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p><strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR')}</p>

          <h2 className="text-xl font-semibold text-indigo-600 mt-4">1. Giriş</h2>
          <p>
            Bu Gizlilik Politikası, Video Call Uygulaması ("Uygulama", "Hizmet") olarak sunduğumuz hizmetler kapsamında kişisel verilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklamaktadır. Uygulamamızı kullanarak bu politikada belirtilen şartları kabul etmiş sayılırsınız.
          </p>

          <h2 className="text-xl font-semibold text-indigo-600 mt-4">2. Topladığımız Veriler</h2>
          <p>
            <strong>a. Hesap Bilgileri:</strong> Uygulamaya giriş yaparken sağladığınız e-posta adresi gibi bilgiler.
          </p>
          <p>
            <strong>b. Medya Erişimi:</strong> Video ve sesli görüşmelerin yapılabilmesi için kamera ve mikrofonunuza erişim. Bu erişim yalnızca siz bir çağrı başlattığınızda veya bir çağrıya katıldığınızda aktif olur ve çağrı süresince devam eder. Görüntü ve ses verileriniz şifrelenerek doğrudan karşı tarafa (peer-to-peer) iletilir ve sunucularımızda saklanmaz.
          </p>
          <p>
            <strong>c. Bağlantı ve Kullanım Verileri (Anonimleştirilmiş):</strong> Hizmet kalitesini sağlamak, teknik sorunları gidermek ve kullanıcı deneyimini iyileştirmek amacıyla çağrı süresi, bağlantı kalitesi gibi anonimleştirilmiş teknik meta veriler ve genel kullanım istatistikleri toplanabilir. IP adresleriniz saklanmaz veya doğrudan kullanıcılarla ilişkilendirilmez; bağlantı için geçici olarak kullanılabilir ancak kalıcı olarak loglanmaz.
          </p>
           <p>
            <strong>d. Çerezler ve Yerel Depolama:</strong> Oturum yönetimi ve kullanıcı tercihlerinizi (örneğin, gizlilik onayı) hatırlamak için çerezler veya tarayıcınızın yerel depolama alanı kullanılabilir.
          </p>

          <h2 className="text-xl font-semibold text-indigo-600 mt-4">3. Verilerin Kullanım Amaçları</h2>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Video ve sesli iletişim hizmetlerini sunmak.</li>
            <li>Kullanıcı hesaplarını yönetmek ve kimlik doğrulamak.</li>
            <li>Hizmetlerimizi geliştirmek, analiz etmek ve iyileştirmek.</li>
            <li>Teknik destek sağlamak ve sorunları gidermek.</li>
            <li>Yasal yükümlülüklere uymak.</li>
          </ul>

          <h2 className="text-xl font-semibold text-indigo-600 mt-4">4. Veri Güvenliği</h2>
          <p>
            Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri (örneğin, WebRTC için DTLS-SRTP ile şifreleme, HTTPS) alıyoruz. Ancak, internet üzerinden hiçbir veri aktarım yönteminin %100 güvenli olmadığını lütfen unutmayın. Kişisel verilerinizi korumak için makul çabayı göstersek de mutlak güvenliği garanti edemeyiz. IP adreslerinizin sızmasını önlemek için bağlantılarınız mümkün olduğunca TURN sunucuları üzerinden yönlendirilir (relay).
          </p>

          <h2 className="text-xl font-semibold text-indigo-600 mt-4">5. Veri Paylaşımı</h2>
          <p>
            Kişisel verileriniz, yasal zorunluluklar veya yetkili makamların talepleri dışında üçüncü taraflarla paylaşılmaz. Çağrı sırasında görüntü ve ses verileriniz doğrudan görüştüğünüz kişiyle paylaşılır.
          </p>
          
          <h2 className="text-xl font-semibold text-indigo-600 mt-4">6. Haklarınız</h2>
          <p>
            KVKK ve GDPR gibi ilgili veri koruma yasaları kapsamında kişisel verilerinize erişme, düzeltme, silme veya işlenmesine itiraz etme gibi haklarınız bulunmaktadır. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.
          </p>

          <h2 className="text-xl font-semibold text-indigo-600 mt-4">7. Politikadaki Değişiklikler</h2>
          <p>
            Bu Gizlilik Politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada yayınlanacak ve önemli değişiklikler size bildirilecektir.
          </p>

          <h2 className="text-xl font-semibold text-indigo-600 mt-4">8. İletişim</h2>
          <p>
            Gizlilik politikamızla ilgili sorularınız için lütfen [email protected] adresinden bizimle iletişime geçin. (Bu bir örnek e-posta adresidir.)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
