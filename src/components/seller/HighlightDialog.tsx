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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

interface HighlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

const PRICE_PER_DAY = 197;
const MIN_DAYS = 1;
const MAX_DAYS = 30;

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
          {/* Days Selection with Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Duração do destaque</Label>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{selectedDays}</span>
                <span className="text-muted-foreground ml-1">dia{selectedDays > 1 ? "s" : ""}</span>
              </div>
            </div>
            <Slider
              value={[selectedDays]}
              onValueChange={(value) => setSelectedDays(value[0])}
              min={MIN_DAYS}
              max={MAX_DAYS}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 dia</span>
              <span>30 dias</span>
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
