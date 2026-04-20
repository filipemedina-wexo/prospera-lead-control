import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PipelineStage {
    name: string;
    count: number;
    value: string;
    color: string;
}

interface PipelineDonutChartProps {
    data: PipelineStage[];
}

export function PipelineDonutChart({ data }: PipelineDonutChartProps) {
    // Transform data for Recharts if needed, or use as is if 'count' is the numeric value
    const chartData = data.map(item => ({
        ...item,
        value: item.count, // expanding 'value' to be the numeric count for the chart
        displayValue: item.value // keeping the formatted currency string
    }));

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-border rounded-lg shadow-lg">
                                        <p className="font-semibold text-sm">{data.name}</p>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <span className="text-xs text-text-secondary">{data.count} leads</span>
                                            <span className="text-xs font-medium text-brand">{data.displayValue}</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
