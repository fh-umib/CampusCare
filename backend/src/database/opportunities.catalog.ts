export const preservedUniversityTitle =
  "Nga ideja te tregu: Ndërmarrësia, inovacioni dhe fuqizimi i të rinjve";
export const preservedUniversityKey = "uibm-entrepreneurship-2026-11-18";

// Real facts are user-supplied. The official EDTH page also confirms date/time.
// All synthetic records explicitly describe themselves as presentation demos.
export const opportunityCatalog = [
  {
    key: "edth-prishtina-2026",
    demo: false,
    preferredFeatured: true,
    title: "European Defense Tech Hackathon - Prishtina",
    event_type: "Hackathon",
    organizer: "European Defense Tech Hub",
    location: "Ministria e Mbrojtjes (Ministry of Defence), Prishtina, Kosovo",
    start_date: "2026-11-20T10:00:00+01:00",
    end_date: "2026-11-22T16:00:00+01:00",
    participation_type: "team",
    status: "registration_open",
    registration_deadline: null,
    max_team_size: null,
    description:
      "A hackathon in Prishtina bringing together technologists to explore innovation in dual-use and defense technology. Students can discover the opportunity and form teams through CampusCare. Apply or register separately through the organizer’s event page.",
    requirements:
      "Suggested useful skills: Software Development, Cybersecurity, Artificial Intelligence, Data Analysis, Embedded Systems, UI/UX, Product Design, Pitching, Teamwork, Problem Solving.",
    tags: [
      "defense-tech",
      "hackathon",
      "cybersecurity",
      "ai",
      "innovation",
      "software",
      "teamwork",
    ],
    external_link: "https://events.eurodefense.tech/prishtina-2026",
  },
  {
    key: "demo-campus-innovation-2026",
    demo: true,
    preferredFeatured: false,
    title: "Campus Innovation Challenge",
    event_type: "Competition",
    organizer: "CampusCare University Demo",
    location: "CampusCare Demo Innovation Space",
    start_date: "2026-11-25T09:00:00+01:00",
    end_date: "2026-11-25T16:00:00+01:00",
    registration_deadline: "2026-11-23T23:59:00+01:00",
    participation_type: "team",
    status: "registration_open",
    max_team_size: 5,
    description:
      "A CampusCare university demo opportunity for presentation purposes, not an officially announced event. Form a team, develop an idea for improving campus life, and outline a practical digital solution.",
    requirements:
      "Suggested useful skills: Innovation, Entrepreneurship, Product Design, Software Development, Pitching, Teamwork.",
    tags: [
      "innovation",
      "entrepreneurship",
      "digital-solutions",
      "pitching",
      "teamwork",
    ],
    external_link: null,
  },
  {
    key: "demo-student-tech-workshop-2026",
    demo: true,
    preferredFeatured: false,
    title: "Student Technology Workshop",
    event_type: "Workshop",
    organizer: "CampusCare University Demo",
    location: "CampusCare Demo Learning Lab",
    start_date: "2026-11-28T10:00:00+01:00",
    end_date: "2026-11-28T14:00:00+01:00",
    registration_deadline: "2026-11-26T23:59:00+01:00",
    participation_type: "individual",
    status: "registration_open",
    max_team_size: null,
    description:
      "A CampusCare university demo workshop for presentation purposes, not an officially announced event. Explore web development, AI concepts and databases through individual practical exercises.",
    requirements:
      "Useful skills and interests: Web Development, Artificial Intelligence, SQL, Databases, Problem Solving.",
    tags: ["web-development", "ai", "databases", "practical-skills"],
    external_link: null,
  },
  {
    key: "demo-digital-solutions-2026",
    demo: true,
    preferredFeatured: false,
    title: "Digital Solutions Challenge",
    event_type: "Innovation Challenge",
    organizer: "CampusCare University Demo",
    location: "CampusCare Demo Project Studio",
    start_date: "2026-12-05T09:30:00+01:00",
    end_date: "2026-12-06T16:00:00+01:00",
    registration_deadline: "2026-12-02T23:59:00+01:00",
    participation_type: "both",
    status: "registration_open",
    max_team_size: 5,
    description:
      "A CampusCare university demo challenge for presentation purposes, not an officially announced event. Work individually or in a team to design a useful digital service, combine data and software skills, and present a simple prototype.",
    requirements:
      "Suggested useful skills: React, SQL, Data Analysis, UI/UX, Software Development, Presentation, Teamwork.",
    tags: ["software", "data", "ui-ux", "prototype", "teamwork"],
    external_link: null,
  },
  {
    key: "demo-career-tech-networking-2026",
    demo: true,
    preferredFeatured: false,
    title: "Career & Technology Networking Day",
    event_type: "Career / Tech Event",
    organizer: "CampusCare University Demo",
    location: "CampusCare Demo Careers Forum",
    start_date: "2026-12-11T10:00:00+01:00",
    end_date: "2026-12-11T15:00:00+01:00",
    registration_deadline: "2026-12-09T23:59:00+01:00",
    participation_type: "individual",
    status: "registration_open",
    max_team_size: null,
    description:
      "A CampusCare university demo networking opportunity for presentation purposes, not an officially announced event. Practice introducing your skills, discussing technology projects, and preparing a short career presentation.",
    requirements:
      "Useful skills and interests: Career Development, Networking, Communication, Presentation, Technology.",
    tags: ["career-development", "networking", "presentation", "technology"],
    external_link: null,
  },
] as const;
