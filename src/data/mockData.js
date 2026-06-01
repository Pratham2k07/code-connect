export const mockInterests = [
  "AI/ML", "Cybersecurity", "Web Dev", "Mobile Apps", 
  "Game Dev", "Cloud Computing", "Web3 / Blockchain", 
  "UI/UX Design", "Data Science", "DevOps", 
  "Embedded Systems", "AR/VR"
];

export const mockTechStacks = [
  // Frontend & UI
  "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js", "Gatsby", "TailwindCSS", "Bootstrap", "Material UI", "Three.js", "WebGL",
  // Backend & APIs
  "Node.js", "Express", "NestJS", "Python", "Django", "FastAPI", "Flask", "Java", "Spring Boot", "C#", "ASP.NET", "Ruby", "Ruby on Rails", "PHP", "Laravel", "Go", "Rust", "C++", "C", "GraphQL", "gRPC", "WebSockets", "RabbitMQ", "Kafka",
  // Mobile & Desktop
  "Flutter", "React Native", "Swift", "Kotlin", "Objective-C", "Dart", "Electron", "Tauri",
  // AI, Data & Science
  "TensorFlow", "PyTorch", "Keras", "Scikit-Learn", "Pandas", "NumPy", "OpenCV", "R", "MATLAB", "Julia",
  // Web3 & Blockchain
  "Solidity", "Web3.js", "Ethers.js", "Smart Contracts", "Ethereum", "Rust (Web3)",
  // Languages
  "TypeScript", "JavaScript", "HTML/CSS", "Scala", "Haskell", "Elixir", "Lua", "Perl", "Assembly",
  // Databases
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "MariaDB", "SQLite", "Neo4j", "Supabase", "Firebase",
  // DevOps & Cloud
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Vercel", "Linux", "Bash"
];

export const mockGoals = [
  "Learn together", "Build projects", "Networking",
  "Friendship", "Relationship", "Startup partner"
];

export const mockIdeas = [
  {
    id: 1,
    title: "AI-powered pet adoption app",
    description: "Match users with shelter pets based on personality traits and lifestyle compatibility using a machine learning model.",
    tags: ["React Native", "Python", "Machine Learning"],
    matchScore: 94
  },
  {
    id: 2,
    title: "Gamified DSA battle platform",
    description: "A real-time competitive programming platform where users battle each other in quick algorithmic challenges.",
    tags: ["React", "Node.js", "WebSockets"],
    matchScore: 88
  },
  {
    id: 3,
    title: "Mood-based music recommendation engine",
    description: "Analyze the user's current environment and facial expression to curate a personalized Spotify playlist.",
    tags: ["Next.js", "Python", "Spotify API"],
    matchScore: 91
  },
  {
    id: 4,
    title: "Anonymous college confession app",
    description: "A safe space for students to share secrets anonymously, with AI moderation to prevent bullying.",
    tags: ["Flutter", "Firebase", "AI Moderation"],
    matchScore: 85
  }
];

export const mockChatMessages = [
  { id: 1, sender: "ai", text: "Welcome to your collaboration room! I've analyzed both of your profiles and suggested a few ideas on the right. How about starting with the AI pet adoption app?", timestamp: "10:00 AM" },
  { id: 2, sender: "partner", text: "Hey! Nice to meet you. I really like the DSA battle platform idea actually.", timestamp: "10:02 AM" },
  { id: 3, sender: "user", text: "Hi! The DSA platform sounds fun. What stack were you thinking for the backend?", timestamp: "10:05 AM" },
];

export const mockPartner = {
  name: "Alex",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
  vibeScore: 92,
  sharedInterests: ["Startups", "Music", "Hackathons"],
  sharedTech: ["React", "Python", "Next.js"],
};

export const mockActiveRooms = [
  {
    id: "1",
    projectName: "AI-powered pet adoption app",
    partner: {
      name: "Alex",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
    },
    lastActive: "2 hours ago",
    unreadMessages: 3,
    tags: ["React Native", "Python"],
    status: "Ideation",
    gradient: "linear-gradient(137deg, #22d3ee 0%, #a78bfa 100%)"
  },
  {
    id: "2",
    projectName: "Gamified DSA battle platform",
    partner: {
      name: "Sam",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede",
    },
    lastActive: "1 day ago",
    unreadMessages: 0,
    tags: ["React", "Node.js", "WebSockets"],
    status: "Building",
    gradient: "linear-gradient(137deg, #FF3D77 0%, #FF9D3C 100%)"
  },
  {
    id: "3",
    projectName: "Crypto Portfolio Tracker",
    partner: {
      name: "Jordan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffdfbf",
    },
    lastActive: "Just now",
    unreadMessages: 1,
    tags: ["Web3", "Next.js", "TailwindCSS"],
    status: "Planning",
    gradient: "linear-gradient(137deg, #10B981 0%, #059669 100%)"
  }
];
