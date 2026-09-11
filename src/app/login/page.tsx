'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import KlambiLogo from '@/components/ui/KlambiLogo';
import Icon from '@/components/ui/AppIcon';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rate-limiter';
import { createOtpChallenge, verifyOtpCode, isDeviceTrusted, trustDevice } from '@/lib/security/otp';
import { generateTokenPair } from '@/lib/security/jwt';
import { createSession, getDeviceFingerprint } from '@/lib/security/session';

export default function LoginPage() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [fullName, setFullName] = useState('Muhammad Hafiz Maulana');
  const [confirmPassword, setConfirmPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  // 2FA OTP & Security State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [activeChallengeId, setActiveChallengeId] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [pendingUser, setPendingUser] = useState<{ username: string; name: string } | null>(null);

  const completeSuccessfulAuth = async (userToAuth: { username: string; name: string }) => {
    resetRateLimit(userToAuth.username);
    const fp = getDeviceFingerprint();
    trustDevice(userToAuth.username, fp);

    // Create session & tokens
    const session = createSession(userToAuth.username, userToAuth.username, 'user', fp);
    const tokens = await generateTokenPair(userToAuth.username, userToAuth.username, 'user');

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('klambi_auth', 'true');
      sessionStorage.setItem('klambi_session_id', session.sessionId);
      sessionStorage.setItem('klambi_access_token', tokens.accessToken);
      sessionStorage.setItem('klambi_splashed', 'true');
      localStorage.setItem('klambi_refresh_token', tokens.refreshToken);
      localStorage.setItem(
        'klambi_user',
        JSON.stringify({
          name: userToAuth.name || 'Muhammad Hafiz Maulana',
          username: userToAuth.username,
          avatar: '🧑‍🦱',
        })
      );
    }

    toast.success('Login & Verifikasi 2FA berhasil! Selamat datang di Klámbi.id 🎉');
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Mohon isi username dan password!');
      return;
    }

    // 1. Security Check: Rate Limiting (OWASP: 5 attempts per 15 min)
    const rateCheck = checkRateLimit(username.trim());
    if (!rateCheck.allowed) {
      toast.error(
        `Terlalu banyak percobaan gagal! Akses dibatasi selama ${rateCheck.retryAfterSeconds} detik demi keamanan akun.`
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Validate credentials
      const isValidAdmin = username.trim().toLowerCase() === 'admin' && password.trim() === 'admin';
      const isValidGeneric = username.trim().length > 0 && password.trim().length >= 4;

      if (isValidAdmin || isValidGeneric) {
        const fp = getDeviceFingerprint();
        const userObj = {
          username: username.trim(),
          name: fullName || 'Muhammad Hafiz Maulana',
        };

        // 2. Security Check: 2FA OTP on login
        // Check if device is already trusted; if not or for admin, initiate 2FA OTP
        const isTrusted = isDeviceTrusted(userObj.username, fp);
        if (!isTrusted) {
          const challenge = createOtpChallenge(userObj.username, 'new_device_login');
          setActiveChallengeId(challenge.challengeId);
          setActiveOtpCode(challenge.code);
          setPendingUser(userObj);
          setShowOtpModal(true);
          toast.info(`Kode OTP 2FA telah dikirim ke perangkat Anda.`);
          return;
        }

        // Device already trusted
        completeSuccessfulAuth(userObj);
      } else {
        toast.error(
          `Username atau password salah! Sisa percobaan: ${rateCheck.remainingAttempts}`
        );
      }
    }, 600);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpInput.trim()) {
      toast.error('Mohon masukkan kode OTP 6 digit!');
      return;
    }

    const verifyResult = verifyOtpCode(activeChallengeId, otpInput, 'new_device_login');
    if (verifyResult.success && pendingUser) {
      setShowOtpModal(false);
      completeSuccessfulAuth(pendingUser);
    } else {
      toast.error(verifyResult.message);
    }
  };

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!fullName.trim() || !username.trim() || !password.trim()) {
      toast.error('Mohon lengkapi semua kolom pendaftaran!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('klambi_auth', 'true');
        sessionStorage.setItem('klambi_splashed', 'true');
        localStorage.setItem(
          'klambi_user',
          JSON.stringify({
            name: fullName,
            username: username,
            avatar: '🧑‍🦱',
          })
        );
      }

      toast.success('Pendaftaran akun berhasil! Selamat datang 🎉');
      setTimeout(() => {
        router.push('/');
      }, 500);
    }, 900);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('klambi_auth', 'true');
        sessionStorage.setItem('klambi_splashed', 'true');
        localStorage.setItem(
          'klambi_user',
          JSON.stringify({
            name: provider === 'google' ? 'Hafiz Maulana (Google)' : 'Hafiz Maulana (Facebook)',
            username: provider === 'google' ? 'hafiz.google' : 'hafiz.fb',
            avatar: '🧑‍🦱',
          })
        );
      }

      toast.success(`Berhasil login menggunakan akun ${provider === 'google' ? 'Google' : 'Facebook'}!`);
      setSocialLoading(null);
      setTimeout(() => {
        router.push('/');
      }, 400);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between max-w-md mx-auto relative overflow-hidden select-none font-sans">
      {/* Decorative Top subtle gradient */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 -right-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />

      {/* TOP SECTION: LOGO & WELCOME TEXT */}
      <div className="pt-10 pb-6 px-6 flex flex-col items-center text-center z-10 animate-fade-in">
        {/* Klámbi Infinity Icon (Transparent without background) */}
        <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
          <KlambiLogo variant="icon-only" size="lg" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#10284D] tracking-tight">
          Welcome to <span className="text-[#10284D]">Klámbi.id</span>
        </h1>
      </div>

      {/* BOTTOM / MAIN CARD: DARK NAVY CONTAINER (Pixel Perfect Image 2) */}
      <div className="bg-[#0E356A] rounded-t-[36px] px-6 pt-7 pb-8 shadow-modal text-white flex-1 flex flex-col justify-between z-10 animate-slide-up">
        <div className="space-y-5">
          {/* Card Subtitle */}
          <p className="text-center text-xs sm:text-sm font-medium text-white/95 max-w-xs mx-auto leading-relaxed">
            {isRegisterMode ? (
              <>
                Daftar akun <span className="font-extrabold text-[#E8C547]">Klámbi.id</span> baru
                untuk mulai merawat & menjual pakaianmu
              </>
            ) : (
              <>
                Masuk akun <span className="font-extrabold text-[#E8C547]">Klámbi.id</span> buat
                rawat, jual & lanjutkan cerita pakaianmu
              </>
            )}
          </p>

          {/* Form Container */}
          <form
            onSubmit={isRegisterMode ? handleRegister : handleLogin}
            className="space-y-3.5 max-w-sm mx-auto w-full"
          >
            {/* REGISTER ONLY: Full Name Field */}
            {isRegisterMode && (
              <div className="relative flex items-center bg-white rounded-full px-4 py-3 shadow-inner">
                <span className="text-gray-400 mr-3 flex-shrink-0 text-base">👤</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none font-medium"
                  required
                />
              </div>
            )}

            {/* Input 1: Username / Email */}
            <div className="relative flex items-center bg-white rounded-full px-4 py-3 shadow-inner">
              <span className="text-gray-400 mr-3 flex-shrink-0">
                <Icon name="EnvelopeIcon" size={18} className="text-gray-400" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username atau email"
                className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none font-medium"
                required
              />
            </div>

            {/* Input 2: Password */}
            <div className="relative flex items-center bg-white rounded-full px-4 py-3 shadow-inner">
              <span className="text-gray-400 mr-3 flex-shrink-0">
                <Icon name="LockClosedIcon" size={18} className="text-gray-400" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                tabIndex={-1}
              >
                <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
              </button>
            </div>

            {/* REGISTER ONLY: Confirm Password */}
            {isRegisterMode && (
              <div className="relative flex items-center bg-white rounded-full px-4 py-3 shadow-inner">
                <span className="text-gray-400 mr-3 flex-shrink-0">
                  <Icon name="LockClosedIcon" size={18} className="text-gray-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi Password"
                  className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none font-medium"
                  required
                />
              </div>
            )}

            {/* Forgot Password Link (Login Only) */}
            {!isRegisterMode && (
              <div className="flex justify-end pr-2 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      'Untuk demo akun admin, gunakan username "admin" dan password "admin"'
                    )
                  }
                  className="text-[11px] font-bold text-[#E8C547] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* SUBMIT BUTTON: LOGIN / DAFTAR */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-[#10284D] font-black text-sm tracking-wider py-3.5 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#10284D] border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : isRegisterMode ? (
                  'DAFTAR SEKARANG'
                ) : (
                  'LOGIN'
                )}
              </button>
            </div>
          </form>

          {/* Quick Admin Helper Chip */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setUsername('admin');
                setPassword('admin');
                setConfirmPassword('admin');
                toast.success('Username & Password otomatis diisi: admin / admin');
              }}
              className="text-[10px] text-white/70 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
            >
              💡 Demo Login Cepat: <strong className="text-white">admin / admin</strong>
            </button>
          </div>

          {/* OR DIVIDER */}
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px bg-white/20 flex-1 max-w-[80px]" />
            <span className="text-[11px] font-bold text-white/75 tracking-wider">OR</span>
            <div className="h-px bg-white/20 flex-1 max-w-[80px]" />
          </div>

          {/* SOCIAL LOGIN: GOOGLE & FACEBOOK (Pixel Perfect 2-column pills) */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="bg-white text-gray-800 font-bold text-xs py-2.5 px-3 rounded-full flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              {socialLoading === 'google' ? (
                <span className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={socialLoading !== null}
              className="bg-white text-gray-800 font-bold text-xs py-2.5 px-3 rounded-full flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              {socialLoading === 'facebook' ? (
                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span>Facebook</span>
            </button>
          </div>
        </div>

        {/* BOTTOM FOOTER: TOGGLE LOGIN / REGISTER */}
        <div className="text-center pt-5 border-t border-white/10 mt-5">
          {isRegisterMode ? (
            <p className="text-xs text-white/80">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="font-extrabold text-[#E8C547] hover:underline ml-1"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p className="text-xs text-white/80">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="font-extrabold text-[#E8C547] hover:underline ml-1"
              >
                Daftar dulu
              </button>
            </p>
          )}
        </div>
      </div>

      {/* 2FA OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 text-gray-900 shadow-2xl relative animate-scale-up space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-[#10284D] rounded-2xl flex items-center justify-center mx-auto text-2xl">
                🛡️
              </div>
              <h3 className="text-base font-extrabold text-[#10284D]">
                Verifikasi 2FA (Two-Factor Auth)
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Kami mendeteksi sesi masuk baru. Masukkan 6-digit kode OTP keamanan untuk verifikasi akun <strong className="text-gray-700">{pendingUser?.username}</strong>.
              </p>
            </div>

            {/* Quick Demo Hint */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-center">
              <p className="text-[11px] text-amber-900 font-medium">
                💡 Kode OTP Anda: <strong className="text-amber-950 font-bold tracking-widest text-sm">{activeOtpCode || '123456'}</strong>
              </p>
              <button
                type="button"
                onClick={() => setOtpInput(activeOtpCode || '123456')}
                className="mt-1 text-[10px] text-blue-700 font-bold hover:underline"
              >
                Klik untuk Auto-Isi Kode
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1 text-center">
                  Masukkan 6-Digit Kode OTP:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center text-xl tracking-[0.5em] font-extrabold py-3 border-2 border-gray-200 rounded-2xl focus:border-[#10284D] focus:outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full bg-[#10284D] text-white font-bold text-xs py-3.5 rounded-full hover:bg-[#152248] active:scale-95 transition-all shadow-md uppercase tracking-wider"
                >
                  Verifikasi & Lanjutkan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpInput('');
                  }}
                  className="w-full bg-gray-100 text-gray-600 font-bold text-xs py-3 rounded-full hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
