// src/data/blogPosts.ts

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;     // ISO
  readTime: string;
  tags: string[];
};

export const blogPosts: Post[] = [
  {
    slug: "hidden-gems-aruba",
    title: "10 Hidden Gems in Aruba You Must Visit",
    excerpt:
      "Discover the secret beaches, local restaurants, and unique experiences that most tourists miss on this beautiful island.",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop",
    author: "Maria Rodriguez",
    date: "2025-01-05",
    readTime: "5 min read",
    tags: ["Aruba", "Travel Tips", "Beaches"],
  },
  {
    slug: "diving-guide-bonaire",
    title: "The Ultimate Diving Guide to Bonaire",
    excerpt:
      "Everything you need to know about exploring Bonaire's world-class coral reefs and marine life.",
    image:
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&auto=format&fit=crop",
    author: "John van der Berg",
    date: "2025-01-03",
    readTime: "8 min read",
    tags: ["Bonaire", "Diving", "Activities"],
  },
  {
    slug: "budget-car-rental-curacao",
    title: "How to Rent a Car Cheaply in Curaçao",
    excerpt:
      "Pro tips for finding the best car rental deals and navigating Curaçao like a local.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop",
    author: "Sophie Martinez",
    date: "2025-01-01",
    readTime: "6 min read",
    tags: ["Curaçao", "Car Rentals", "Budget Travel"],
  },
  {
    slug: "best-restaurants-abc-islands",
    title: "Best Local Restaurants Across the ABC Islands",
    excerpt:
      "A culinary journey through the must-try dining spots on Aruba, Bonaire, and Curaçao.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop",
    author: "Carlos Fernandez",
    date: "2024-12-28",
    readTime: "7 min read",
    tags: ["Restaurants", "Food", "All Islands"],
  },
  {
    slug: "family-activities-aruba",
    title: "Top Family-Friendly Activities in Aruba",
    excerpt:
      "Keep the whole family entertained with these amazing activities suitable for all ages.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop",
    author: "Lisa Thompson",
    date: "2024-12-25",
    readTime: "6 min read",
    tags: ["Aruba", "Family", "Activities"],
  },
  {
    slug: "curacao-architecture-guide",
    title: "Exploring Curaçao's Colorful Architecture",
    excerpt:
      "A visual guide to the stunning Dutch colonial buildings that make Willemstad unique.",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop",
    author: "Emma de Vries",
    date: "2024-12-20",
    readTime: "5 min read",
    tags: ["Curaçao", "Culture", "Photography"],
  },
];