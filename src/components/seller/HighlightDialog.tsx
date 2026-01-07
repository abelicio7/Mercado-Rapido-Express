import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Check } from "lucide-react";

interface HighlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

const PRICE_PER_DAY = 197;

const dayOptions = [
  { days: 3, label: "3 dias", popular: false },
  { days: 7, label: "7 dias", popular: true },
  { days: 15, label: "15 dias", popular: false },
  { days: 30, label: "30 dias", popular: false },
];

const HighlightDialog = ({
  open,
  onOpenChange,
  productId,
  productName,
  onSuccess,
}: HighlightDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedDays, setSelectedDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "emola">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const totalPrice = selectedDays * PRICE_PER_DAY;

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, "");
    
    if (cleanPhone.length !== 9) {
      return "Número deve ter 9 dígitos";
    }

    if (paymentMethod === "mpesa") {
      if (!/^8[45]/.test(cleanPhone)) {
        return "Para M-Pesa use números 84 ou 85";
      }
    } else {
      if (!/^8[67]/.test(cleanPhone)) {
        return "Para E-Mola use números 86 ou 87";
      }
    }

    return "";
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Deve estar logado para destacar um produto.",
      });
      return;
    }

    const error = validatePhone(phoneNumber);
    if (error) {
      setPhoneError(error);
      return;
    }

    setLoading(true);
    setPhoneError("");

    try {
      const { data, error } = await supabase.functions.invoke("process-highlight-payment", {
        body: {
          userId: user.id,
          productId,
          days: selectedDays,
          paymentMethod,
          phoneNumber: phoneNumber.replace(/\s/g, ""),
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Produto destacado!",
          description: data.message,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(data?.error || "Erro ao processar pagamento");
      }
    } catch (error: any) {
      console.error("Highlight payment error:", error);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-highlight" />
            Destacar Produto
          </DialogTitle>
          <DialogDescription>
            Destaque "{productName}" para aparecer no topo das buscas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Days Selection */}
          <div className="space-y-3">
            <Label>Duração do destaque</Label>
            <div className="grid grid-cols-2 gap-2">
              {dayOptions.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setSelectedDays(option.days)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    selectedDays === option.days
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {option.popular && (
                    <span className="absolute -top-2 right-2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(option.days * PRICE_PER_DAY)}
                  </div>
                  {selectedDays === option.days && (
                    <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Método de pagamento</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => {
                setPaymentMethod(v as "mpesa" | "emola");
                setPhoneError("");
              }}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="mpesa"
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "mpesa"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="mpesa" id="mpesa" />
                <div>
                  <div className="font-medium">M-Pesa</div>
                  <div className="text-xs text-muted-foreground">84, 85</div>
                </div>
              </Label>
              <Label
                htmlFor="emola"
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "emola"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="emola" id="emola" />
                <div>
                  <div className="font-medium">E-Mola</div>
                  <div className="text-xs text-muted-foreground">86, 87</div>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Número de telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setPhoneError("");
              }}
              placeholder={paymentMethod === "mpesa" ? "84 xxx xxxx" : "86 xxx xxxx"}
              className={phoneError ? "border-destructive" : ""}
            />
            {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
            <p className="text-xs text-muted-foreground">
              Receberá um pedido de pagamento no seu telemóvel
            </p>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Destaque por {selectedDays} dias</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !phoneNumber}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A processar...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Pagar {formatPrice(totalPrice)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightDialog;
