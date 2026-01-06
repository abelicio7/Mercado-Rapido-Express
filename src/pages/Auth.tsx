import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Store, User, ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpg";

// Validation schemas
const emailSchema = z.string().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(72);
const nameSchema = z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100);
const phoneSchema = z.string().regex(/^(\+?258)?[0-9]{9}$/, "Número de telefone inválido").optional().or(z.literal(""));

const provinces = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Niassa",
  "Cabo Delgado",
];

type AuthMode = "login" | "signup-select" | "signup-cliente" | "signup-vendedor";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = (isVendedor: boolean) => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    try {
      nameSchema.parse(fullName);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.fullName = e.errors[0].message;
      }
    }

    if (phone) {
      try {
        phoneSchema.parse(phone);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.phone = e.errors[0].message;
        }
      }
    }

    if (isVendedor) {
      if (!storeName.trim()) {
        newErrors.storeName = "Nome da loja é obrigatório";
      }
      if (!whatsapp.trim()) {
        newErrors.whatsapp = "WhatsApp é obrigatório para vendedores";
      }
      if (!storeAddress.trim()) {
        newErrors.storeAddress = "Endereço da loja é obrigatório";
      }
      if (!province) {
        newErrors.province = "Província é obrigatória";
      }
      if (!city.trim()) {
        newErrors.city = "Cidade é obrigatória";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorrectos" 
          : error.message,
      });
    } else {
      toast({
        title: "Bem-vindo!",
        description: "Login efectuado com sucesso.",
      });
      navigate("/");
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent, userType: "cliente" | "vendedor") => {
    e.preventDefault();
    if (!validateSignup(userType === "vendedor")) return;
    
    setLoading(true);
    
    const metadata: Record<string, string> = {
      full_name: fullName.trim(),
      user_type: userType,
    };

    if (phone) metadata.phone = phone.trim();
    
    if (userType === "vendedor") {
      metadata.whatsapp = whatsapp.trim();
      metadata.store_name = storeName.trim();
      metadata.store_address = storeAddress.trim();
      metadata.province = province;
      metadata.city = city.trim();
    }
    
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: metadata,
      },
    });
    
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes("already registered")) {
        errorMessage = "Este email já está registado. Tente fazer login.";
      }
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: errorMessage,
      });
    } else {
      toast({
        title: "Conta criada!",
        description: userType === "vendedor" 
          ? "Bem-vindo ao Mercado Rápido Express! Sua loja está pronta." 
          : "Bem-vindo ao Mercado Rápido Express!",
      });
      navigate("/");
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setWhatsapp("");
    setStoreName("");
    setStoreAddress("");
    setProvince("");
    setCity("");
    setErrors({});
  };

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={errors.password ? "border-destructive" : ""}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Entrar
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Não tem conta?{" "}
          <button
            type="button"
            onClick={() => { resetForm(); setMode("signup-select"); }}
            className="text-primary hover:underline font-medium"
          >
            Criar conta
          </button>
        </p>
      </div>
    </form>
  );

  const renderSignupSelect = () => (
    <div className="space-y-6">
      <p className="text-center text-muted-foreground">
        Como deseja usar o Mercado Rápido Express?
      </p>
      
      <div className="grid gap-4">
        <button
          onClick={() => setMode("signup-cliente")}
          className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary transition-all text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Sou Cliente</h3>
            <p className="text-sm text-muted-foreground">
              Quero encontrar produtos e lojas perto de mim
            </p>
          </div>
        </button>
        
        <button
          onClick={() => setMode("signup-vendedor")}
          className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary transition-all text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-whatsapp/10 flex items-center justify-center">
            <Store className="h-7 w-7 text-whatsapp" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Sou Vendedor</h3>
            <p className="text-sm text-muted-foreground">
              Quero criar minha loja e vender meus produtos
            </p>
          </div>
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={() => { resetForm(); setMode("login"); }}
            className="text-primary hover:underline font-medium"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );

  const renderSignupCliente = () => (
    <form onSubmit={(e) => handleSignup(e, "cliente")} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Seu nome completo"
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone (opcional)</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+258 84 000 0000"
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={errors.password ? "border-destructive" : ""}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Criar conta de cliente
      </Button>
    </form>
  );

  const renderSignupVendedor = () => (
    <form onSubmit={(e) => handleSignup(e, "vendedor")} className="space-y-4">
      <div className="bg-gold/10 border border-gold/20 rounded-lg p-3 text-sm">
        <p className="font-medium text-gold-foreground">🎁 15 dias grátis para testar!</p>
        <p className="text-muted-foreground">Crie sua loja agora e comece a vender.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="fullName">Seu nome completo</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome"
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="84 000 0000"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp *</Label>
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="84 000 0000"
            className={errors.whatsapp ? "border-destructive" : ""}
          />
          {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="storeName">Nome da loja *</Label>
          <Input
            id="storeName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Nome da sua loja"
            className={errors.storeName ? "border-destructive" : ""}
          />
          {errors.storeName && <p className="text-sm text-destructive">{errors.storeName}</p>}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="storeAddress">Endereço da loja *</Label>
          <Input
            id="storeAddress"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            placeholder="Rua, número, bairro"
            className={errors.storeAddress ? "border-destructive" : ""}
          />
          {errors.storeAddress && <p className="text-sm text-destructive">{errors.storeAddress}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Província *</Label>
          <select
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.province ? "border-destructive" : "border-input"}`}
          >
            <option value="">Selecione</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Sua cidade"
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={errors.password ? "border-destructive" : ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
      </div>
      
      <Button type="submit" className="w-full bg-whatsapp hover:bg-whatsapp/90" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Store className="h-4 w-4 mr-2" />}
        Criar minha loja
      </Button>
    </form>
  );

  const getTitle = () => {
    switch (mode) {
      case "login": return "Entrar";
      case "signup-select": return "Criar conta";
      case "signup-cliente": return "Criar conta de cliente";
      case "signup-vendedor": return "Criar sua loja";
    }
  };

  const showBackButton = mode !== "login" && mode !== "signup-select";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={logo} 
            alt="Mercado Rápido Express" 
            className="h-16 w-auto mx-auto rounded-xl mb-4"
          />
          <h1 className="font-display text-2xl font-bold">{getTitle()}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            O marketplace de Moçambique 🇲🇿
          </p>
        </div>
        
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-soft p-6 border border-border">
          {showBackButton && (
            <button
              onClick={() => setMode("signup-select")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          )}
          
          {mode === "login" && renderLogin()}
          {mode === "signup-select" && renderSignupSelect()}
          {mode === "signup-cliente" && renderSignupCliente()}
          {mode === "signup-vendedor" && renderSignupVendedor()}
        </div>
      </div>
    </div>
  );
};

export default Auth;