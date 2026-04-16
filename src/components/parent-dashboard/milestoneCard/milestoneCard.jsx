import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";
import { format } from "date-fns";

export function MilestoneCard({ title, description, date, image }) {
  const formatDate = (date) => {
    return format(date, "MMM d, yyyy");
  };
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 rounded-2xl hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{formatDate(date)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {image ? (
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src={image} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-card-foreground mb-2 text-balance leading-tight">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                {description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
