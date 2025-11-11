export interface Class {
  id: string;
  title: string;
  description: string;
  category: "education" | "arts" | "fitness" | "technology" | "life-skills";
  instructor: string;
  schedule: string;
  duration: string;
  capacity: number;
  enrolled: number;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  ageGroup: string;
  crcId: string;
}

export const classes: Class[] = [
  // Salt Lake City CRC
  {
    id: "c1",
    title: "English as a Second Language (ESL) - Beginner",
    description:
      "Learn basic English conversation, reading, and writing skills in a supportive environment. Perfect for those just starting their English learning journey.",
    category: "education",
    instructor: "Maria Rodriguez",
    schedule: "Mon & Wed, 6:00 PM - 8:00 PM",
    duration: "12 weeks",
    capacity: 20,
    enrolled: 15,
    level: "beginner",
    ageGroup: "Adults 18+",
    crcId: "1",
  },
  {
    id: "c2",
    title: "Computer Basics",
    description:
      "Master essential computer skills including email, internet browsing, Microsoft Office, and online safety. No prior experience needed.",
    category: "technology",
    instructor: "James Chen",
    schedule: "Tue & Thu, 10:00 AM - 12:00 PM",
    duration: "8 weeks",
    capacity: 15,
    enrolled: 12,
    level: "beginner",
    ageGroup: "Adults 18+",
    crcId: "1",
  },
  {
    id: "c3",
    title: "Watercolor Painting",
    description:
      "Explore the beautiful world of watercolor painting. Learn techniques, color mixing, and create stunning artwork to take home.",
    category: "arts",
    instructor: "Sarah Martinez",
    schedule: "Saturdays, 1:00 PM - 3:00 PM",
    duration: "6 weeks",
    capacity: 12,
    enrolled: 8,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "1",
  },
  {
    id: "c4",
    title: "Yoga for Beginners",
    description:
      "Gentle yoga class focusing on flexibility, strength, and relaxation. All equipment provided.",
    category: "fitness",
    instructor: "Emily Johnson",
    schedule: "Mon, Wed, Fri, 7:00 AM - 8:00 AM",
    duration: "Ongoing",
    capacity: 25,
    enrolled: 20,
    level: "beginner",
    ageGroup: "Adults 18+",
    crcId: "1",
  },
  {
    id: "c5",
    title: "Financial Literacy",
    description:
      "Learn budgeting, saving, credit management, and financial planning to build a secure financial future.",
    category: "life-skills",
    instructor: "David Park",
    schedule: "Thursdays, 6:30 PM - 8:30 PM",
    duration: "4 weeks",
    capacity: 30,
    enrolled: 22,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "1",
  },

  // Provo Community Center
  {
    id: "c6",
    title: "ESL - Intermediate",
    description:
      "Build on your English skills with advanced grammar, vocabulary, and conversation practice.",
    category: "education",
    instructor: "Linda Thompson",
    schedule: "Tue & Thu, 6:00 PM - 8:00 PM",
    duration: "12 weeks",
    capacity: 20,
    enrolled: 18,
    level: "intermediate",
    ageGroup: "Adults 18+",
    crcId: "2",
  },
  {
    id: "c7",
    title: "Piano Lessons - Beginner",
    description:
      "Learn to play piano with individual instruction. Pianos provided during class time.",
    category: "arts",
    instructor: "Michael Lee",
    schedule: "Wednesdays, 4:00 PM - 5:00 PM",
    duration: "10 weeks",
    capacity: 8,
    enrolled: 6,
    level: "beginner",
    ageGroup: "Ages 10+",
    crcId: "2",
  },
  {
    id: "c8",
    title: "Web Development Fundamentals",
    description:
      "Learn HTML, CSS, and basic JavaScript to build your own websites. Laptops provided.",
    category: "technology",
    instructor: "Alex Kumar",
    schedule: "Mon & Wed, 6:00 PM - 8:30 PM",
    duration: "10 weeks",
    capacity: 15,
    enrolled: 10,
    level: "beginner",
    ageGroup: "Adults 18+",
    crcId: "2",
  },
  {
    id: "c9",
    title: "Zumba Fitness",
    description:
      "High-energy dance fitness class combining Latin and international music. Fun workout for all fitness levels.",
    category: "fitness",
    instructor: "Carmen Diaz",
    schedule: "Tue & Thu, 6:00 PM - 7:00 PM",
    duration: "Ongoing",
    capacity: 30,
    enrolled: 25,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "2",
  },

  // Ogden Resource Hub
  {
    id: "c10",
    title: "Citizenship Preparation",
    description:
      "Prepare for the U.S. citizenship test with study materials, practice tests, and interview preparation.",
    category: "education",
    instructor: "Robert Wilson",
    schedule: "Saturdays, 10:00 AM - 12:00 PM",
    duration: "8 weeks",
    capacity: 25,
    enrolled: 20,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "3",
  },
  {
    id: "c11",
    title: "Photography Basics",
    description:
      "Learn composition, lighting, and camera settings. Bring your own camera or smartphone.",
    category: "arts",
    instructor: "Jennifer Adams",
    schedule: "Thursdays, 6:00 PM - 8:00 PM",
    duration: "6 weeks",
    capacity: 15,
    enrolled: 11,
    level: "beginner",
    ageGroup: "Ages 16+",
    crcId: "3",
  },
  {
    id: "c12",
    title: "Cooking on a Budget",
    description:
      "Learn to prepare healthy, delicious meals without breaking the bank. Includes hands-on cooking.",
    category: "life-skills",
    instructor: "Maria Santos",
    schedule: "Wednesdays, 5:30 PM - 7:30 PM",
    duration: "5 weeks",
    capacity: 12,
    enrolled: 12,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "3",
  },

  // West Valley CRC
  {
    id: "c13",
    title: "ESL - Advanced",
    description:
      "Refine your English skills with focus on professional communication, writing, and cultural nuances.",
    category: "education",
    instructor: "Patricia Brown",
    schedule: "Mon & Wed, 7:00 PM - 9:00 PM",
    duration: "12 weeks",
    capacity: 18,
    enrolled: 14,
    level: "advanced",
    ageGroup: "Adults 18+",
    crcId: "4",
  },
  {
    id: "c14",
    title: "Guitar for Beginners",
    description:
      "Learn basic chords, strumming patterns, and play your favorite songs. Guitars available to borrow.",
    category: "arts",
    instructor: "Daniel Garcia",
    schedule: "Tuesdays, 6:00 PM - 7:30 PM",
    duration: "8 weeks",
    capacity: 10,
    enrolled: 7,
    level: "beginner",
    ageGroup: "Ages 12+",
    crcId: "4",
  },
  {
    id: "c15",
    title: "Job Search Strategies",
    description:
      "Resume writing, interview skills, networking, and job search techniques to land your next opportunity.",
    category: "life-skills",
    instructor: "Kevin White",
    schedule: "Thursdays, 6:00 PM - 8:00 PM",
    duration: "4 weeks",
    capacity: 20,
    enrolled: 16,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "4",
  },

  // Sandy Community Resource Center
  {
    id: "c16",
    title: "Microsoft Excel Essentials",
    description:
      "Master spreadsheets, formulas, charts, and data analysis for work or personal use.",
    category: "technology",
    instructor: "Susan Taylor",
    schedule: "Mon & Wed, 6:00 PM - 8:00 PM",
    duration: "6 weeks",
    capacity: 15,
    enrolled: 13,
    level: "intermediate",
    ageGroup: "Adults 18+",
    crcId: "5",
  },
  {
    id: "c17",
    title: "Tai Chi",
    description:
      "Gentle martial art focusing on slow, flowing movements for balance, flexibility, and stress relief.",
    category: "fitness",
    instructor: "Li Wang",
    schedule: "Tue & Thu, 9:00 AM - 10:00 AM",
    duration: "Ongoing",
    capacity: 20,
    enrolled: 15,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "5",
  },
  {
    id: "c18",
    title: "Pottery & Ceramics",
    description:
      "Create functional and decorative pottery using hand-building and wheel-throwing techniques.",
    category: "arts",
    instructor: "Rachel Green",
    schedule: "Saturdays, 2:00 PM - 4:00 PM",
    duration: "8 weeks",
    capacity: 10,
    enrolled: 9,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "5",
  },

  // Orem Family Center
  {
    id: "c19",
    title: "GED Preparation",
    description:
      "Comprehensive preparation for the GED exam covering all subject areas with practice tests.",
    category: "education",
    instructor: "Thomas Anderson",
    schedule: "Mon, Wed, Fri, 5:00 PM - 7:00 PM",
    duration: "16 weeks",
    capacity: 25,
    enrolled: 20,
    level: "all-levels",
    ageGroup: "Adults 18+",
    crcId: "6",
  },
  {
    id: "c20",
    title: "Digital Marketing Basics",
    description:
      "Learn social media marketing, email campaigns, and online advertising for small businesses.",
    category: "technology",
    instructor: "Nicole Martinez",
    schedule: "Thursdays, 6:30 PM - 8:30 PM",
    duration: "6 weeks",
    capacity: 20,
    enrolled: 15,
    level: "beginner",
    ageGroup: "Adults 18+",
    crcId: "6",
  },
  {
    id: "c21",
    title: "Strength Training",
    description:
      "Build muscle and improve overall fitness with proper weight training techniques. All equipment provided.",
    category: "fitness",
    instructor: "Marcus Johnson",
    schedule: "Mon, Wed, Fri, 6:00 AM - 7:00 AM",
    duration: "Ongoing",
    capacity: 15,
    enrolled: 12,
    level: "intermediate",
    ageGroup: "Adults 18+",
    crcId: "6",
  },
];
