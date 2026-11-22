import { VERIFIED_PROGRAM_FACTS } from "./businessTruth";

export type CareerTrackId =
  | "business-development"
  | "customer-success"
  | "project-management"
  | "operations-management"
  | "product-management"
  | "human-resources"
  | "marketing-management"
  | "customer-support";

export type DegreeSlug =
  | "ba"
  | "bcom"
  | "bsc"
  | "bba"
  | "bca"
  | "ma"
  | "mcom"
  | "msc";

export interface CareerProgram {
  id: CareerTrackId;
  legacyRoleId: string;
  slug: CareerTrackId;
  path: `/career-paths/${CareerTrackId}`;
  name: string;
  hindiName: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  tagline: string;
  overview: string;
  duration: string;
  difficulty: "Fresher-Friendly";
  bestForDegrees: DegreeSlug[];
  whatYouDoDaily: string[];
  coreSkills: string[];
  toolsCovered: string[];
  modules: Array<{
    weekRange: string;
    title: string;
    topics: string[];
  }>;
  practicalAssignments: string[];
  entryJobTitles: string[];
  honestEligibilityNote: string;
  faqs: Array<{ question: string; answer: string }>;
  traitWeights: {
    communication: number;
    analytical: number;
    structured: number;
    empathy: number;
    persuasion: number;
    creative: number;
    technicalAffinity: number;
  };
}

