const Progress = require('../models/Progress');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

exports.updateProgress = async (req, res) => {
    const { playlistId, videoId, status } = req.body;

    try {
        const progress = await Progress.findOneAndUpdate(
            {
                user: req.user._id,
                playlist: playlistId,
                videoId: videoId
            },
            { status, updatedAt: Date.now() },
            { new: true, upsert: true } // Create if doesn't exist
        );

        // Update User's last active video
        if (status !== 'NOT_STARTED') {
            const playlist = await Playlist.findById(playlistId);
            if (playlist) {
                const video = playlist.videos.find(v => v.videoId === videoId);
                if (video) {
                    await User.findByIdAndUpdate(req.user._id, {
                        lastActiveVideo: {
                            playlistId,
                            videoId,
                            title: video.title,
                            thumbnail: video.thumbnail,
                            timestamp: Date.now()
                        }
                    });
                }
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    // Global stats for user
    try {
        const totalCompleted = await Progress.countDocuments({ user: req.user._id, status: 'COMPLETED' });
        const inProgress = await Progress.countDocuments({ user: req.user._id, status: 'IN_PROGRESS' });

        // This is a basic stats endpoint
        res.json({
            totalCompleted,
            inProgress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHeatmapData = async (req, res) => {
    try {
        const query = { user: req.user._id, status: 'COMPLETED' };

        // Filter by specific playlist if provided
        if (req.query.playlistId) {
            query.playlist = req.query.playlistId;
        }

        // 1. Get all completed video timestamps (Progress)
        const videoActivities = await Progress.find(query).select('updatedAt');

        // 2. Get all quiz timestamps (User.quizResults)
        const user = await User.findById(req.user._id).select('quizResults');
        const quizActivities = user ? user.quizResults : []; // These have a 'date' field

        // 3. Group by Date (YYYY-MM-DD)
        const activityMap = {};

        // Process Videos
        videoActivities.forEach(act => {
            const date = act.updatedAt.toISOString().split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        // Process Quizzes
        quizActivities.forEach(quiz => {
            if (quiz.date) {
                const date = quiz.date.toISOString().split('T')[0];
                activityMap[date] = (activityMap[date] || 0) + 1;
            }
        });

        // 4. Convert to Array and Sort
        const heatmapData = Object.keys(activityMap).map(date => ({
            date,
            count: activityMap[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
