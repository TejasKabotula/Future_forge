import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { PlayCircle, Zap, LayoutGrid, ArrowRight } from "lucide-react";
import StudyHeatmap from "../components/StudyHeatmap";
import JumpBackIn from "../components/JumpBackIn";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({ totalCourses: 0, completedCourses: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Quick fetch just for stats (optional, could simply rely on dedicated stats endpoint or reuse playlists)
    const fetchStats = async () => {
      try {
        const [response] = await Promise.all([
          api.get("/api/playlists"),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);
        const data = response.data;
        setDashboardData({
          totalCourses: data.length,
          completedCourses: data.filter(pl => pl.percent === 100).length
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-[1600px] mx-auto pb-20"
    >
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <motion.div variants={item}>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Dashboard
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Good day! Ready to learn something new?</p>
        </motion.div>
      </header>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-10 min-w-0">

          {/* 1. Feature: Jump Back In */}
          <motion.section variants={item}>
            <h2 className="text-xl font-bold text-white mb-6">Continue Learning</h2>
            <JumpBackIn />
          </motion.section>

          {/* Quick Links / Stats */}
          <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/courses" className="group">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 hover:border-primary/50 p-6 rounded-3xl transition-all hover:bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/20 text-primary rounded-xl">
                    <LayoutGrid size={24} />
                  </div>
                  <ArrowRight className="text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">My Courses</h3>
                <p className="text-zinc-400 text-sm">Access your {dashboardData.totalCourses} active learning paths</p>
              </div>
            </Link>

            <Link to="/profile" className="group">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/5 hover:border-green-500/50 p-6 rounded-3xl transition-all hover:bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                    <Zap size={24} />
                  </div>
                  <ArrowRight className="text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">Achievements</h3>
                <p className="text-zinc-400 text-sm">{dashboardData.completedCourses} courses completed so far</p>
              </div>
            </Link>
          </motion.section>
        </div>

        {/* Sidebar: Heatmap */}
        <motion.div variants={item} className="xl:w-[350px] shrink-0 space-y-6">
          <div className="sticky top-24">
            <StudyHeatmap />

            {/* Mini Motivation Card */}
            <div className="mt-6 bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-3xl border border-primary/20 relative overflow-hidden">
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Daily Tip</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Small steps every day add up to big results. Keep the streak alive!
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
