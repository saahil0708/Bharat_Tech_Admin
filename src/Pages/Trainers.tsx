import { Plus, Award, Star, UserCheck } from 'lucide-react';

const Trainers = () => {
    const trainers = [
        { id: 1, name: 'Sagar Mehta', specialty: 'Bodybuilding', rating: 4.9, experience: '8 Years', status: 'Available' },
        { id: 2, name: 'Neha Kapoor', specialty: 'Yoga & Pilates', rating: 4.8, experience: '5 Years', status: 'In Class' },
        { id: 3, name: 'Kabir Khan', specialty: 'CrossFit', rating: 5.0, experience: '12 Years', status: 'Available' },
        { id: 4, name: 'Riya Sen', specialty: 'Nutrition & Diet', rating: 4.7, experience: '4 Years', status: 'Available' },
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Expert <span className="text-[#ff0000]">Trainers</span></h1>
                    <p className="text-gray-500">Overview of your professional coaching staff.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#ff0000] hover:bg-[#d00000] text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)] font-semibold">
                    <Plus size={20} />
                    Hire Trainer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trainers.map((trainer) => (
                    <div key={trainer.id} className="bg-[#121212] border border-[#1e1e1e] rounded-2xl p-6 hover:border-[#ff0000]/40 transition-all duration-300 group">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#1e1e1e] to-[#0a0a0a] border border-[#8b0000]/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-500">
                                <div className="w-full h-full rounded-[20px] bg-[#0a0a0a] flex items-center justify-center">
                                    <span className="text-2xl font-black text-[#ff0000]">{trainer.name[0]}</span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-2">
                                {trainer.status === 'Available' ? (
                                    <span className="flex h-3 w-3 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span>
                                ) : (
                                    <span className="flex h-3 w-3 bg-yellow-500 rounded-full shadow-[0_0_8px_#eab308]"></span>
                                )}
                            </div>
                        </div>

                        <div className="text-center space-y-1 mb-6">
                            <h3 className="text-lg font-bold text-white">{trainer.name}</h3>
                            <p className="text-sm text-[#ff0000] font-medium uppercase tracking-widest text-[10px]">{trainer.specialty}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-y border-[#1e1e1e] py-4 mb-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-[#ff0000] mb-1">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-sm font-bold text-white">{trainer.rating}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 uppercase">Rating</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-[#ff0000] mb-1">
                                    <Award size={14} />
                                    <span className="text-sm font-bold text-white">{trainer.experience}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 uppercase">Experience</p>
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#ff0000]/10 hover:border-[#ff0000]/30 transition-all flex items-center justify-center gap-2">
                            <UserCheck size={16} />
                            View Profile
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Trainers;
