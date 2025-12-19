"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, CheckCircle, RotateCcw, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  activationToken: string;
  onVerificationSuccess: () => void;
}

export default function OTPModal({ isOpen, onClose, email, activationToken, onVerificationSuccess }: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer pour le countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Reset quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError(null);
      setTimeLeft(300);
      setCanResend(false);
      // Focus sur le premier input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtp(newOtp);
      setError(null);
      // Focus sur le dernier champ
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await apiClient.post('/auth/activate', {
        activateToken: activationToken,
        otp: otpCode,
      });

      // Succès
      onVerificationSuccess();
    } catch (error: any) {
      console.error('Erreur vérification OTP:', error);
      
      let errorMessage = 'Code de vérification invalide';
      if (error.response?.data) {
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message || error.response.data.error;
      }
      
      setError(errorMessage);
      
      // Réinitialiser le code pour une nouvelle saisie
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);

    try {
      await apiClient.post('/auth/send-activation-code', {
        email: email,
      });

      // Reset le timer
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      // Focus sur le premier input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      console.error('Erreur renvoi code:', error);
      setError('Erreur lors du renvoi du code');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 10, scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6 text-white text-center">
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Vérifiez votre email</h2>
            <p className="text-green-100">
              Nous avons envoyé un code de vérification à
            </p>
            <p className="font-medium text-white">{email}</p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Saisissez le code à 6 chiffres
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors"
                    disabled={isVerifying}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expire dans{' '}
                  <span className="font-mono font-medium text-orange-600">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">
                  ⏰ Code expiré
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={otp.join('').length !== 6 || isVerifying}
              className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Vérifier le code</span>
                </>
              )}
            </button>

            {/* Resend Section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Vous n'avez pas reçu le code ?
              </p>
              
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Renvoyer le code</span>
                    </>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Vous pourrez renvoyer le code dans {formatTime(timeLeft)}
                </p>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Conseils :</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Vérifiez votre dossier spam/courriers indésirables</li>
                    <li>• Le code est valable 5 minutes</li>
                    <li>• Vous pouvez coller le code directement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}