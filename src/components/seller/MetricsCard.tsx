import { LucideIcon, Loader2 } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  loading?: boolean;
  variant?: "default" | "primary" | "success" | "whatsapp" | "gold";
}

const MetricsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  loading = false,
  variant = "default" 
}: MetricsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
          valueColor: "text-primary",
        };
      case "success":
        return {
          iconBg: "bg-success/10",
          iconColor: "text-success",
          valueColor: "text-success",
        };
      case "whatsapp":
        return {
          iconBg: "bg-whatsapp/10",
          iconColor: "text-whatsapp",
          valueColor: "text-whatsapp",
        };
      case "gold":
        return {
          iconBg: "bg-gold/10",
          iconColor: "text-gold",
          valueColor: "text-gold",
        };
      default:
        return {
          iconBg: "bg-muted",
          iconColor: "text-muted-foreground",
          valueColor: "text-foreground",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <p className={`text-3xl font-bold ${styles.valueColor}`}>
              {value.toLocaleString("pt-MZ")}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;