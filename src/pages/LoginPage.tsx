import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Pelo menos 1 número')
    .regex(/[\W_]/, 'Pelo menos 1 caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { label: 'Letra maiúscula', test: /[A-Z]/ },
    { label: 'Letra minúscula', test: /[a-z]/ },
    { label: 'Número', test: /[0-9]/ },
    { label: 'Caractere especial', test: /[\W_]/ },
  ];

  return (
    <div className="mt-3 space-y-2">
      {requirements.map((req, i) => {
        const passed = password.match(req.test);
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={passed ? 'text-emerald-500' : 'text-gray-400'}>
              {passed ? <Check size={14} /> : <Circle size={14} />}
            </div>
            <span className={passed ? 'text-emerald-600 text-xs' : 'text-gray-400 text-xs'}>
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InputField({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {children}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, register: registerUser, isLoading, error, clearError } = useAuthStore();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = useWatch({
    control: registerForm.control,
    name: 'password',
  }) || '';

  const onLogin = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      console.error('Erro no login:', err);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/');
    } catch (err) {
      console.error('Erro no registro:', err);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-b from-white to-slate-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30"
            >
              <span className="text-white font-bold text-xl">SDR</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">SDR CRM</h1>
            <p className="text-gray-500 mt-1">Gerador de Mensagens com IA</p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between"
                >
                  <span>{error}</span>
                  <button onClick={clearError} className="font-medium hover:text-red-800">×</button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isRegister ? (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4"
                >
                  <InputField label="Nome" error={registerForm.formState.errors.name?.message}>
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      {...registerForm.register('name')}
                      className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </InputField>

                  <InputField label="Email" error={registerForm.formState.errors.email?.message}>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      {...registerForm.register('email')}
                      className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </InputField>

                  <div>
                    <InputField label="Senha" error={registerForm.formState.errors.password?.message}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...registerForm.register('password')}
                        className="w-full h-11 pl-10 pr-12 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </InputField>
                    {passwordValue && <PasswordStrength password={passwordValue} />}
                  </div>

                  <InputField label="Confirmar Senha" error={registerForm.formState.errors.confirmPassword?.message}>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...registerForm.register('confirmPassword')}
                      className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </InputField>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoading ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      'Criar Conta'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                >
                  <InputField label="Email" error={loginForm.formState.errors.email?.message}>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      {...loginForm.register('email')}
                      className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </InputField>

                  <InputField label="Senha" error={loginForm.formState.errors.password?.message}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      className="w-full h-11 pl-10 pr-12 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </InputField>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  >
                    {isLoading ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}