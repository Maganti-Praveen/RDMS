import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { BarChart2 } from 'lucide-react';

const ScoreCard = ({ facultyId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!facultyId) return;
        const fetch = async () => {
            try {
                const { data: res } = await API.get(`/scores/faculty/${facultyId}`);
                setData(res.data);
            } catch {
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [facultyId]);

    if (loading || !data) return null;

    const categories = [
        { key: 'publications', label: 'Publications', color: 'var(--primary-600)', icon: '📄' },
        { key: 'patents', label: 'Patents', color: 'var(--accent-500)', icon: '💡' },
        { key: 'workshops', label: 'Workshops', color: '#10b981', icon: '🔧' },
        { key: 'seminars', label: 'Seminars', color: '#8b5cf6', icon: '🎤' },
        { key: 'certifications', label: 'Certifications', color: '#f59e0b', icon: '🏅' },
        { key: 'education', label: 'Education', color: '#64748b', icon: '🎓' },
    ];

    const maxCount = Math.max(...categories.map(c => data.counts[c.key] || 0), 1);

    return (
        <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-bold text-dark-800">Research Summary</h3>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white px-4 py-2 rounded-xl shadow-lg">
                    <span className="text-2xl font-extrabold">{data.total}</span>
                    <span className="text-xs opacity-80">total uploads</span>
                </div>
            </div>

            <div className="space-y-3">
                {categories.map(cat => (
                    <div key={cat.key} className="flex items-center gap-3">
                        <span className="text-base">{cat.icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-dark-600">{cat.label}</span>
                                <span className="text-xs font-bold" style={{ color: cat.color }}>
                                    {data.counts[cat.key] || 0}
                                </span>
                            </div>
                            <div className="w-full bg-dark-100 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${((data.counts[cat.key] || 0) / maxCount) * 100}%`,
                                        backgroundColor: cat.color,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScoreCard;
