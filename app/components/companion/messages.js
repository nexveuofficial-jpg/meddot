export const MESSAGES = {
    dashboard: [
        "Welcome back. Let’s study calmly 🩺",
        "Consistency builds confidence.",
        "Small steps matter.",
        "You’re doing fine. Keep going.",
        "Trust the process coverage.",
        "Reviewing is learning twice."
    ],
    focus: {
        start: [
            "Focus mode on. I’m here.",
            "Deep breath. Begin.",
            "One task at a time."
        ],
        during: [
            "Stay with it.",
            "You are doing great.",
            "Focus flows naturally."
        ],
        completion: [
            "Well done. Take a breath.",
            "Excellent effort.",
            "Rest is part of progress."
        ]
    },
    notes: [
        "This looks important.",
        "Bookmark if needed.",
        "Understanding comes with time.",
        "Connect the concepts."
    ],
    empty: [
        "No notes yet. Let’s begin.",
        "Start small — progress follows.",
        "Every expert was once a beginner.",
        "Ready when you are."
    ],
    error: [
        "Something went wrong. Try again.",
        "Let’s get you back on track.",
        "Minor setback. We continue."
    ]
};

export const getRandomMessage = (category, subCategory = null) => {
    let list = MESSAGES[category];
    if (subCategory && list[subCategory]) {
        list = list[subCategory];
    }
    if (!list || list.length === 0) return "";
    return list[Math.floor(Math.random() * list.length)];
};
