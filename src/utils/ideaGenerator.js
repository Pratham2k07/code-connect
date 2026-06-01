export const projectTypes = [
  "platform", "engine", "dashboard", "mobile app", "web app", "API", "marketplace", "social network"
];

export const domains = [
  "Pet Adoption", "Music Recommendation", "Competitive Programming", 
  "Mental Health", "Fitness Tracking", "Remote Work", "Climate Change", 
  "Language Learning", "Personal Finance", "Event Planning"
];

export const mechanics = [
  "gamified", "AI-powered", "real-time", "decentralized", "anonymous", 
  "collaborative", "location-aware"
];

export const generateAiIdeas = (sharedTech, count = 3) => {
  const ideas = [];
  const usedTitles = new Set();

  for (let i = 0; i < count; i++) {
    let title;
    let type, domain, mechanic;
    
    // Ensure unique titles
    do {
      type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
      domain = domains[Math.floor(Math.random() * domains.length)];
      mechanic = mechanics[Math.floor(Math.random() * mechanics.length)];
      title = `${mechanic.charAt(0).toUpperCase() + mechanic.slice(1)} ${domain} ${type}`;
    } while (usedTitles.has(title));
    
    usedTitles.add(title);
    
    // Mix shared tech with some extra context tech
    const shuffledTech = [...sharedTech].sort(() => 0.5 - Math.random());
    const projectTech = shuffledTech.slice(0, Math.min(3, sharedTech.length));
    
    const description = `A highly interactive ${type} for the ${domain.toLowerCase()} space. It uses a ${mechanic} approach and is built primarily using ${projectTech.join(', ')}.`;
    
    ideas.push({
      id: `ai-${Date.now()}-${i}`,
      title,
      description,
      tags: projectTech,
      matchScore: Math.floor(Math.random() * 15) + 85 // 85 to 99
    });
  }
  return ideas;
};
