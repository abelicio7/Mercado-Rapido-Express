import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setFavorites(data?.map((f) => f.product_id) || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!user) {
        toast({
          title: "Faça login",
          description: "Você precisa estar logado para salvar favoritos.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const isCurrentlyFavorite = isFavorite(productId);

      try {
        if (isCurrentlyFavorite) {
          // Remove from favorites
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);

          if (error) throw error;

          setFavorites((prev) => prev.filter((id) => id !== productId));
          toast({
            title: "Removido dos favoritos",
            description: "O produto foi removido da sua lista.",
          });
        } else {
          // Add to favorites
          const { error } = await supabase.from("favorites").insert({
            user_id: user.id,
            product_id: productId,
          });

          if (error) throw error;

          setFavorites((prev) => [...prev, productId]);
          toast({
            title: "Adicionado aos favoritos",
            description: "O produto foi salvo na sua lista.",
          });
        }
      } catch (error: any) {
        console.error("Error toggling favorite:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar os favoritos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [user, isFavorite, toast]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    loading,
    refetch: fetchFavorites,
  };
};
