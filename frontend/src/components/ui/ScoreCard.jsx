import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Trophy, TrendingUp, Zap } from 'lucide-react';

const ScoreCard = ({ facultyId }) => {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!facultyId) return;
        const fetch = async () => {
            try {
                const { data } = await API.get(`/scores/faculty/${facultyId}`);
                setScore(data.data);
            } catch {
                setScore(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [facultyId]);

    if (loading || !score) return null;

    const categories = [
        { key: 'publications', label: 'Publications', color: 'var(--primary-600)', icon: '📄' },
        { key: 'patents', label: 'Patents', color: 'var(--accent-500)', icon: '💡' },
        { key: 'workshops', label: 'Workshops', color: '#10b981', icon: '🔧' },
        { key: 'seminars', label: 'Seminars', color: '#8b5cf6', icon: '🎤' },
        { key: 'certifications', label: 'Certifications', color: '#f59e0b', icon: '🏅' },
    ];

    const maxScore = Math.max(...Object.values(score.breakdown), 1);

    return (
        <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent-500" />
                    <h3 className="text-lg font-bold text-dark-800">Research Score</h3>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white px-4 py-2 rounded-xl shadow-lg">
                    <Zap className="w-5 h-5" />
                    <span className="text-2xl font-extrabold">{score.total}</span>
                    <span className="text-xs opacity-80">pts</span>
                </div>
            </div>

            <div className="space-y-3">
                {categories.map(cat => (
                    <div key={cat.key} className="flex items-center gap-3">
                        <span className="text-base">{cat.icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-dark-600">
                                    {cat.label} ({score.counts[cat.key]})
                                </span>
                                <span className="text-xs font-bold" style={{ color: cat.color }}>
                                    {score.breakdown[cat.key]} pts
                                </span>
                            </div>
                            <div className="w-full bg-dark-100 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${(score.breakdown[cat.key] / maxScore) * 100}%`,
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
