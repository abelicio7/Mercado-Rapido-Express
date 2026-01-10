import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "./StarRating";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, MessageSquare, User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ReviewsListProps {
  storeId: string;
  refreshTrigger: number;
}

const ReviewsList = ({ storeId, refreshTrigger }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [storeId, refreshTrigger]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("store_reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile names separately
      if (data && data.length > 0) {
        const userIds = data.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const reviewsWithProfiles = data.map((review) => ({
          ...review,
          profiles: profiles?.find((p) => p.user_id === review.user_id),
        }));

        setReviews(reviewsWithProfiles);

        // Calculate average rating
        const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setReviews([]);
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-muted/30 rounded-xl p-8 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Esta loja ainda não possui avaliações.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Seja o primeiro a avaliar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{averageRating}</div>
            <StarRating rating={Math.round(averageRating)} size="sm" />
          </div>
          <div className="text-sm text-muted-foreground">
            Baseado em {reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-card rounded-xl p-5 shadow-sm border"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {review.profiles?.avatar_url ? (
                  <img
                    src={review.profiles.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium truncate">
                    {review.profiles?.full_name || "Usuário"}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <StarRating rating={review.rating} size="sm" />

                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
