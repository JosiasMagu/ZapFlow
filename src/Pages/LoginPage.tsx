import React, { useState } from 'react'
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  Shield, Zap, BarChart3, CheckCircle, ArrowLeft,
  Chrome, Github,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpeg'
import { loginWithEmail } from '../lib/api'   // <-- IMPORTANTE

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'
type WithChildren = { children?: React.ReactNode; className?: string }

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
}
const Button: React.FC<ButtonProps> = ({
  children, className = '', variant = 'default', size = 'default', ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:opacity-50 disabled:pointer-events-none'
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-green-500 text-black hover:bg-green-400',
    outline: 'border border-green-500/30 bg-transparent text-green-400 hover:bg-green-500 hover:text-black',
    ghost: 'hover:bg-green-500/10 text-gray-300 hover:text-green-400',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
  }
  const sizes: Record<ButtonSize, string> = {
    default: 'h-10 py-2 px-4', sm: 'h-9 px-3 text-xs', lg: 'h-11 px-8 text-base', icon: 'h-10 w-10',
  }
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { className?: string }
const Input: React.FC<InputProps> = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-green-500/20 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-colors ${className}`}
    {...props}
  />
)

const Card: React.FC<WithChildren> = ({ children, className = '' }) =>
  <div className={`rounded-lg border border-green-500/20 bg-gray-900/50 backdrop-blur-sm shadow-lg ${className}`}>{children}</div>

const CardHeader: React.FC<WithChildren> = ({ children, className = '' }) =>
  <div className={`flex flex-col space-y-1.5 p-5 ${className}`}>{children}</div>

const CardContent: React.FC<WithChildren> = ({ children, className = '' }) =>
  <div className={`p-5 pt-0 ${className}`}>{children}</div>

const CardTitle: React.FC<WithChildren> = ({ children, className = '' }) =>
  <h3 className={`text-2xl font-semibold leading-none tracking-tight text-white ${className}`}>{children}</h3>

const CardDescription: React.FC<WithChildren> = ({ children, className = '' }) =>
  <p className={`text-sm text-gray-400 ${className}`}>{children}</p>

type AlertVariant = 'default' | 'destructive'
const Alert: React.FC<WithChildren & { variant?: AlertVariant }> = ({ children, className = '', variant = 'default' }) => {
  const variants: Record<AlertVariant, string> = {
    default: 'bg-green-500/10 border-green-500/30 text-green-300',
    destructive: 'bg-red-500/10 border-red-500/30 text-red-300',
  }
  return <div className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}>{children}</div>
}

const Separator: React.FC<{ className?: string }> = ({ className = '' }) =>
  <div className={`shrink-0 bg-green-500/20 h-[1px] w-full ${className}`} />

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await loginWithEmail(email, password)   // <-- cria sessão mock no localStorage
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar.')
    } finally {
      setIsLoading(false)
    }
  }

  const features: { icon: React.ReactNode; text: string }[] = [
    { icon: <BarChart3 className="h-5 w-5" />, text: 'Analytics em tempo real' },
    { icon: <Shield className="h-5 w-5" />, text: 'Segurança enterprise' },
    { icon: <Zap className="h-5 w-5" />, text: 'Automação inteligente' },
  ]

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-green-500/20 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <div className="relative z-10 p-10 w-full flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ZapFlow" className="h-10 w-10 rounded-md object-cover" />
              <span className="text-white text-xl font-bold">ZapFlow Moçambique</span>
            </div>

            <div className="mt-10 max-w-lg">
              <h1 className="text-5xl font-bold text-white mb-5 leading-tight">
                Conecte.<span className="text-green-400"> Automatize.</span><br />Escale.
              </h1>
              <p className="text-lg text-gray-300 mb-7 leading-relaxed">
                A plataforma de automação no-code mais avançada de Moçambique.
                Gerencie bots, campanhas e fluxos com facilidade.
              </p>

              <div className="space-y-3">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="text-green-400">{f.icon}</div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-2 gap-5">
                <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
                  <div className="text-2xl font-bold text-green-400">10K+</div>
                  <div className="text-sm text-gray-400">Automações ativas</div>
                </div>
                <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
                  <div className="text-2xl font-bold text-green-400">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime garantido</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} ZapFlow Moçambique. Todos os direitos reservados.
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center py-8 px-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <img src={logo} alt="ZapFlow" className="h-10 w-10 rounded-md object-cover" />
              <span className="text-white text-xl font-bold">ZapFlow</span>
            </div>

            <Card className="backdrop-blur-xl border-green-500/30 shadow-2xl shadow-green-500/10">
              <CardHeader>
                <CardTitle>Bem-vindo de volta</CardTitle>
                <CardDescription>Entre na sua conta para acessar o painel</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-500" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </Alert>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Endereço de e-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="voce@empresa.co.mz"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoFocus
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input type="checkbox" className="rounded border-green-500/30 bg-black text-green-500 focus:ring-green-400" />
                      Lembrar-me
                    </label>
                    <a href="#" className="text-green-400 hover:text-green-300 transition-colors">Esqueci a senha</a>
                  </div>

                  <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar na plataforma
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex justify-center">
                    <span className="bg-gray-900 px-2 text-xs text-gray-400">ou continue com</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="lg" type="button">
                    <Chrome className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button variant="outline" size="lg" type="button">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar para Home
                  </button>
                  <span className="text-gray-500">
                    Não tem conta?
                    <a href="#" className="text-green-400 hover:text-green-300 ml-1">Criar conta</a>
                  </span>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="#" className="underline hover:text-green-400 transition-colors">Termos de Serviço</a> e{' '}
                  <a href="#" className="underline hover:text-green-400 transition-colors">Política de Privacidade</a>.
                </div>
              </CardContent>
            </Card>

            <div className="mt-5 flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Dados protegidos</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-400" />
                <span>SSL Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
