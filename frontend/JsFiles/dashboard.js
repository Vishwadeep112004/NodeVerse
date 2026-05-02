document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('nodeverse_user_id');

    if (!userId) {
        window.location.href = './signin.html';
        return;
    }

    const dashboardContent = document.getElementById('dashboardContent');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // DOM Elements
    const avatarInitials = document.getElementById('avatarInitials');
    const fullNameEl = document.getElementById('fullName');
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');

    const statSolvedEl = document.getElementById('statSolved');
    const statRecentEl = document.getElementById('statRecent');
    const statTodayEl = document.getElementById('statToday');
    const statRankEl = document.getElementById('statRank');

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`);

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const user = await response.json();

        // User Info
        const firstName = user.name || '';
        const lastName = user.surname || '';

        fullNameEl.textContent =
            `${firstName} ${lastName}`.trim() || 'Anonymous User';

        userNameEl.textContent = user.username || 'unknown';
        userEmailEl.textContent = user.email || 'N/A';

        // Problems solved
        const solvedProblems = user.solved_problems || 0;
        statSolvedEl.textContent = solvedProblems;

        // Avatar
        if (firstName) {
            avatarInitials.textContent =
                firstName.charAt(0).toUpperCase();
        } else if (user.username) {
            avatarInitials.textContent =
                user.username.charAt(0).toUpperCase();
        } else {
            avatarInitials.textContent = 'U';
        }

        // Rank Logic
        if (solvedProblems >= 200) {
            statRankEl.textContent = 'Diamond';
        }
        else if (solvedProblems >= 100) {
            statRankEl.textContent = 'Gold';
        }
        else if (solvedProblems >= 50) {
            statRankEl.textContent = 'Silver';
        }
        else {
            statRankEl.textContent = 'Bronze';
        }

        // Show dashboard
        loadingIndicator.style.display = 'none';
        dashboardContent.style.display = 'flex';

        // Real graph using daily submissions
        console.log("Daily Submissions Data:", user.daily_submissions);
        renderActivityGraph(user.daily_submissions || {});

    } catch (error) {
        console.error('Error loading dashboard:', error);

        loadingIndicator.textContent =
            'Error loading profile. Is the Django backend running on port 8000?';

        loadingIndicator.style.color = 'var(--danger)';
        loadingIndicator.style.animation = 'none';
    }

    // Logout
    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('nodeverse_user_id');
        window.location.href = './signin.html';
    };

    document.getElementById('logoutBtnMain')
        .addEventListener('click', handleLogout);

    // ==============================
    // Activity Graph
    // ==============================
    function renderActivityGraph(dailySubmissions) {
        const ctx = document
            .getElementById('activityChart')
            .getContext('2d');

        const labels = [];
        const dataPoints = [];

        if (typeof dailySubmissions === 'string') {
            try {
                dailySubmissions = JSON.parse(dailySubmissions);
            } catch (e) {
                dailySubmissions = {};
            }
        }

        let totalSubmissions = 0;
        for (const key in dailySubmissions) {
            totalSubmissions += dailySubmissions[key] || 0;
        }

        const today = new Date();
        const tYear = today.getFullYear();
        const tMonth = String(today.getMonth() + 1).padStart(2, '0');
        const tDay = String(today.getDate()).padStart(2, '0');
        const todayKey = `${tYear}-${tMonth}-${tDay}`;
        const todayCount = dailySubmissions[todayKey] || 0;

        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();

            d.setHours(0, 0, 0, 0);   // Fix timezone mismatch
            d.setDate(d.getDate() - i);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');

            const dateKey = `${year}-${month}-${day}`;

            labels.push(
                d.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                })
            );

            const submissions = dailySubmissions[dateKey] || 0;
            dataPoints.push(submissions);
        }

        // Update stats
        statRecentEl.textContent = totalSubmissions;
        statTodayEl.textContent = todayCount;

        // Chart gradient
        const gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            300
        );

        gradient.addColorStop(
            0,
            'rgba(0, 255, 136, 0.4)'
        );

        gradient.addColorStop(
            1,
            'rgba(0, 255, 136, 0.0)'
        );

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Submissions',
                    data: dataPoints,
                    borderColor: '#00ff88',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#020617',
                    pointBorderColor: '#00ff88',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        backgroundColor: '#0a1628',
                        titleColor: '#e2e8f0',
                        bodyColor: '#00ff88',
                        borderColor: '#263354',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,

                        callbacks: {
                            label: function (context) {
                                return `${context.parsed.y} submissions`;
                            }
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            color: '#94a3b8',
                            stepSize: 1,
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 10
                            }
                        },

                        grid: {
                            color: 'rgba(38, 51, 84, 0.3)'
                        },

                        border: {
                            display: false
                        }
                    },

                    x: {
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 10
                            }
                        },

                        grid: {
                            display: false
                        },

                        border: {
                            display: false
                        }
                    }
                },

                interaction: {
                    intersect: false,
                    mode: 'index',
                }
            }
        });
    }
});