'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rate-limiter';
import { createOtpChallenge, verifyOtpCode, isDeviceTrusted, trustDevice } from '@/lib/security/otp';
import { generateTokenPair } from '@/lib/security/jwt';
import { createSession, getDeviceFingerprint } from '@/lib/security/session';

export default function LoginPage() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Trigger AN-14 micro-shake on error
  const triggerErrorShake = (message: string) => {
    setIsShaking(true);
    toast.error(message);
    setTimeout(() => setIsShaking(false), 350);
  };

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
      triggerErrorShake('Mohon isi username dan password!');
      return;
    }

    // 1. Security Check: Rate Limiting (OWASP: 5 attempts per 15 min)
    const rateCheck = checkRateLimit(username.trim());
    if (!rateCheck.allowed) {
      triggerErrorShake(
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
        triggerErrorShake(
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

  const fieldShell =
    'relative flex items-center h-12 bg-white rounded-full pl-4 pr-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] focus-within:ring-[3px] focus-within:ring-brand-yellow/80 transition-shadow duration-200';
  const fieldInput =
    'w-full h-full bg-transparent text-[0.875rem] text-gray-900 placeholder:text-gray-500 outline-none';

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md md:max-w-xl mx-auto relative overflow-hidden select-none font-sans">
      {/* TOP: LOGO & WELCOME */}
      <div className="pt-10 pb-5 px-6 flex flex-col items-center text-center animate-fade-in">
        <Image
          src="/assets/images/app_icon.png"
          alt="Logo Klámbi.id"
          width={176}
          height={120}
          priority
          unoptimized
          className="w-28 h-auto object-contain mb-4"
        />
        <h1 className="text-[1.25rem] leading-tight font-normal text-gray-900 tracking-tight animate-slide-up">
          Welcome to <span className="font-bold text-navy">Klámbi.id</span>
        </h1>
      </div>

      {/* NAVY CARD */}
      <div className="mx-4 sm:mx-6 bg-navy-soft rounded-t-[36px] px-5 sm:px-6 pt-7 pb-6 text-white flex-1 flex flex-col animate-slide-up">
        <p className="text-center text-[0.875rem] leading-snug font-normal text-white max-w-[260px] mx-auto">
          {isRegisterMode ? (
            <>
              Daftar akun <span className="font-medium text-brand-yellow">Klámbi.id</span> baru untuk
              mulai merawat & menjual pakaianmu
            </>
          ) : (
            <>
              Masuk akun <span className="font-medium text-brand-yellow">Klámbi.id</span> buat rawat,
              jual & lanjutkan cerita pakaianmu
            </>
          )}
        </p>

        <form
          onSubmit={isRegisterMode ? handleRegister : handleLogin}
          className={`mt-6 space-y-3.5 w-full ${isShaking ? 'animate-shake' : ''}`}
          noValidate
        >
          {isRegisterMode && (
            <div className={fieldShell}>
              <label htmlFor="fullName" className="sr-only">Nama lengkap</label>
              <Icon name="UserIcon" variant="solid" size={18} className="text-gray-900 mr-2.5 flex-shrink-0" aria-hidden="true" />
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Lengkap"
                className={fieldInput}
                required
              />
            </div>
          )}

          <div className={fieldShell}>
            <label htmlFor="username" className="sr-only">Username atau email</label>
            <Icon name="EnvelopeIcon" variant="solid" size={18} className="text-gray-900 mr-2.5 flex-shrink-0" aria-hidden="true" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username atau email"
              className={fieldInput}
              required
            />
          </div>

          <div className={fieldShell}>
            <label htmlFor="password" className="sr-only">Password</label>
            <Icon name="LockClosedIcon" variant="solid" size={18} className="text-gray-900 mr-2.5 flex-shrink-0" aria-hidden="true" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={fieldInput}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 -mr-1 w-10 h-10 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-100 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <Icon name={showPassword ? 'EyeIcon' : 'EyeSlashIcon'} size={19} />
            </button>
          </div>

          {isRegisterMode && (
            <div className={fieldShell}>
              <label htmlFor="confirmPassword" className="sr-only">Konfirmasi password</label>
              <Icon name="LockClosedIcon" variant="solid" size={18} className="text-gray-900 mr-2.5 flex-shrink-0" aria-hidden="true" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi Password"
                className={fieldInput}
                required
              />
            </div>
          )}

          {!isRegisterMode && (
            <div className="flex justify-end -mt-1 pr-3">
              <button
                type="button"
                onClick={() =>
                  toast.info('Untuk demo, gunakan username "admin" dan password "admin"')
                }
                className="text-[0.75rem] font-medium text-brand-yellow underline underline-offset-2 py-1 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <div className="pt-2 px-2 sm:px-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-white text-[#163B2E] font-bold text-[1rem] tracking-wide rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.18)] hover:bg-gray-50 active:scale-[0.97] transition-transform duration-150 ease-out uppercase flex items-center justify-center gap-2 disabled:opacity-80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-yellow"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  <span className="text-base normal-case font-semibold">Memproses...</span>
                </>
              ) : isRegisterMode ? (
                'Daftar'
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-[0.75rem] font-medium text-white my-3">OR</p>

        <div className="grid grid-cols-2 gap-3 px-1 sm:px-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={socialLoading !== null}
            className="h-10 bg-white text-gray-900 font-medium text-[0.8125rem] rounded-full flex items-center justify-center gap-2.5 hover:bg-gray-50 active:scale-[0.97] transition-transform duration-150 disabled:opacity-80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-yellow"
          >
            {socialLoading === 'google' ? (
              <span className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            )}
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            disabled={socialLoading !== null}
            className="h-10 bg-white text-gray-900 font-medium text-[0.8125rem] rounded-full flex items-center justify-center gap-2.5 hover:bg-gray-50 active:scale-[0.97] transition-transform duration-150 disabled:opacity-80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-yellow"
          >
            {socialLoading === 'facebook' ? (
              <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Facebook</span>
          </button>
        </div>

        <div className="pt-7 text-center">
          <p className="text-[0.8125rem] text-white">
            {isRegisterMode ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="font-bold text-brand-yellow hover:underline underline-offset-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded"
            >
              {isRegisterMode ? 'Masuk di sini' : 'Daftar dulu'}
            </button>
          </p>
        </div>
      </div>

      {/* 2FA OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-title"
        >
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 text-gray-900 shadow-2xl relative animate-scale-up space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-navy/5 text-navy rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="ShieldCheckIcon" variant="solid" size={30} aria-hidden="true" />
              </div>
              <h3 id="otp-title" className="text-lg font-semibold text-navy">Verifikasi 2FA</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kami mendeteksi sesi masuk baru. Masukkan 6 digit kode OTP untuk akun{' '}
                <strong className="text-gray-800">{pendingUser?.username}</strong>.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <p className="text-sm text-amber-900">
                Kode OTP demo:{' '}
                <strong className="text-amber-950 font-bold tracking-widest">{activeOtpCode || '123456'}</strong>
              </p>
              <button
                type="button"
                onClick={() => setOtpInput(activeOtpCode || '123456')}
                className="mt-1 text-xs text-navy font-semibold underline underline-offset-2 py-1"
              >
                Isi otomatis
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="text-sm font-medium text-gray-700 block mb-1.5 text-center">
                  Kode OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center text-xl tracking-[0.5em] font-bold py-3 border-2 border-gray-200 rounded-2xl focus:border-navy focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-navy text-white font-semibold text-sm rounded-full hover:bg-navy-deep active:scale-95 transition-all shadow-md"
                >
                  Verifikasi & Lanjutkan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpInput('');
                  }}
                  className="w-full h-11 bg-gray-100 text-gray-700 font-medium text-sm rounded-full hover:bg-gray-200 transition-all"
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
