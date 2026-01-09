import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardCard({ title, description, icon, accentColor, href, delay = 0 }) {
    
    // We expect `icon` to be a React Node (SVG).
    // `accentColor` is a hex string, e.g., "#0ea5e9".

    return (
        <Link href={href || "#"} className="block h-full transform transition-all duration-300 hover:-translate-y-1">
             <div 
                className="group relative h-full p-6 rounded-2xl border border-white/5 bg-[#1F2937]/30 backdrop-blur-md hover:bg-[#1F2937]/50 hover:border-white/10 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${delay}s` }}
             >
                {/* Hover Gradient Glow */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${accentColor}, transparent 70%)` }}
                />

                <div className="relative z-10 flex flex-col h-full">
                    <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                            backgroundColor: `${accentColor}20`, 
                            color: accentColor,
                            boxShadow: `0 0 15px -5px ${accentColor}`
                        }}
                    >
                        {/* Clone the icon element to enforce size if needed, or fallback to simple render */}
                        <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                            {icon}
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-50 transition-colors">
                        {title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                        {description}
                    </p>

                    <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-wider transition-colors" style={{ color: accentColor }}>
                        Open <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
