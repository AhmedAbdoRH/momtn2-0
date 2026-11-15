import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinPage() {
  const { inviteCode: paramCode, '*': wildcardCode } = useParams<{ inviteCode?: string; '*'?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // استخراج كود الدعوة من المسار أو معاملات الاستعلام
  const rawCode = (searchParams.get('code') || paramCode || wildcardCode || '').trim();
  const code = decodeURIComponent(rawCode).trim();

  // رابط Chrome Intent الرسمي للأندرويد لفتح التطبيق مباشرة وتجاوز حظر المتصفح
  const androidIntentUrl = code
    ? `intent://join/${encodeURIComponent(code)}#Intent;scheme=momtn;package=com.momtn.app;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.momtn.app;end`
    : `intent://#Intent;scheme=momtn;package=com.momtn.app;end`;

  // رابط iOS / Custom Scheme
  const iosSchemeUrl = code ? `momtn://join/${encodeURIComponent(code)}` : 'momtn://';

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const appLaunchUrl = isAndroid ? androidIntentUrl : iosSchemeUrl;
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.momtn.app';

  useEffect(() => {
    if (code) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        // محاولة الفتح التلقائي عند الدخول
        const timer = setTimeout(() => {
          try {
            window.location.href = appLaunchUrl;
          } catch (e) {
            console.error('Auto redirect error:', e);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [code, appLaunchUrl]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('تم نسخ كود الدعوة');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#1a0f18] via-[#140a12] to-[#0a0509] text-white">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#ff535f]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-[#ff535f]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Heart Logo */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#ff535f] to-[#ff7b85] flex items-center justify-center shadow-lg shadow-[#ff535f]/30 mb-5 animate-pulse">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-wide">
          تطبيق ممتن
        </h1>
        <p className="text-white/70 text-sm sm:text-base mb-6 leading-relaxed">
          أنت مدعو للانضمام إلى مساحة مشتركة جديدة لمشاركة الصور والذكريات الجميلة ✨
        </p>

        {code ? (
          <div className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 mb-6">
            <span className="text-xs text-white/50 block mb-1 font-medium">كود الدعوة</span>
            <div className="flex items-center justify-between gap-2 px-2">
              <span className="text-2xl font-black tracking-widest text-[#ff535f] select-all font-mono">
                {code}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 py-1 text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Action Buttons - Real anchor tags to prevent browser popup blocking */}
        <div className="w-full space-y-3">
          <a
            href={appLaunchUrl}
            className="w-full h-12 py-3 bg-gradient-to-r from-[#ff535f] to-[#ff3b4b] hover:from-[#ff3b4b] hover:to-[#ff2839] text-white font-bold rounded-2xl shadow-lg shadow-[#ff535f]/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 text-base no-underline"
          >
            <ExternalLink className="w-5 h-5" />
            فتح في تطبيق ممتن
          </a>

          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 py-3 bg-white/10 hover:bg-white/15 text-white/90 hover:text-white font-medium rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 text-sm no-underline"
          >
            <Download className="w-4 h-4" />
            تحميل التطبيق من Google Play
          </a>

          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full text-white/50 hover:text-white/80 text-xs pt-2"
          >
            المتابعة عبر المتصفح
          </Button>
        </div>
      </div>
    </div>
  );
}
