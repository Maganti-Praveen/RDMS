import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
    BookOpen, Lightbulb, Award, Briefcase, Mic, GraduationCap,
    ArrowRight, TrendingUp, Clock, FileText
} from 'lucide-react';
import ReminderBanner from '../components/ui/ReminderBanner';

const Home = () => {
    const { user } = useAuth();
    const [recentPubs, setRecentPubs] = useState([]);
    const [recentPatents, setRecentPatents] = useState([]);
    const [recentWorkshops, setRecentWorkshops] = useState([]);
    const [recentSeminars, setRecentSeminars] = useState([]);
    const [recentCerts, setRecentCerts] = useState([]);
    const [education, setEducation] = useState([]);
    const [loading, setLoading] = useState(true);
    // Real totals (separate from the sliced « recent » lists shown below)
    const [totals, setTotals] = useState({ pubs: 0, patents: 0, workshops: 0, seminars: 0, certs: 0 });

    const facultyId = user?._id;

    useEffect(() => {
        if (facultyId) fetchAll();
    }, [facultyId]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [pubRes, patRes, wsRes, semRes, certRes, eduRes] = await Promise.all([
                API.get(`/publications/faculty/${facultyId}`),
                API.get(`/patents/faculty/${facultyId}`),
                API.get(`/workshops/faculty/${facultyId}`),
                API.get(`/seminars/faculty/${facultyId}`),
                API.get(`/certifications/${facultyId}`),
                API.get(`/education/${facultyId}`),
            ]);
            const allPubs = pubRes.data.data;
            const allPatents = patRes.data.data;
            const allWorkshops = wsRes.data.data;
            const allSeminars = semRes.data.data;
            const allCerts = certRes.data.data;
            // Store real totals first
            setTotals({
                pubs: allPubs.length,
                patents: allPatents.length,
                workshops: allWorkshops.length,
                seminars: allSeminars.length,
                certs: allCerts.length,
            });
            // Then slice for the recent display lists
            setRecentPubs(allPubs.slice(0, 5));
            setRecentPatents(allPatents.slice(0, 5));
            setRecentWorkshops(allWorkshops.slice(0, 3));
            setRecentSeminars(allSeminars.slice(0, 3));
            setRecentCerts(allCerts.slice(0, 3));
            setEducation(eduRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    const totalItems = totals.pubs + totals.patents + totals.workshops + totals.seminars + totals.certs;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Reminders */}
            <ReminderBanner />

            {/* Welcome Header */}
            <div className="card p-6 mb-6 bg-primary-800 text-white border-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name}! 👋</h1>
                        <p className="text-primary-100 text-sm">{user?.department} Department • {user?.role?.toUpperCase()}</p>
                    </div>
                    <Link
                        to="/my-profile"
                        className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
                    >
                        <FileText className="w-4 h-4" /> View Full Profile
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: 'Publications', count: totals.pubs, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Patents', count: totals.patents, icon: Lightbulb, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Workshops', count: totals.workshops, icon: Briefcase, color: 'text-rose-600 bg-rose-50' },
                    { label: 'Seminars', count: totals.seminars, icon: Mic, color: 'text-violet-600 bg-violet-50' },
                    { label: 'Certifications', count: totals.certs, icon: Award, color: 'text-sky-600 bg-sky-50' },
                    { label: 'Education', count: education.length, icon: GraduationCap, color: 'text-primary-600 bg-primary-50' },
                ].map((stat) => (
                    <div key={stat.label} className="card p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-dark-900">{stat.count}</p>
                            <p className="text-xs text-dark-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Publications */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-dark-100">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            <h2 className="font-semibold text-dark-900">Recent Publications</h2>
                        </div>
                        <Link to="/my-profile" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="p-4">
                        {recentPubs.length > 0 ? (
                            <div className="space-y-3">
                                {recentPubs.map((pub) => (
                                    <div key={pub._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate">{pub.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {pub.journalName && <span className="text-xs text-dark-400 truncate">{pub.journalName}</span>}
                                                {pub.publicationType && <span className="badge-primary text-[10px]">{pub.publicationType}</span>}
                                                {pub.indexedType && <span className="badge-success text-[10px]">{pub.indexedType}</span>}
                                            </div>
                                            <p className="text-xs text-dark-400 mt-1">{pub.academicYear || formatDate(pub.publicationDate)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-dark-400 text-sm text-center py-6">No publications yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Patents */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-dark-100">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                            <h2 className="font-semibold text-dark-900">Recent Patents</h2>
                        </div>
                        <Link to="/my-profile" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="p-4">
                        {recentPatents.length > 0 ? (
                            <div className="space-y-3">
                                {recentPatents.map((pat) => (
                                    <div key={pat._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Lightbulb className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate">{pat.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {pat.patentNumber && <span className="text-xs text-dark-400">#{pat.patentNumber}</span>}
                                                {pat.status && <span className="badge-warning text-[10px]">{pat.status}</span>}
                                            </div>
                                            <p className="text-xs text-dark-400 mt-1">{pat.academicYear || formatDate(pat.filingDate)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-dark-400 text-sm text-center py-6">No patents yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Workshops & Seminars */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-dark-100">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-rose-600" />
                            <h2 className="font-semibold text-dark-900">Workshops & Seminars</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        {(recentWorkshops.length + recentSeminars.length) > 0 ? (
                            <div className="space-y-3">
                                {recentWorkshops.map((ws) => (
                                    <div key={ws._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate">{ws.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-dark-400">Workshop</span>
                                                {ws.role && <span className="badge-primary text-[10px]">{ws.role}</span>}
                                            </div>
                                            <p className="text-xs text-dark-400 mt-1">{ws.academicYear || formatDate(ws.date)}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentSeminars.map((sem) => (
                                    <div key={sem._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Mic className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate">{sem.topic}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-dark-400">Seminar</span>
                                                {sem.role && <span className="text-xs text-dark-400">• {sem.role}</span>}
                                            </div>
                                            <p className="text-xs text-dark-400 mt-1">{sem.academicYear || formatDate(sem.date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-dark-400 text-sm text-center py-6">No workshops or seminars yet</p>
                        )}
                    </div>
                </div>

                {/* Certifications */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-dark-100">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-sky-600" />
                            <h2 className="font-semibold text-dark-900">Certifications</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        {recentCerts.length > 0 ? (
                            <div className="space-y-3">
                                {recentCerts.map((cert) => (
                                    <div key={cert._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate">{cert.title}</p>
                                            <p className="text-xs text-dark-400 mt-0.5">{cert.issuedBy}</p>
                                            <p className="text-xs text-dark-400">{formatDate(cert.date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-dark-400 text-sm text-center py-6">No certifications yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
