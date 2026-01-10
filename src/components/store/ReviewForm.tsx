import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StarRating from "./StarRating";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ReviewFormProps {
  storeId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  };
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ storeId, existingReview, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para avaliar uma loja.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Selecione uma avaliação",
        description: "Por favor, selecione de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }

    // Validate comment length
    if (comment.length > 500) {
      toast({
        title: "Comentário muito longo",
        description: "O comentário deve ter no máximo 500 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("store_reviews")
          .update({
            rating,
            comment: comment.trim() || null,
          })
          .eq("id", existingReview.id);

        if (error) throw error;

        toast({
          title: "Avaliação atualizada!",
          description: "Sua avaliação foi atualizada com sucesso.",
        });
      } else {
        // Create new review
        const { error } = await supabase.from("store_reviews").insert({
          store_id: storeId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        });

        if (error) throw error;

        toast({
          title: "Avaliação enviada!",
          description: "Obrigado por avaliar esta loja.",
        });
      }

      onReviewSubmitted();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/30 rounded-xl p-6 text-center">
        <p className="text-muted-foreground mb-3">
          Faça login para avaliar esta loja
        </p>
        <Button asChild variant="outline">
          <Link to="/auth">Entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-sm border">
      <h3 className="font-semibold mb-4">
        {existingReview ? "Editar sua avaliação" : "Deixe sua avaliação"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Sua nota
          </label>
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onRatingChange={setRating}
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Comentário (opcional)
          </label>
          <Textarea
            placeholder="Conte sua experiência com esta loja..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {existingReview ? "Atualizar avaliação" : "Enviar avaliação"}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
