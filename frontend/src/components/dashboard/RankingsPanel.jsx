import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

const RankingsPanel = () => {
    const [rankings, setRankings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('college');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await API.get('/scores/rankings');
                setRankings(data.data);
            } catch {
                setRankings(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="card p-6 animate-pulse h-72" />;
    if (!rankings) return null;

    const rankIcons = [
        <Crown className="w-5 h-5 text-yellow-500" />,
        <Medal className="w-5 h-5 text-gray-400" />,
        <Medal className="w-5 h-5 text-amber-700" />,
    ];

    const departments = Object.keys(rankings.departmentTop3 || {});

    return (
        <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-accent-500" />
                <h3 className="text-sm font-bold text-dark-800">Rankings</h3>
            </div>

            <div className="flex gap-1 mb-4 bg-dark-50 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('college')}
                    className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${activeTab === 'college' ? 'bg-white text-primary-700 shadow-sm' : 'text-dark-500'}`}
                >
                    College Top 5
                </button>
                <button
                    onClick={() => setActiveTab('department')}
                    className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${activeTab === 'department' ? 'bg-white text-primary-700 shadow-sm' : 'text-dark-500'}`}
                >
                    Dept Top 3
                </button>
            </div>

            {activeTab === 'college' && (
                <div className="space-y-2">
                    {rankings.collegeTop5.map((f, i) => (
                        <Link key={f._id} to={`/faculty/${f._id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-50 transition-all group">
                            <div className="flex-shrink-0 w-8 text-center">
                                {i < 3 ? rankIcons[i] : <span className="text-xs font-bold text-dark-400">#{i + 1}</span>}
                            </div>
                            {f.profilePicture ? (
                                <img src={f.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                                    {f.name?.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-dark-800 truncate group-hover:text-primary-700">{f.name}</p>
                                <p className="text-xs text-dark-400">{f.department}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-accent-500" />
                                <span className="text-sm font-bold text-dark-700">{f.score}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {activeTab === 'department' && (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {departments.map(dept => (
                        <div key={dept}>
                            <p className="text-xs font-bold text-primary-700 mb-2 uppercase tracking-wider">{dept}</p>
                            <div className="space-y-1">
                                {rankings.departmentTop3[dept].map((f, i) => (
                                    <Link key={f._id} to={`/faculty/${f._id}`}
                                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-50 transition-all group">
                                        <span className="text-xs font-bold text-dark-300 w-5">#{i + 1}</span>
                                        <span className="text-sm text-dark-700 group-hover:text-primary-700 flex-1 truncate">{f.name}</span>
                                        <span className="text-xs font-bold text-dark-500">{f.score}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RankingsPanel;