export const CAREER_PROGRAMS: CareerProgram[] = [
  {
    id: "business-development",
    legacyRoleId: "business",
    slug: "business-development",
    path: "/career-paths/business-development",
    name: "Business Development",
    hindiName: "बिज़नेस डेवलपमेंट",
    seoTitle: "Business Development Career Training for Freshers | UdaYantu",
    metaDescription:
      "Learn consultative selling, lead research, CRM workflows, and client communication in UdaYantu's 15-week Business Development track for Indian graduates.",
    h1: "Business Development Career Path for Indian Graduates",
    primaryKeyword: "business development training for freshers in India",
    secondaryKeywords: [
      "business development executive jobs after graduation",
      "BDE career path for BA BCom BBA graduates",
      "sales and business development course India",
    ],
    tagline: "Master consultative outreach, client discovery, and structured pipeline management",
    overview:
      "Business Development Executives (BDEs) help companies discover potential clients, understand customer problems, present relevant solutions, and build long-term revenue relationships. It is one of the most accessible, merit-driven corporate entry tracks for BA, B.Com, BBA, and other graduates who enjoy talking with people and working toward clear goals.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["ba", "bcom", "bba", "ma", "mcom", "bsc"],
    whatYouDoDaily: [
      "Research target businesses and decision-makers using LinkedIn and structured directories",
      "Conduct discovery calls and follow-up emails to understand prospect needs",
      "Log leads, call notes, and next steps accurately inside a CRM",
      "Coordinate demos or proposals between prospects and internal teams",
    ],
    coreSkills: [
      "Consultative Discovery & Active Listening",
      "Lead Research & Prospect Qualification",
      "Professional Hindi + English Business Communication",
      "Objection Handling & Ethical Negotiation",
      "CRM Pipeline Hygiene & Follow-Up Discipline",
    ],
    toolsCovered: [
      "CRM Fundamentals (HubSpot / Zoho workflows)",
      "Google Sheets & Lead Trackers",
      "LinkedIn Prospecting & Outreach",
      "Structured Email & Call Scripts",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "Communication Foundations & Customer Psychology",
        topics: [
          "Structuring clear, confident discovery conversations",
          "Understanding B2B vs B2C buyer journeys in India",
          "Overcoming hesitation and call anxiety through guided role-plays",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Lead Generation, Research & Qualification",
        topics: [
          "Building Ideal Customer Profiles (ICPs) and prospect lists",
          "Writing concise cold emails and WhatsApp business follow-ups",
          "Qualifying leads using BANT/problem-first frameworks",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "Consultative Selling & Objection Handling",
        topics: [
          "Handling pricing, timing, and trust objections calmly",
          "Running mock product demos and follow-up recaps",
          "Managing a multi-stage CRM pipeline without missing follow-ups",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Capstone Project, Resume & Interview Readiness",
        topics: [
          "End-to-end mock outreach campaign portfolio project",
          "ATS-friendly resume building and mock HR + sales rounds",
          "Placement coordination and employer interview readiness",
        ],
      },
    ],
    practicalAssignments: [
      "Build a researched 50-account B2B prospect sheet with personalised outreach messages",
      "Record and refine a 5-minute consultative discovery call with mentor rubric feedback",
      "Create a CRM pipeline tracker showing stage conversion and follow-up cadence",
    ],
    entryJobTitles: [
      "Business Development Executive (BDE)",
      "Inside Sales Associate",
      "Sales Development Representative (SDR)",
      "Client Acquisition Associate",
    ],
    honestEligibilityNote:
      "Open to eligible graduates from any stream (BA, B.Com, B.Sc, BBA, BCA, MA, M.Com, M.Sc). Requires willingness to practice spoken communication daily and complete weekly outreach simulations.",
    faqs: [
      {
        question: "Kya BA ya B.Com freshers bina sales experience ke Business Development join kar sakte hain?",
        answer:
          "Haan. Most companies hire freshers for BDE and Inside Sales roles based on communication clarity, listening skills, discipline, and attitude rather than prior degree specialisation.",
      },
      {
        question: "Is fluent English mandatory before joining this track?",
        answer:
          "No. You need basic comprehension and willingness to practice. The 15-week curriculum includes structured workplace communication and role-play drills tailored for Tier 2–4 graduates.",
      },
    ],
    traitWeights: {
      communication: 0.95,
      analytical: 0.45,
      structured: 0.65,
      empathy: 0.6,
      persuasion: 1.0,
      creative: 0.5,
      technicalAffinity: 0.3,
    },
  },
  {
    id: "customer-success",
    legacyRoleId: "customer",
    slug: "customer-success",
    path: "/career-paths/customer-success",
    name: "Customer Success",
    hindiName: "कस्टमर सक्सेस",
    seoTitle: "Customer Success Career Training for Graduates | UdaYantu",
    metaDescription:
      "Prepare for Customer Success Associate roles with onboarding playbooks, retention KPIs, SaaS workflows, and 1:1 mentorship in UdaYantu's 15-week programme.",
    h1: "Customer Success Career Path for Graduates in India",
    primaryKeyword: "customer success associate career for freshers India",
    secondaryKeywords: [
      "customer success jobs after BA BCom BBA",
      "SaaS customer success training India",
      "client onboarding career path",
    ],
    tagline: "Guide customers through onboarding, adoption, and long-term retention",
    overview:
      "Customer Success Associates ensure existing customers get genuine value after buying a product or service. Unlike cold sales, Customer Success focuses on onboarding calls, solving adoption roadblocks, tracking account health, and building lasting trust—making it ideal for empathetic, organised graduates.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["ba", "bcom", "bba", "bca", "ma", "mcom"],
    whatYouDoDaily: [
      "Conduct structured onboarding walkthroughs for new customers",
      "Monitor account usage and proactively check in before problems escalate",
      "Document client feedback and share clear summaries with product and support teams",
      "Prepare renewal checklists and monthly account-health notes",
    ],
    coreSkills: [
      "Customer Onboarding & Walkthrough Delivery",
      "Empathy-Driven Communication & De-Escalation",
      "Retention & Health-Score Tracking",
      "Documentation & Follow-Up Ownership",
      "Cross-Team Issue Coordination",
    ],
    toolsCovered: [
      "CRM & Ticketing Systems",
      "Spreadsheet Health Dashboards (Excel / Google Sheets)",
      "Help-Center & SOP Documentation Tools",
      "Structured Call Recap Templates",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "Customer Lifecycle & Onboarding Excellence",
        topics: [
          "Mapping the post-sale customer journey",
          "Running structured kickoff and onboarding calls",
          "Writing clear step-by-step client instructions",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Empathy-Driven Resolution & Stakeholder Trust",
        topics: [
          "Active listening and calm conflict de-escalation",
          "Managing expectations when issues take time to fix",
          "Building customer trust across Hindi and English audiences",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "Metrics, Retention & Account Health",
        topics: [
          "Understanding CSAT, NPS, Churn, and Adoption metrics",
          "Building a simple account-health tracker in spreadsheets",
          "Identifying expansion or renewal signals ethically",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Portfolio Case Study & Mock Interviews",
        topics: [
          "Designing a complete 30-60-90 day customer onboarding playbook",
          "Mock customer escalation and QBR (Quarterly Business Review) rounds",
          "Resume preparation and placement assistance",
        ],
      },
    ],
    practicalAssignments: [
      "Create a 30-day client onboarding checklist and welcome email sequence",
      "Analyse a sample churn scenario and write a recovery action plan",
      "Build a basic CSAT and account-health dashboard in Google Sheets",
    ],
    entryJobTitles: [
      "Customer Success Associate",
      "Client Onboarding Specialist",
      "Account Coordinator",
      "Relationship Management Associate",
    ],
    honestEligibilityNote:
      "Well-suited for BA, B.Com, BBA, BCA, and PG graduates with patience, structured follow-through, and strong listening skills.",
    faqs: [
      {
        question: "How is Customer Success different from Customer Support?",
        answer:
          "Customer Support typically reacts to incoming tickets and immediate troubleshooting. Customer Success is proactive—helping clients onboard smoothly, adopt features, and stay long-term.",
      },
    ],
    traitWeights: {
      communication: 0.9,
      analytical: 0.65,
      structured: 0.85,
      empathy: 1.0,
      persuasion: 0.55,
      creative: 0.45,
      technicalAffinity: 0.55,
    },
  },
  {
    id: "project-management",
    legacyRoleId: "project",
    slug: "project-management",
    path: "/career-paths/project-management",
    name: "Project Management",
    hindiName: "प्रोजेक्ट मैनेजमेंट",
    seoTitle: "Project Coordination & Management Training for Freshers | UdaYantu",
    metaDescription:
      "Build practical skills in project planning, Agile/Scrum workflows, stakeholder tracking, and coordination in UdaYantu's 15-week fresher-friendly track.",
    h1: "Project Coordination & Management Career Path for Freshers",
    primaryKeyword: "project coordinator jobs after graduation India",
    secondaryKeywords: [
      "project management training for freshers",
      "agile scrum basics for BBA BCom BCA graduates",
      "junior project coordinator career path",
    ],
    tagline: "Organise timelines, coordinate teams, and keep deliverables on track",
    overview:
      "Freshers typically enter this field as Project Coordinators or Junior Project Associates rather than senior Project Managers. You help teams break goals into clear tasks, maintain timelines, track blockers, document meeting action items, and keep stakeholders aligned.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["bba", "bcom", "bca", "bsc", "ba", "mcom", "msc"],
    whatYouDoDaily: [
      "Maintain task boards, milestone schedules, and dependency checklists",
      "Write concise meeting notes with clear owners and deadlines",
      "Follow up politely with cross-functional team members on pending deliverables",
      "Flag schedule risks early and prepare weekly status summaries",
    ],
    coreSkills: [
      "Task Breakdown & Milestone Scheduling",
      "Agile, Scrum & Kanban Workflow Basics",
      "Risk Tracking & Status Reporting",
      "Meeting Facilitation & Stakeholder Updates",
      "Documentation Discipline",
    ],
    toolsCovered: [
      "Kanban & Sprint Boards (Trello / Jira concepts)",
      "Project Trackers & Gantt Timelines in Sheets/Excel",
      "Structured Status Report Templates",
      "SOP & Action-Item Documentation",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "Project Lifecycle & Scope Clarity",
        topics: [
          "Initiation, planning, execution, monitoring, and closure",
          "Breaking large goals into milestones and task checklists",
          "Writing unambiguous task briefs",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Agile, Scrum & Kanban Workflows",
        topics: [
          "Sprint planning, daily stand-ups, and retrospective basics",
          "Managing Kanban columns and Work-In-Progress limits",
          "Collaborating effectively with technical and non-technical teams",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "Risk Management & Stakeholder Reporting",
        topics: [
          "Building simple RAID (Risks, Assumptions, Issues, Dependencies) logs",
          "Writing crisp weekly executive status updates",
          "Handling scope creep and timeline delays constructively",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Capstone Delivery Plan & Interview Prep",
        topics: [
          "Creating an end-to-end sample project rollout plan",
          "Scenario-based mock interviews for Project Coordinator roles",
          "Resume tailoring and placement support",
        ],
      },
    ],
    practicalAssignments: [
      "Build a 6-week project timeline with milestones, owners, and buffer days",
      "Draft a RAID log and weekly stakeholder status report for a mock product launch",
      "Organise a sample Kanban backlog with prioritised user tasks",
    ],
    entryJobTitles: [
      "Project Coordinator",
      "Junior Project Associate",
      "PMO Analyst (Entry-Level)",
      "Delivery Coordinator",
    ],
    honestEligibilityNote:
      "Most graduates start as Project Coordinators or PMO Associates before progressing to Project Manager roles with experience. Industry certifications like CAPM/PMP are external credentials not issued by UdaYantu.",
    faqs: [
      {
        question: "Do freshers become Project Managers immediately after graduation?",
        answer:
          "Usually freshers start as Project Coordinators, Junior Project Associates, or PMO Analysts, where they support project tracking and gradually grow into full Project Manager roles.",
      },
    ],
    traitWeights: {
      communication: 0.8,
      analytical: 0.75,
      structured: 1.0,
      empathy: 0.65,
      persuasion: 0.5,
      creative: 0.45,
      technicalAffinity: 0.65,
    },
  },
  {
    id: "operations-management",
    legacyRoleId: "operations",
    slug: "operations-management",
    path: "/career-paths/operations-management",
    name: "Operations Management",
    hindiName: "ऑपरेशंस मैनेजमेंट",
    seoTitle: "Operations Management Career Training for Freshers | UdaYantu",
    metaDescription:
      "Learn process SOPs, spreadsheet reporting, vendor coordination, and operational execution in UdaYantu's 15-week Operations Management track for graduates.",
    h1: "Operations Management Career Path for Indian Graduates",
    primaryKeyword: "operations executive jobs after graduation India",
    secondaryKeywords: [
      "operations management career for BCom BSc BBA freshers",
      "business operations training India",
      "supply chain and MIS operations jobs",
    ],
    tagline: "Keep daily business processes accurate, timely, and scalable",
    overview:
      "Operations teams are the backbone of e-commerce, logistics, EdTech, BFSI, healthcare administration, and service companies. Operations Executives monitor daily workflows, resolve bottlenecks, coordinate with vendors or internal teams, and maintain accurate spreadsheet trackers.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["bcom", "bsc", "bba", "bca", "ba", "mcom", "msc"],
    whatYouDoDaily: [
      "Track daily orders, service tickets, or dispatch checklists against SLAs",
      "Update Excel/Google Sheets MIS trackers and highlight bottlenecks",
      "Coordinate with vendors, field teams, or internal departments",
      "Follow and improve Standard Operating Procedures (SOPs)",
    ],
    coreSkills: [
      "Process Mapping & SOP Writing",
      "Excel / Google Sheets Formulas & MIS Reporting",
      "SLA Monitoring & Root-Cause Analysis",
      "Vendor & Cross-Team Coordination",
      "Quality Audits & Error Reduction",
    ],
    toolsCovered: [
      "Microsoft Excel & Google Sheets (VLOOKUP/XLOOKUP, Pivot Tables, Dashboards)",
      "Process Flowcharts & SOP Templates",
      "Ticketing & Operations Trackers",
      "Quality Audit Checklists",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "Operations Fundamentals & SOP Design",
        topics: [
          "How daily operations work in startups and enterprises",
          "Writing step-by-step SOPs and quality checklists",
          "Understanding SLAs, turnaround times, and error rates",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Spreadsheet Mastery & MIS Reporting",
        topics: [
          "Cleaning raw operational data in Excel / Google Sheets",
          "Pivot tables, conditional formatting, and daily MIS trackers",
          "Presenting operational summaries clearly to managers",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "Supply Chain Basics & Bottleneck Solving",
        topics: [
          "Inventory, dispatch, and service-delivery coordination basics",
          "5-Whys root-cause analysis for recurring operational errors",
          "Vendor follow-ups and escalation communication",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Operations Case Study & Placement Prep",
        topics: [
          "Auditing a broken workflow and presenting an improved SOP + tracker",
          "Practical Excel test practice and mock interviews",
          "Resume preparation and placement support",
        ],
      },
    ],
    practicalAssignments: [
      "Create a daily Operations MIS dashboard using Pivot Tables and SLA status formulas",
      "Write a clear 1-page SOP for order/ticket escalation handling",
      "Complete a 5-Whys root-cause case study on delivery delays",
    ],
    entryJobTitles: [
      "Operations Executive",
      "Business Operations Associate",
      "MIS & Operations Coordinator",
      "Process Associate",
    ],
    honestEligibilityNote:
      "Strong fit for B.Com, B.Sc, BBA, BCA, BA, and PG graduates who enjoy structured work, accuracy, and spreadsheet-based problem solving.",
    faqs: [
      {
        question: "B.Sc ya B.Com freshers ke liye Operations kyon accha option hai?",
        answer:
          "Operations rewards logical thinking, comfort with numbers/spreadsheets, and reliable follow-through—skills that B.Sc, B.Com, BBA, and organised BA graduates can demonstrate quickly.",
      },
    ],
    traitWeights: {
      communication: 0.65,
      analytical: 0.95,
      structured: 1.0,
      empathy: 0.5,
      persuasion: 0.35,
      creative: 0.35,
      technicalAffinity: 0.75,
    },
  },
  {
    id: "product-management",
    legacyRoleId: "product",
    slug: "product-management",
    path: "/career-paths/product-management",
    name: "Product Management",
    hindiName: "प्रोडक्ट मैनेजमेंट",
    seoTitle: "Product Operations & Associate PM Training for Graduates | UdaYantu",
    metaDescription:
      "Learn user research, requirement documentation, wireframing basics, and product analytics for entry-level Product Analyst and Product Operations roles.",
    h1: "Product Management & Product Operations Pathway for Freshers",
    primaryKeyword: "product management pathway for freshers India",
    secondaryKeywords: [
      "associate product manager fresher skills",
      "product operations jobs after BCA BBA BSc",
      "product analyst career for non-tech graduates",
    ],
    tagline: "Understand user problems, structure requirements, and support digital products",
    overview:
      "Direct Product Manager hiring for freshers is competitive; most non-engineering freshers break in through Product Operations, Product Support, Junior Business Analyst, or Associate Product Manager (APM) roles. This track builds structured user research, feature documentation, basic analytics, and stakeholder communication.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["bca", "bba", "bsc", "bcom", "ba", "msc"],
    whatYouDoDaily: [
      "Interview users or review support feedback to spot friction points",
      "Write clear user stories, acceptance criteria, and bug reproduction notes",
      "Track funnel drop-offs and basic product metrics in spreadsheets",
      "Coordinate feature testing and release checklists across teams",
    ],
    coreSkills: [
      "User Research & Problem Framing",
      "Writing Clear PRDs & User Stories",
      "Prioritisation Frameworks & Wireframe Flows",
      "Funnel Metrics & Structured Analysis",
      "Cross-Functional Communication",
    ],
    toolsCovered: [
      "Basic Wireframing & Flow Diagrams",
      "Spreadsheet Funnel Analysis",
      "User Story & Requirement Templates",
      "Usability Testing Scripts",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "User Research & Bharat Market Insights",
        topics: [
          "Conducting unbiased user interviews with Tier 2–4 mobile users",
          "Turning user complaints into clear problem statements",
          "Competitive product tear-downs",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Requirements, Flows & Prioritisation",
        topics: [
          "Mapping user flows and simple low-fidelity wireframes",
          "Writing crisp user stories and acceptance criteria",
          "Prioritising features using Impact vs Effort frameworks",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "Metrics, Testing & Product Operations",
        topics: [
          "Understanding activation, retention, and conversion funnels",
          "Running structured UAT (User Acceptance Testing) checklists",
          "Communicating release notes clearly to support and sales teams",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Product Case Portfolio & Interview Prep",
        topics: [
          "Building a written product teardown + improvement portfolio",
          "Practising product-sense and analytical interview rounds",
          "Targeting Product Operations, Product Support, and Junior Analyst roles",
        ],
      },
    ],
    practicalAssignments: [
      "Write a 2-page product teardown of an Indian consumer app with 3 realistic UX improvements",
      "Draft user stories and a QA checklist for a mobile onboarding flow",
      "Analyse a sample signup funnel dataset to identify the biggest drop-off step",
    ],
    entryJobTitles: [
      "Product Operations Associate",
      "Product Support Analyst",
      "Junior Business Analyst",
      "Associate Product Manager Trainee",
    ],
    honestEligibilityNote:
      "This track does NOT teach software coding. It prepares analytical graduates for Product Operations, Product Support, Junior Business Analyst, and entry-level APM screening.",
    faqs: [
      {
        question: "Can a non-coding graduate enter the product field?",
        answer:
          "Yes, typically via Product Operations, Product Support, Business Analyst, or Associate Product roles where user understanding, structured documentation, and analytical thinking matter most.",
      },
    ],
    traitWeights: {
      communication: 0.8,
      analytical: 0.95,
      structured: 0.85,
      empathy: 0.85,
      persuasion: 0.55,
      creative: 0.85,
      technicalAffinity: 0.9,
    },
  },
  {
    id: "human-resources",
    legacyRoleId: "hr",
    slug: "human-resources",
    path: "/career-paths/human-resources",
    name: "Human Resources",
    hindiName: "ह्यूमन रिसोर्सेज (HR)",
    seoTitle: "Human Resources (HR) Career Training for Freshers | UdaYantu",
    metaDescription:
      "Prepare for HR Recruiter and HR Coordinator roles with sourcing, candidate screening, onboarding workflows, and people operations training at UdaYantu.",
    h1: "Human Resources (HR) & Talent Acquisition Career Path for Freshers",
    primaryKeyword: "HR recruiter jobs after graduation in India",
    secondaryKeywords: [
      "HR jobs after BA BCom BBA",
      "talent acquisition training for freshers",
      "HR coordinator career guide India",
    ],
    tagline: "Source talent, coordinate interviews, and support employee onboarding",
    overview:
      "Human Resources freshers usually begin in Talent Acquisition (Recruitment) or HR Operations. You screen resumes, speak with candidates, schedule interviews, maintain recruitment trackers, and coordinate smooth employee onboarding.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["ba", "bba", "bcom", "ma", "mcom"],
    whatYouDoDaily: [
      "Understand hiring requirements and source matching resumes on job portals",
      "Conduct initial screening calls and assess basic candidate alignment",
      "Schedule interviews between candidates and hiring managers",
      "Maintain ATS/spreadsheet hiring trackers and onboarding checklists",
    ],
    coreSkills: [
      "Resume Screening & Boolean Search Basics",
      "Structured Candidate Screening Calls",
      "Interview Coordination & ATS Tracking",
      "Employee Onboarding Documentation",
      "Workplace Policies & Ethical Confidentiality",
    ],
    toolsCovered: [
      "Job Portal Sourcing Concepts & LinkedIn Search",
      "Applicant Tracking Spreadsheets",
      "Structured Screening Scorecards",
      "Onboarding & Documentation Checklists",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "Talent Acquisition & Job Description Analysis",
        topics: [
          "Decoding job descriptions into must-have vs good-to-have skills",
          "Sourcing candidates cleanly and reviewing resumes objectively",
          "Writing respectful, clear candidate outreach messages",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Screening Calls & Interview Coordination",
        topics: [
          "Conducting structured 10-minute phone screens",
          "Managing multi-round interview calendars without miscommunication",
          "Tracking recruitment funnel metrics (sourced → shortlisted → offered)",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "HR Operations, Engagement & Compliance Basics",
        topics: [
          "New-hire onboarding workflows and document verification checklists",
          "Understanding basic Indian workplace compliance concepts (PF/ESIC/leave policies overview)",
          "Maintaining confidentiality and professional conduct",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Recruitment Portfolio & Interview Readiness",
        topics: [
          "Running a simulated end-to-end fresher hiring drive tracker",
          "Mock HR recruiter interviews and communication feedback",
          "Resume preparation and placement assistance",
        ],
      },
    ],
    practicalAssignments: [
      "Break down 3 real job descriptions into screening scorecards",
      "Build a candidate pipeline tracker with stage conversion formulas",
      "Draft an employee Day-1 to Day-30 onboarding checklist",
    ],
    entryJobTitles: [
      "HR Recruiter (Fresher)",
      "Talent Acquisition Coordinator",
      "HR Operations Executive",
      "People Operations Associate",
    ],
    honestEligibilityNote:
      "Accessible to BA (especially Psychology/English/Sociology), BBA, B.Com, and MA graduates. Specialist payroll or legal compliance roles may require additional dedicated qualifications.",
    faqs: [
      {
        question: "Do I need an MBA to get an entry-level HR job?",
        answer:
          "No. Many staffing firms, startups, and mid-size companies hire BA, BBA, and B.Com graduates as Junior HR Recruiters and HR Coordinators without an MBA.",
      },
    ],
    traitWeights: {
      communication: 0.9,
      analytical: 0.55,
      structured: 0.85,
      empathy: 0.95,
      persuasion: 0.65,
      creative: 0.5,
      technicalAffinity: 0.35,
    },
  },
  {
    id: "marketing-management",
    legacyRoleId: "marketing",
    slug: "marketing-management",
    path: "/career-paths/marketing-management",
    name: "Marketing Management",
    hindiName: "मार्केटिंग मैनेजमेंट",
    seoTitle: "Marketing & Digital Growth Training for Freshers | UdaYantu",
    metaDescription:
      "Build practical skills in content planning, SEO fundamentals, social media calendars, and campaign analytics in UdaYantu's 15-week Marketing track.",
    h1: "Marketing & Digital Growth Career Path for Indian Graduates",
    primaryKeyword: "marketing executive jobs for freshers India",
    secondaryKeywords: [
      "digital marketing career after BA BBA BCom",
      "content and marketing jobs for freshers",
      "marketing training for graduates India",
    ],
    tagline: "Plan campaigns, craft clear audience messaging, and measure results",
    overview:
      "Entry-level Marketing roles combine audience understanding, clear writing, campaign execution, and performance tracking. Freshers work across social media coordination, content marketing, SEO support, and campaign reporting.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["ba", "bba", "bcom", "ma", "mcom"],
    whatYouDoDaily: [
      "Plan weekly social media and content calendars aligned to audience questions",
      "Research keywords, competitors, and customer pain points",
      "Write clear ad copy, landing-page sections, or short-form scripts",
      "Track campaign impressions, clicks, and conversion metrics in reports",
    ],
    coreSkills: [
      "Audience Research & Positioning",
      "Content & Copywriting Fundamentals",
      "Search & Social Media Basics",
      "Campaign Tracking & Performance Reporting",
      "Brand Consistency & Creative Briefs",
    ],
    toolsCovered: [
      "Google Analytics 4 & Search Console Basics",
      "Content Calendar & Keyword Spreadsheets",
      "Canva / Visual Brief Collaboration",
      "Landing Page & Email Copy Frameworks",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "Marketing Foundations & Audience Insights",
        topics: [
          "Understanding customer personas in Tier 1–4 Indian markets",
          "Value proposition framing and competitor positioning",
          "Writing clear, benefit-led headlines without fluff",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Content Strategy, SEO & Social Media",
        topics: [
          "Search-intent keyword mapping and on-page content structure",
          "Planning consistent social media content calendars",
          "Writing crisp captions, emails, and short explainers",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "Campaign Execution & Analytics Basics",
        topics: [
          "Understanding CTR, CPC, CAC, and conversion funnels",
          "Reading GA4 traffic and engagement reports",
          "Iterating campaigns based on real user response",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Marketing Portfolio & Mock Interviews",
        topics: [
          "Building a 3-piece portfolio (content plan, SEO brief, campaign report)",
          "Mock interviews for Marketing Executive & Social Media Associate roles",
          "Resume preparation and placement support",
        ],
      },
    ],
    practicalAssignments: [
      "Build a 30-day content calendar for an Indian regional brand",
      "Write an SEO article outline + landing page copy targeting a real audience question",
      "Analyse a sample campaign spreadsheet to recommend budget reallocation",
    ],
    entryJobTitles: [
      "Marketing Executive",
      "Digital Marketing Associate",
      "Social Media Coordinator",
      "Content & SEO Executive",
    ],
    honestEligibilityNote:
      "Great match for BA (English, Journalism, Economics), BBA, B.Com, and MA graduates who enjoy writing, visual storytelling, and audience psychology.",
    faqs: [
      {
        question: "Do I need a graphic design degree to enter Marketing?",
        answer:
          "No. Entry-level marketing roles focus on clear communication, audience research, content planning, coordination, and basic campaign tracking—not advanced graphic design.",
      },
    ],
    traitWeights: {
      communication: 0.9,
      analytical: 0.7,
      structured: 0.65,
      empathy: 0.75,
      persuasion: 0.85,
      creative: 1.0,
      technicalAffinity: 0.55,
    },
  },
  {
    id: "customer-support",
    legacyRoleId: "support",
    slug: "customer-support",
    path: "/career-paths/customer-support",
    name: "Customer Support",
    hindiName: "कस्टमर सपोर्ट",
    seoTitle: "Customer Support & Technical Support Training for Freshers | UdaYantu",
    metaDescription:
      "Build workplace communication, ticketing workflows, SLA discipline, and troubleshooting habits for Customer Support and Product Support fresher roles.",
    h1: "Customer Support & Service Operations Career Path for Freshers",
    primaryKeyword: "customer support executive jobs after graduation India",
    secondaryKeywords: [
      "customer support fresher jobs without experience",
      "chat email voice support training India",
      "technical support jobs after BCA BSc BA",
    ],
    tagline: "Resolve customer issues accurately with empathy, speed, and clear writing",
    overview:
      "Customer Support (Voice, Chat, Email, and Technical/Application Support) is one of the largest entry doors into corporate careers in India. Strong performers build real product knowledge and frequently grow into Customer Success, Quality Assurance, Team Lead, or Operations roles.",
    duration: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    difficulty: "Fresher-Friendly",
    bestForDegrees: ["ba", "bcom", "bsc", "bca", "bba", "ma", "mcom", "msc"],
    whatYouDoDaily: [
      "Respond to customer queries via chat, email, or phone with clarity and empathy",
      "Log issues accurately in a ticketing system and follow SLA timelines",
      "Troubleshoot common account, order, or application issues using SOPs",
      "Escalate complex bugs or billing cases with complete diagnostic notes",
    ],
    coreSkills: [
      "Clear Spoken & Written Communication (Email/Chat/Voice)",
      "Ticketing Hygiene & SLA Time Management",
      "Structured Troubleshooting & Issue Reproduction",
      "Empathy & Calm Handling of Frustrated Users",
      "Documentation & Knowledge-Base Updates",
    ],
    toolsCovered: [
      "Helpdesk & Ticketing Workflows (Freshdesk / Zendesk concepts)",
      "Macros, Escalation Templates & Knowledge Bases",
      "Basic Diagnostic Checklists",
      "CSAT & First-Response-Time Tracking",
    ],
    modules: [
      {
        weekRange: "Weeks 1–4",
        title: "Professional Communication & Active Listening",
        topics: [
          "Writing crisp, polite email and chat responses",
          "Voice clarity, pacing, and tone for phone support",
          "Understanding customer intent accurately on the first read",
        ],
      },
      {
        weekRange: "Weeks 5–8",
        title: "Ticketing Systems, SLAs & Troubleshooting",
        topics: [
          "Categorising, prioritising, and tagging support tickets",
          "Structured step-by-step troubleshooting checklists",
          "Writing clean bug/escalation handoffs for L2/tech teams",
        ],
      },
      {
        weekRange: "Weeks 9–12",
        title: "De-Escalation & Quality Metrics",
        topics: [
          "Turning difficult interactions into calm resolutions",
          "Understanding FRT (First Response Time), AHT, and CSAT",
          "Avoiding common copy-paste errors",
        ],
      },
      {
        weekRange: "Weeks 13–15",
        title: "Support Simulations & Interview Preparation",
        topics: [
          "Timed chat + email + mock call evaluation",
          "Typing speed, grammar check, and HR/Operations mock rounds",
          "Resume preparation and placement support",
        ],
      },
    ],
    practicalAssignments: [
      "Write responses for 10 realistic customer scenarios (refund delay, login issue, angry escalation)",
      "Complete a mock ticketing queue prioritisation and escalation log",
      "Build a mini FAQ help article solving a recurring product problem",
    ],
    entryJobTitles: [
      "Customer Support Executive (Chat/Email/Voice)",
      "Technical Support Associate (L1)",
      "Product Support Executive",
      "Service Desk Analyst",
    ],
    honestEligibilityNote:
      "Accessible across all graduate streams. BCA and B.Sc CS graduates can pair this track with their academic computing familiarity to target L1 Technical & Application Support roles.",
    faqs: [
      {
        question: "Kya Customer Support se aage career growth hoti hai?",
        answer:
          "Haan. Many professionals start in Customer Support to enter the corporate ecosystem and move within 12–24 months into Customer Success, Quality Analyst, Operations, or Team Lead roles.",
      },
    ],
    traitWeights: {
      communication: 0.9,
      analytical: 0.65,
      structured: 0.8,
      empathy: 0.95,
      persuasion: 0.4,
      creative: 0.3,
      technicalAffinity: 0.7,
    },
  },
];

export const CAREER_PROGRAM_BY_SLUG: Record<CareerTrackId, CareerProgram> = CAREER_PROGRAMS.reduce(
  (acc, item) => {
    acc[item.slug] = item;
    return acc;
  },
  {} as Record<CareerTrackId, CareerProgram>
);

export function getCareerProgramBySlug(slug: string): CareerProgram | undefined {
  return CAREER_PROGRAMS.find((p) => p.slug === slug);
}
