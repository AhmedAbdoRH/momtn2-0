
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] text-white p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          رجوع
        </button>

        <h1 className="text-2xl font-bold mb-6">سياسة الخصوصية</h1>

        <div className="space-y-6 text-white/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">مقدمة</h2>
            <p>مرحبًا بك في تطبيق ممتن. نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها وحمايتها.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">المعلومات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>معلومات الحساب: البريد الإلكتروني والاسم وصورة الملف الشخصي</li>
              <li>المحتوى: الصور والتعليقات والرسائل التي تشاركها</li>
              <li>بيانات الاستخدام: كيفية تفاعلك مع التطبيق</li>
              <li>معلومات الجهاز: نوع الجهاز ونظام التشغيل</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>تقديم خدمات التطبيق وتحسينها</li>
              <li>إرسال الإشعارات المتعلقة بحسابك</li>
              <li>ضمان أمان التطبيق ومنع الاحتيال</li>
              <li>التواصل معك بشأن التحديثات والميزات الجديدة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">مشاركة المعلومات</h2>
            <p>لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>بموافقتك الصريحة</li>
              <li>للامتثال للمتطلبات القانونية</li>
              <li>لحماية حقوقنا وسلامة مستخدمينا</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">حماية البيانات</h2>
            <p>نستخدم تقنيات تشفير متقدمة وإجراءات أمنية لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">حقوقك</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>الوصول إلى بياناتك الشخصية وتعديلها</li>
              <li>طلب حذف حسابك وبياناتك</li>
              <li>إلغاء الاشتراك في الإشعارات</li>
              <li>تصدير بياناتك</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">التحديثات</h2>
            <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر التطبيق أو البريد الإلكتروني.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">تواصل معنا</h2>
            <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر التطبيق.</p>
          </section>
        </div>

        <p className="text-white/40 text-xs mt-8 text-center">آخر تحديث: فبراير 2026</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
