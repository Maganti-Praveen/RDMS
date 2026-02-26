import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layers } from 'lucide-react';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
    '#84cc16', '#a855f7', '#22d3ee', '#e11d48', '#0ea5e9', '#d946ef', '#facc15'];

const DomainChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data: res } = await API.get('/domains/stats');
                setData(res.data || []);
            } catch {
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="card p-6 animate-pulse h-72" />;
    if (data.length === 0) {
        return (
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-primary-600" />
                    <h3 className="text-sm font-bold text-dark-800">Research Domains</h3>
                </div>
                <p className="text-xs text-dark-400 text-center py-8">No domain data yet. Add research domains to publications to see analytics.</p>
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-primary-600" />
                <h3 className="text-sm font-bold text-dark-800">Research Domains</h3>
                <span className="ml-auto text-xs text-dark-400">{total} publications</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="domain"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={2}
                        label={({ domain, percent }) => `${domain} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} publications`, name]} />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-2">
                {data.slice(0, 5).map((d, i) => (
                    <span key={d.domain} className="inline-flex items-center gap-1.5 text-xs font-medium text-dark-600 bg-dark-50 px-2 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {d.domain}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default DomainChart;
