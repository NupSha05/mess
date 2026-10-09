export interface CourseMapping {
  courseName: string;
  degrees: string[];
  majors: string[];
}

export const COURSE_MAJOR_MAPPING: Record<string, { label: string; majors: string[] }> = {
  'B.Tech / B.E.': {
    label: 'Bachelor of Technology / Engineering (B.Tech / B.E.)',
    majors: [
      'Computer Science & Engineering (CSE)',
      'Information Technology (IT)',
      'Artificial Intelligence & Data Science (AI & DS)',
      'Electronics & Communication Engineering (ECE)',
      'Electrical & Electronics Engineering (EEE)',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Biotechnology & Bioinformatics',
    ],
  },
  'M.Tech / M.E.': {
    label: 'Master of Technology / Engineering (M.Tech / M.E.)',
    majors: [
      'Computer Science & Engineering',
      'Artificial Intelligence & Machine Learning',
      'Data Science & Analytics',
      'VLSI & Embedded Systems',
      'Software Engineering',
      'Power Systems',
      'Thermal & Fluid Engineering',
    ],
  },
  'BCA / MCA': {
    label: 'Computer Applications (BCA / MCA)',
    majors: [
      'Computer Applications (General)',
      'Cloud Computing & DevOps',
      'Cyber Security & Ethical Hacking',
      'Full Stack Web Development',
      'Data Analytics',
    ],
  },
  'BBA / MBA': {
    label: 'Management & Administration (BBA / MBA)',
    majors: [
      'Finance & Banking',
      'Marketing & Digital Strategy',
      'Human Resource Management (HR)',
      'Operations & Supply Chain Management',
      'Business Analytics & Intelligence',
      'International Business',
      'FinTech & Financial Risk',
    ],
  },
  'B.Com / M.Com': {
    label: 'Commerce & Accounting (B.Com / M.Com)',
    majors: [
      'Accounting & Finance',
      'Banking & Insurance',
      'Financial Markets & Investment',
      'Taxation & Auditing',
      'Corporate Law & Governance',
    ],
  },
  'B.Sc / M.Sc': {
    label: 'Pure & Applied Sciences (B.Sc / M.Sc)',
    majors: [
      'Computer Science',
      'Mathematics & Computing',
      'Statistics & Operations Research',
      'Physics',
      'Chemistry',
      'Data Science',
    ],
  },
  'B.A. / M.A.': {
    label: 'Arts & Humanities (B.A. / M.A.)',
    majors: [
      'Economics & Econometrics',
      'Psychology & Behavioral Sciences',
      'Journalism & Mass Communication',
      'English Literature & Linguistics',
      'Public Policy & Governance',
    ],
  },
};

export const COMMON_COLLEGES = [
  'SSM College of Engineering',
  'IIT Bombay',
  'IIT Delhi',
  'IIT Madras',
  'IIT Kharagpur',
  'BITS Pilani',
  'NIT Trichy',
  'NIT Surathkal',
  'Delhi Technological University (DTU)',
  'Netaji Subhas University of Technology (NSUT)',
  'Vellore Institute of Technology (VIT)',
  'Manipal Institute of Technology (MIT)',
  'SRM Institute of Science and Technology',
  'Delhi University (DU)',
  'Mumbai University',
  'Anna University',
  'Other / Custom Institution',
];

export function getMajorsForCourse(course: string): string[] {
  const match = COURSE_MAJOR_MAPPING[course];
  if (match) return match.majors;
  // Fallback default
  return COURSE_MAJOR_MAPPING['B.Tech / B.E.'].majors;
}
