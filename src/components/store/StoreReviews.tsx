import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";

interface StoreReviewsProps {
  storeId: string;
}

interface ExistingReview {
  id: string;
  rating: number;
  comment: string | null;
}

const StoreReviews = ({ storeId }: StoreReviewsProps) => {
  const { user } = useAuth();
  const [existingReview, setExistingReview] = useState<ExistingReview | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserReview();
    }
  }, [user, storeId]);

  const fetchUserReview = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("store_reviews")
      .select("id, rating, comment")
      .eq("store_id", storeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setExistingReview(data);
    }
  };

  const handleReviewSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
    fetchUserReview();
  };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-xl font-semibold">Avaliações da Loja</h2>

      <div className="grid md:grid-cols-[1fr,2fr] gap-8">
        {/* Review Form */}
        <div>
          <ReviewForm
            storeId={storeId}
            existingReview={existingReview}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>

        {/* Reviews List */}
        <div>
          <ReviewsList storeId={storeId} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default StoreReviews;
