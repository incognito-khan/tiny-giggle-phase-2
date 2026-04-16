import { Card } from '@/components/ui/card';

export function StatCard({ stat, milestone = false, vaccination = false }) {
    const IconComponent = stat.icon;

    return (
        <>
            <Card className={`${stat.colorClass} rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
                <div className="p-3 md:p-4 space-y-2">
                    <div className="flex items-start justify-between">
                        <IconComponent size={20} className={`flex-shrink-0`} />
                    </div>
                    <div>
                        <p className="text-xs font-medium">{stat.title}</p>
                        <p className="text-lg md:text-xl font-bold mt-1">{stat.value}</p>
                        {stat.subtitle && <p className="text-xs mt-1">{stat.subtitle}</p>}
                    </div>
                </div>
            </Card>
        </>
    );
}
