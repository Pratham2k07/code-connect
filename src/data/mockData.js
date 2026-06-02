export const mockInterests = [
  "AI/ML", "Cybersecurity", "Web Dev", "Mobile Apps", 
  "Game Dev", "Cloud Computing", "Web3 / Blockchain", 
  "UI/UX Design", "Data Science", "DevOps", 
  "Embedded Systems", "AR/VR"
];

export const mockTechStacks = [
  // Frontend & UI (Supported by Sandpack)
  "React", "Vue", "Next.js", "HTML/CSS", "TailwindCSS", "Bootstrap",
  // Backend & APIs (Supported by Piston/Sandpack)
  "Node.js", "Express", "Python", "Java", "C++", "C", "Go", "Rust", "Ruby", "PHP", 
  // Core Languages
  "TypeScript", "JavaScript", "Bash"
];

export const mockGoals = [
  "Learn together", "Build projects", "Networking",
  "Friendship", "Relationship", "Startup partner"
];

export const mockIdeas = [
  {
    id: 1,
    title: "AI-powered web scraper tool",
    description: "A python script that scrapes websites and uses AI to summarize the contents.",
    tags: ["Python", "HTML/CSS"],
    matchScore: 94
  },
  {
    id: 2,
    title: "Real-time Chat App",
    description: "A chat application using React on the frontend and Node.js for backend websockets.",
    tags: ["React", "Node.js", "TailwindCSS"],
    matchScore: 88
  },
  {
    id: 3,
    title: "Command-line Task Manager",
    description: "A fast, compiled CLI tool for managing daily tasks and tracking time.",
    tags: ["Rust", "Bash"],
    matchScore: 91
  }
];

export const mockChatMessages = [
  { id: 1, sender: "ai", text: "Welcome to your collaboration room! I've analyzed both of your profiles and suggested a few ideas on the right.", timestamp: "10:00 AM" },
  { id: 2, sender: "partner", text: "Hey! Nice to meet you. I really like the chat app idea actually.", timestamp: "10:02 AM" },
  { id: 3, sender: "user", text: "Hi! The chat app sounds fun. What stack were you thinking for the backend?", timestamp: "10:05 AM" },
];

export const mockPartner = {
  name: "Alex",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
  vibeScore: 92,
  sharedInterests: ["Startups", "Web Dev"],
  sharedTech: ["React", "Node.js"],
};

export const mockActiveRooms = [
  {
    id: "1",
    projectName: "AI Scraper Tool",
    partner: {
      name: "Alex",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
    },
    lastActive: "2 hours ago",
    unreadMessages: 3,
    tags: ["Python", "Bash"],
    status: "Ideation",
    gradient: "linear-gradient(137deg, #22d3ee 0%, #a78bfa 100%)"
  },
  {
    id: "2",
    projectName: "React Dashboard",
    partner: {
      name: "Sam",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede",
    },
    lastActive: "1 day ago",
    unreadMessages: 0,
    tags: ["React", "TypeScript", "TailwindCSS"],
    status: "Building",
    gradient: "linear-gradient(137deg, #FF3D77 0%, #FF9D3C 100%)"
  }
];

// Fallback pool of users for the matchmaking engine if Supabase has no real users
export const mockMatchingPool = [
  {
    id: "mock1",
    name: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
    gender: "Male",
    preference: "Anyone",
    tech_stack: ["React", "Node.js", "TypeScript", "TailwindCSS"],
    interests: ["Web Dev", "Startups", "UI/UX Design"],
    goals: ["Build projects", "Networking"],
    color: "#22d3ee",
    role: "Fullstack Dev"
  },
  {
    id: "mock2",
    name: "Priya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=f472b6",
    gender: "Female",
    preference: "Anyone",
    tech_stack: ["Python", "React", "JavaScript"],
    interests: ["AI/ML", "Web Dev"],
    goals: ["Learn together", "Friendship"],
    color: "#f472b6",
    role: "AI Engineer"
  },
  {
    id: "mock3",
    name: "Devraj",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Devraj&backgroundColor=a78bfa",
    gender: "Male",
    preference: "Female",
    tech_stack: ["Go", "Rust", "C++", "Python"],
    interests: ["Cloud Computing", "Cybersecurity", "DevOps"],
    goals: ["Startup partner", "Build projects"],
    color: "#a78bfa",
    role: "Backend Dev"
  },
  {
    id: "mock4",
    name: "Sarah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=4ade80",
    gender: "Female",
    preference: "Male",
    tech_stack: ["Java", "C", "HTML/CSS", "Bootstrap"],
    interests: ["Game Dev", "Embedded Systems"],
    goals: ["Learn together", "Relationship"],
    color: "#4ade80",
    role: "Student"
  },
  {
    id: "mock5",
    name: "Jordan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=fb923c",
    gender: "Non-binary",
    preference: "Anyone",
    tech_stack: ["Ruby", "PHP", "Vue"],
    interests: ["Web Dev", "Cloud Computing"],
    goals: ["Networking", "Friendship"],
    color: "#fb923c",
    role: "Web Dev"
  }
];
