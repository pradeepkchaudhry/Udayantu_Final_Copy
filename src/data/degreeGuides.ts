import type { CareerTrackId, DegreeSlug } from "./careerPrograms";

export interface DegreeRoleEntry {
  title: string;
  whatItInvolves: string;
  whyDegreeFits: string;
  requiredSkills: string[];
  typicalTools: string[];
  communicationLevel: string;
  howToPrepare: string;
  portfolioExample: string;
  additionalQualification: string;
  whereToFindVacancies: string;
  matchedUdayantuTrack?: CareerTrackId;
}

export interface SpecializationPath {
  name: string;
  hinglishHook: string;
  suitableRoles: string[];
  keyEdge: string;
  honestCaveat: string;
}

export interface RoadmapPhase {
  phase: string;
  focus: string;
  actions: string[];
}

export interface DegreeGuideData {
  slug: DegreeSlug;
  path: `/jobs-after-${DegreeSlug}`;
  degreeLabel: string;
  degreeFullName: string;
  level: "Undergraduate" | "Postgraduate";
  seoTitle: string;
  metaDescription: string;
  h1: string;
  hindiSubtitle: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  directAnswer: string;
  hinglishContext: string;
  quickOverviewPoints: string[];
  honestBoundaryNotice: string;
  roles: DegreeRoleEntry[];
  specializations: SpecializationPath[];
  roadmap: RoadmapPhase[];
  resumeGuidance: string[];
  interviewGuidance: string[];
  regionalInsight: string;
  matchedUdayantuTracks: CareerTrackId[];
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  faqs: Array<{ question: string; answer: string }>;
  relatedBlogSlugs: string[];
}

export const DEGREE_GUIDES: DegreeGuideData[] = [
  // =========================================================================
  // 1. BA AFTER GRADUATION
  // =========================================================================
  {
    slug: "ba",
    path: "/jobs-after-ba",
    degreeLabel: "BA",
    degreeFullName: "Bachelor of Arts (BA)",
    level: "Undergraduate",
    seoTitle: "BA Ke Baad Job Kaise Milegi? Career Options & Skills | UdaYantu",
    metaDescription:
      "BA ke baad kaun-si private jobs mil sakti hain? Explore realistic fresher career options, BA English/Economics/Psychology roles, required skills, and a 90-day preparation roadmap.",
    h1: "BA ke baad kaun-si jobs mil sakti hain? Complete Career Guide for BA Graduates",
    hindiSubtitle: "बीए के बाद नौकरी कैसे मिलेगी? फ्रेशर्स के लिए प्रैक्टिकल करियर गाइड",
    primaryKeyword: "BA ke baad job kaise milegi",
    secondaryKeywords: [
      "B.A. walo ke liye naukri",
      "BA pass ke liye private job",
      "BA ke baad career options",
      "BA ke baad bina experience ke job",
      "BA graduate jobs for freshers",
    ],
    directAnswer:
      "BA complete karne ke baad aapko private sector mein Business Development Executive, Customer Support Executive, Customer Success Associate, HR Recruiter, Marketing Executive, Content & Communication Associate, Operations Executive, aur Project Coordinator jaise entry-level roles mil sakte hain—bina kisi technical degree ya prior work experience ke. Hiring managers BA graduates mein teen practical cheezein dekhte hain: clear communication (Hindi + workplace English), basic computer/spreadsheet fluency, aur real-world assignment proof.",
    hinglishContext:
      "Bahut saare BA students ko lagta hai ki sirf sarkari naukri (SSC, Railway, Banking) hi ek option hai. Government exams ke saath-saath India ke SaaS, EdTech, BFSI, e-commerce, staffing, aur service companies har mahine aise non-technical freshers hire karti hain jo customers, teams, aur daily workflows ko reliably handle kar sakein.",
    quickOverviewPoints: [
      "No coding or engineering degree needed for client-facing, HR, operations, and support tracks",
      "Practical portfolio assignments matter far more than college tier or percentage alone",
      "Subject strengths (English, Economics, Psychology, Political Science, History) map to distinct entry roles",
      "A focused 90-day skill + communication plan helps bridge the gap from BA degree to first interview",
    ],
    honestBoundaryNotice:
      "A BA degree does not automatically qualify a fresher for regulated technical, clinical psychology, legal practice, or chartered accounting positions—those require dedicated degrees, licences, or postgraduate credentials. Below are genuine corporate entry pathways open to BA graduates who build practical workplace skills.",
    roles: [
      {
        title: "Business Development Executive (BDE)",
        whatItInvolves:
          "Researching prospective clients, conducting discovery calls, explaining product value clearly, following up via email/WhatsApp, and keeping CRM lead pipelines updated.",
        whyDegreeFits:
          "BA graduates who communicate warmly and understand human context adapt quickly to consultative outreach and regional Indian customer conversations.",
        requiredSkills: ["Active Listening", "Consultative Discovery", "Objection Handling", "CRM Tracking"],
        typicalTools: ["HubSpot / Zoho CRM", "Google Sheets", "LinkedIn", "Email"],
        communicationLevel: "Clear spoken Hindi + functional workplace English",
        howToPrepare: "Practice 5-minute discovery role-plays, learn lead qualification basics, and build a mock outreach sheet.",
        portfolioExample: "A 50-company prospect research sheet with tailored cold email + WhatsApp follow-up scripts.",
        additionalQualification: "None required for entry-level roles; structured role-play practice is essential.",
        whereToFindVacancies: "National Career Service (NCS), LinkedIn Jobs, Naukri, company career pages, and verified campus/placement drives.",
        matchedUdayantuTrack: "business-development",
      },
      {
        title: "Customer Support Executive",
        whatItInvolves:
          "Helping users solve account, order, or product questions via chat, email, or phone while meeting response-time (SLA) and customer-satisfaction targets.",
        whyDegreeFits:
          "One of the most accessible entry doors for BA freshers without prior experience—rewards patience, accurate writing, and calm problem solving.",
        requiredSkills: ["Email & Chat Clarity", "Active Listening", "Ticketing Discipline", "De-Escalation"],
        typicalTools: ["Freshdesk / Zendesk workflows", "Knowledge Bases", "Google Workspace"],
        communicationLevel: "Polite written English and clear spoken Hindi/English",
        howToPrepare: "Improve typing accuracy, practice writing concise empathetic email replies, and learn SLA/ticket basics.",
        portfolioExample: "Written resolution samples for 10 realistic customer scenarios (refund delay, login failure, escalation).",
        additionalQualification: "None required; typing speed (30+ WPM) and grammar clarity help clear screening tests.",
        whereToFindVacancies: "NCS portal, Naukri, LinkedIn, e-commerce/SaaS/fintech career pages.",
        matchedUdayantuTrack: "customer-support",
      },
      {
        title: "Customer Success Associate",
        whatItInvolves:
          "Onboarding new clients after signup, walking them through product setup, checking adoption health, and coordinating fixes so customers stay long-term.",
        whyDegreeFits:
          "BA Psychology, English, and Sociology graduates often excel at relationship building, empathetic listening, and explaining concepts simply.",
        requiredSkills: ["Client Onboarding", "Empathy", "Follow-Up Ownership", "Basic Retention Metrics"],
        typicalTools: ["CRM Dashboards", "Google Sheets", "Slide Decks", "Helpdesk Tools"],
        communicationLevel: "Structured spoken & written English plus regional fluency",
        howToPrepare: "Practice walking someone through an app step-by-step and learn CSAT/NPS/churn basics.",
        portfolioExample: "A 30-day new-customer onboarding checklist and welcome email sequence for a SaaS tool.",
        additionalQualification: "None required for junior associate roles.",
        whereToFindVacancies: "SaaS & EdTech company career portals, LinkedIn, Naukri.",
        matchedUdayantuTrack: "customer-success",
      },
      {
        title: "HR Recruiter (Talent Acquisition)",
        whatItInvolves:
          "Reading job descriptions, searching candidate resumes, conducting initial screening calls, scheduling interviews, and tracking hiring stages.",
        whyDegreeFits:
          "BA graduates (especially Psychology, English, Humanities) naturally bring people judgement, respectful conversation skills, and structured documentation.",
        requiredSkills: ["Resume Screening", "Phone Screening", "Interview Scheduling", "ATS Spreadsheets"],
        typicalTools: ["LinkedIn / Job Portals", "Excel / Sheets Trackers", "Calendar Scheduling"],
        communicationLevel: "Clear professional Hindi + English phone communication",
        howToPrepare: "Practice converting job descriptions into 5 screening questions and maintaining a candidate funnel sheet.",
        portfolioExample: "A hiring scorecard + 20-candidate mock recruitment funnel tracker.",
        additionalQualification: "No MBA required for Junior Recruiter roles; payroll/labour-law specialist roles need separate study.",
        whereToFindVacancies: "Staffing agencies, startups, LinkedIn, Naukri, NCS.",
        matchedUdayantuTrack: "human-resources",
      },
      {
        title: "Marketing Executive",
        whatItInvolves:
          "Supporting social media calendars, competitor research, keyword planning, email campaigns, and weekly campaign performance summaries.",
        whyDegreeFits:
          "Arts and Humanities students understand storytelling, cultural context across Tier 2–4 India, and audience messaging.",
        requiredSkills: ["Audience Research", "Copywriting Basics", "SEO & Social Basics", "Campaign Reporting"],
        typicalTools: ["Google Analytics 4", "Search Console", "Canva", "Sheets"],
        communicationLevel: "Strong written English or bilingual Hindi-English clarity",
        howToPrepare: "Practice writing crisp benefit-focused posts, learn basic SEO/GA4 metrics, and study Indian consumer brands.",
        portfolioExample: "A 30-day social + content calendar and a sample SEO brief for a local Indian brand.",
        additionalQualification: "None required; sample writing/campaign work is key.",
        whereToFindVacancies: "Digital agencies, D2C brands, startups, LinkedIn, Internshala.",
        matchedUdayantuTrack: "marketing-management",
      },
      {
        title: "Content & Communication Associate",
        whatItInvolves:
          "Writing blogs, help articles, product descriptions, Hindi/English scripts, newsletters, and internal documentation.",
        whyDegreeFits:
          "BA English, Hindi, Journalism, History, and Political Science graduates already practice reading, synthesising information, and structured essay writing.",
        requiredSkills: ["Structured Research", "Grammar & Editing", "Audience Adaptation", "SEO Formatting"],
        typicalTools: ["Google Docs", "Grammarly", "CMS Editors", "Keyword Planners"],
        communicationLevel: "High written accuracy in English and/or Hindi",
        howToPrepare: "Write 4–5 well-researched sample articles solving real questions; focus on clarity over complex vocabulary.",
        portfolioExample: "A Google Drive portfolio of 3 published/sample guides + 1 product help-center article.",
        additionalQualification: "No separate degree needed; writing samples decide shortlisting.",
        whereToFindVacancies: "EdTech companies, media houses, content agencies, LinkedIn.",
        matchedUdayantuTrack: "marketing-management",
      },
      {
        title: "Operations Executive",
        whatItInvolves:
          "Monitoring daily orders, schedules, or service queues, updating Excel/Google Sheets trackers, and coordinating across teams to hit daily SLAs.",
        whyDegreeFits:
          "BA Economics and organised BA graduates who learn Excel formulas and SOP discipline perform reliably in back-office and service operations.",
        requiredSkills: ["Excel / Sheets (Pivot Tables, Lookups)", "SOP Compliance", "SLA Tracking", "Attention to Detail"],
        typicalTools: ["Microsoft Excel", "Google Sheets", "Internal Ops Portals"],
        communicationLevel: "Clear written updates and calm coordination",
        howToPrepare: "Practice cleaning datasets, building daily status trackers, and documenting standard checklists.",
        portfolioExample: "A daily SLA tracker dashboard in Google Sheets with automated overdue flags.",
        additionalQualification: "Basic spreadsheet proficiency is essential.",
        whereToFindVacancies: "Logistics, e-commerce, EdTech, BFSI back-office roles on Naukri, NCS, LinkedIn.",
        matchedUdayantuTrack: "operations-management",
      },
      {
        title: "Project Coordinator (Entry-Level)",
        whatItInvolves:
          "Tracking project milestones, writing meeting action notes, following up on pending deliverables, and sharing weekly status updates.",
        whyDegreeFits:
          "Detail-oriented BA graduates who excel at organisation, note-taking, and clear cross-team follow-ups grow well in coordination roles.",
        requiredSkills: ["Milestone Tracking", "Meeting Notes", "Agile/Kanban Basics", "Status Reporting"],
        typicalTools: ["Trello / Jira basics", "Google Sheets", "Docs & Calendars"],
        communicationLevel: "Concise written & spoken English",
        howToPrepare: "Learn basic Agile/Kanban terminology and practice turning a messy meeting transcript into clear action items.",
        portfolioExample: "A 6-week mock project tracker with milestones, owners, and risk log.",
        additionalQualification: "No PMP required for coordinator roles; practical coordination samples help.",
        whereToFindVacancies: "IT services, agencies, EdTech, consulting support teams on LinkedIn & Naukri.",
        matchedUdayantuTrack: "project-management",
      },
    ],
    specializations: [
      {
        name: "BA English",
        hinglishHook: "BA English ke baad job options",
        suitableRoles: ["Content & Communication Associate", "Customer Success Associate", "Marketing Executive", "HR Recruiter"],
        keyEdge: "Strong reading comprehension, written clarity, and structured storytelling.",
        honestCaveat: "Academic literary writing differs from business writing—practice concise emails, crisp summaries, and practical workplace copy.",
      },
      {
        name: "BA Economics",
        hinglishHook: "BA Economics ke baad job options",
        suitableRoles: ["Operations Executive", "Business Development Executive", "Marketing Research Support", "Project Coordinator"],
        keyEdge: "Comfort with numbers, trends, markets, and logical cause-effect reasoning.",
        honestCaveat: "Core economist or quantitative finance roles usually require MA Economics/MBA or statistical programming; for corporate fresher jobs, pair Economics with strong Excel + MIS skills.",
      },
      {
        name: "BA Psychology",
        hinglishHook: "BA Psychology ke baad job options",
        suitableRoles: ["HR Recruiter", "Customer Success Associate", "Customer Support Executive", "User Research / Marketing Support"],
        keyEdge: "Strong understanding of human behaviour, listening, empathy, and motivation.",
        honestCaveat: "Practising as a Clinical Psychologist in India requires RCI-recognised M.Phil/postgraduate licensing—corporate HR and Customer Success are separate non-clinical career paths.",
      },
      {
        name: "BA Political Science",
        hinglishHook: "BA Political Science ke baad job options",
        suitableRoles: ["Business Development Executive", "Operations Executive", "Content/Research Associate", "Customer Support Executive"],
        keyEdge: "Broad awareness of governance, policy, communication, and structured argumentation.",
        honestCaveat: "If preparing for UPSC/State PCS alongside a private job, choose structured shift roles like Customer Support or Operations with predictable hours.",
      },
      {
        name: "BA History",
        hinglishHook: "BA History ke baad job options",
        suitableRoles: ["Content & Documentation Associate", "Customer Support Executive", "HR Coordinator", "Business Development Executive"],
        keyEdge: "Deep research patience, synthesis of large information sets, and written clarity.",
        honestCaveat: "Museum, archaeology, or teaching careers require MA/B.Ed/NET qualifications; for private corporate roles, focus on practical tools (Excel, CRM, email writing).",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Clarity & Workplace Foundations",
        focus: "Pick 1–2 realistic tracks instead of applying blindly to 100 unrelated jobs",
        actions: [
          "Complete a structured aptitude & career assessment aligned to your strengths",
          "Build daily 30-minute spoken + written workplace English & Hindi clarity habits",
          "Learn core Google Workspace / Excel basics (formatting, sorting, filters, basic formulas)",
        ],
      },
      {
        phase: "Days 31–60: Role Skills & Proof of Work",
        focus: "Build 2–3 tangible portfolio assignments hiring managers can inspect",
        actions: [
          "Practice role-specific workflows (CRM tracking for BD, ticketing for Support, screening for HR, MIS sheets for Operations)",
          "Complete realistic weekly assignments and get structured feedback from a mentor",
          "Create a clean 1-page ATS-friendly resume highlighting projects instead of filler objectives",
        ],
      },
      {
        phase: "Days 61–90: Mock Interviews & Targeted Applications",
        focus: "Convert interviews into job offers through disciplined practice",
        actions: [
          "Run at least 4–5 mock HR and role-specific scenario interviews",
          "Apply selectively on NCS, LinkedIn, Naukri, and placement drives with role-tailored resumes",
          "Track every application, follow up professionally, and refine weak answers after each round",
        ],
      },
    ],
    resumeGuidance: [
      "Keep your fresher resume to 1 clean page—avoid decorative templates that break ATS scanners.",
      "Replace generic career objectives with a 2-line Role Summary naming your target role and 3 practical skills.",
      "Add a 'Practical Projects / Assignments' section (e.g., 50-lead CRM pipeline, 10-ticket support log, or Excel SLA tracker) so recruiters see proof of work.",
      "Mention languages clearly (Hindi, English, regional language)—bilingual fluency is a real advantage in Indian customer and sales roles.",
    ],
    interviewGuidance: [
      "Prepare a crisp 60-second 'Tell me about yourself' covering: your BA degree, what practical skills you built after graduation, and why this specific role fits you.",
      "Never apologise for having a BA degree—frame it as a foundation in communication, perspective, and learning discipline backed by practical assignments.",
      "Expect scenario questions (e.g., 'How will you handle an angry customer?' or 'How would you explain a product to a hesitant buyer?')—answer in clear steps.",
    ],
    regionalInsight:
      "Graduates from Uttar Pradesh (Lucknow, Kanpur, Prayagraj, Varanasi, Gorakhpur, Meerut) and Bihar (Patna, Gaya, Muzaffarpur, Bhagalpur) frequently compete for remote/hybrid Inside Sales, Customer Support, Operations, and HR roles headquartered in NCR, Bengaluru, Pune, and Hyderabad—as well as growing regional hubs. Reliable internet, a quiet call environment, and structured mock-interview practice dramatically narrow the metro vs non-metro hiring gap.",
    matchedUdayantuTracks: [
      "business-development",
      "customer-support",
      "customer-success",
      "human-resources",
      "marketing-management",
      "operations-management",
    ],
    primaryCtaLabel: "Discover My Best Career After BA",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "BA ke baad bina experience ke private job kaise milegi?",
        answer:
          "Bina experience ke job paane ke liye teen steps sabse zaroori hain: (1) ek clear entry role chunein jaise Business Development, Customer Support, HR Recruiter ya Operations, (2) 2–3 practical assignments bana kar apna proof-of-work portfolio taiyaar karein, aur (3) mock interviews + clean 1-page resume ke saath apply karein.",
      },
      {
        question: "BA ke baad kaun-si private job sabse jaldi mil sakti hai?",
        answer:
          "Customer Support (chat/email/voice), Business Development Executive (BDE), HR Recruitment Coordinator, aur Operations Executive mein fresher hiring saal bhar chalti hai. Aapke communication aur analytical comfort ke hisaab se best fit chunein.",
      },
      {
        question: "Kya BA ke baad acchi English nahi aati toh job nahi milegi?",
        answer:
          "Zaroori nahi hai ki aapki English native-level ho. Most Indian corporate fresher roles mein clear functional communication—sahi baat samajhna aur simple sentences mein bolna/likhna—kaafi hota hai, aur structured daily practice se 8–12 hafton mein bada improvement aata hai.",
      },
      {
        question: "Does UdaYantu guarantee a job to every BA student?",
        answer:
          "No ethical platform can promise a job unconditionally without effort. UdaYantu provides 15-week practical training, mentorship, and placement assistance backed by a written Refund Policy with clear eligibility requirements (including 90% attendance, coursework completion, and active interview participation).",
      },
    ],
    relatedBlogSlugs: [
      "tier-3-4-graduates-business-development-roles",
      "customer-success-101-empathy-and-clarity",
      "first-interview-to-offer-letter-mentorship",
    ],
  },

  // =========================================================================
  // 2. B.COM AFTER GRADUATION
  // =========================================================================
  {
    slug: "bcom",
    path: "/jobs-after-bcom",
    degreeLabel: "B.Com",
    degreeFullName: "Bachelor of Commerce (B.Com)",
    level: "Undergraduate",
    seoTitle: "B.Com Ke Baad Job Kaise Milegi? Private Jobs & Career Options | UdaYantu",
    metaDescription:
      "B.Com ke baad kaun-si private jobs mil sakti hain? Compare directly accessible corporate roles vs accounting/finance certification paths, Excel/MIS skills, and fresher preparation steps.",
    h1: "B.Com ke baad kaun-si private jobs mil sakti hain?",
    hindiSubtitle: "बी.कॉम के बाद प्राइवेट जॉब्स और करियर विकल्प — फ्रेशर्स गाइड",
    primaryKeyword: "BCom ke baad job kaise milegi",
    secondaryKeywords: [
      "B.Com walo ke liye private naukri",
      "BCom ke baad private job",
      "BCom fresher jobs in India",
      "BCom ke baad career options",
      "BCom without experience jobs",
    ],
    directAnswer:
      "B.Com graduates ke paas do clear pathways hote hain: (1) Direct Corporate Entry Roles jaise Business Operations, MIS & Reporting Support, Business Development, Customer Relationship / Customer Success, HR & Recruitment, aur Project Coordination—jahan commercial sense + Excel + communication se direct entry milti hai; aur (2) Specialist Accounts/Taxation/Banking Roles jaise Accounts Executive ya Banking Operations—jahan Tally, GST filing, ya banking exams/certifications ki alag taiyaari lagti hai.",
    hinglishContext:
      "Har B.Com student ke liye CA ya sirf accounting hi ek rasta nahi hai. Agar aapko business processes, client communication, data tracking, ya team coordination pasand hai, toh corporate operations, CRM, BD, aur HR mein strong entry-level career options available hain.",
    quickOverviewPoints: [
      "Clear separation between directly accessible corporate roles and certification-heavy finance/accounting roles",
      "Excel, data reporting, and commercial understanding give B.Com freshers a natural edge in Operations & MIS",
      "Client-facing commerce graduates thrive in B2B Business Development, CRM, and Customer Success",
      "Transparent note: UdaYantu trains for corporate career tracks—not Tally, GST filing, CA, or banking exam coaching",
    ],
    honestBoundaryNotice:
      "Important curriculum transparency: UdaYantu does NOT teach Tally Prime, GST return filing, statutory accounting, CA/CMA/CS, or bank PO exam coaching. Those require dedicated accounting or banking training. Where B.Com graduates want corporate Business Development, Customer Success, Operations, HR, or Project Coordination careers, UdaYantu's 15-week tracks directly apply.",
    roles: [
      {
        title: "Accounts & Finance Operations Support",
        whatItInvolves:
          "Invoice verification, accounts payable/receivable reconciliation, expense trackers, vendor ledger checks, and monthly closing support.",
        whyDegreeFits:
          "Directly leverages B.Com fundamentals in double-entry accounting, journal entries, and financial statements.",
        requiredSkills: ["Accounting Fundamentals", "Excel Reconciliation", "Attention to Detail", "GST / TDS Basics"],
        typicalTools: ["Tally Prime", "Microsoft Excel", "Zoho Books / ERP basics"],
        communicationLevel: "Clear written email communication for vendor/internal queries",
        howToPrepare: "Brush up on journal entries, bank reconciliation, GST basics, and practical Tally/Excel ledger exercises.",
        portfolioExample: "A sample monthly invoice reconciliation sheet and GST summary tracker in Excel.",
        additionalQualification: "Practical Tally Prime + GST filing training is usually expected by employers (offered by specialised accounting institutes, not UdaYantu).",
        whereToFindVacancies: "CA firms, SMEs, corporate finance teams via Naukri, NCS, LinkedIn.",
      },
      {
        title: "Banking & Financial Services (Operations / Relationship)",
        whatItInvolves:
          "Branch operations support, KYC/documentation verification, retail banking product explanation, and customer relationship management.",
        whyDegreeFits:
          "B.Com graduates understand interest, credit, insurance, and financial terminology faster than non-commerce peers.",
        requiredSkills: ["Financial Product Basics", "KYC Accuracy", "Client Service", "Ethical Sales Communication"],
        typicalTools: ["Core Banking / CRM Software", "Excel", "Compliance Checklists"],
        communicationLevel: "Polite bilingual Hindi + English customer communication",
        howToPrepare: "Learn basic banking products (CASA, loans, mutual funds, insurance) and prepare for aptitude + personal interviews.",
        portfolioExample: "A clear comparison sheet of basic retail financial products explaining eligibility and customer needs.",
        additionalQualification: "NISM/IRDAI certifications or bank recruitment exams are required for regulated advisory/PSU bank roles (external to UdaYantu).",
        whereToFindVacancies: "Private bank career portals, NBFCs, fintech companies, NCS.",
        matchedUdayantuTrack: "business-development",
      },
      {
        title: "Business Operations Executive",
        whatItInvolves:
          "Managing daily service/order workflows, vendor coordination, billing hygiene, and operational SLA reporting.",
        whyDegreeFits:
          "B.Com graduates combine commercial awareness with structured record-keeping—ideal for fast-moving business operations.",
        requiredSkills: ["Excel Formulas & Pivot Tables", "SOP Execution", "Vendor Coordination", "Root-Cause Analysis"],
        typicalTools: ["Microsoft Excel", "Google Sheets", "Operations CRMs"],
        communicationLevel: "Concise written reports and calm cross-team follow-ups",
        howToPrepare: "Master Excel lookups, pivot tables, and practice writing clear 1-page SOPs.",
        portfolioExample: "A weekly vendor & dispatch SLA dashboard built in Excel/Google Sheets.",
        additionalQualification: "None required beyond strong spreadsheet proficiency.",
        whereToFindVacancies: "E-commerce, logistics, BFSI, SaaS operations teams on LinkedIn & Naukri.",
        matchedUdayantuTrack: "operations-management",
      },
      {
        title: "MIS & Data Reporting Executive",
        whatItInvolves:
          "Compiling daily/weekly management reports, cleaning operational or sales spreadsheets, tracking KPIs, and highlighting anomalies.",
        whyDegreeFits:
          "Commerce students already work with tabular statements, percentages, margins, and reconciliations.",
        requiredSkills: ["Advanced Excel (VLOOKUP/XLOOKUP, Pivot Tables)", "Data Cleaning", "KPI Summaries", "Accuracy"],
        typicalTools: ["Microsoft Excel", "Google Sheets", "Basic Dashboarding"],
        communicationLevel: "Clear written summaries interpreting numbers for managers",
        howToPrepare: "Practice cleaning messy CSV datasets and creating automated weekly summary dashboards.",
        portfolioExample: "An automated monthly sales & collections MIS dashboard with variance highlights.",
        additionalQualification: "Advanced Excel practice is mandatory; Power BI/SQL can be added later for analytics progression.",
        whereToFindVacancies: "Retail chains, BPO/KPO, fintech, logistics, staffing firms on Naukri & LinkedIn.",
        matchedUdayantuTrack: "operations-management",
      },
      {
        title: "Business Development Executive (B2B / Fintech / SaaS)",
        whatItInvolves:
          "Identifying target businesses, explaining ROI/pricing value clearly, handling commercial objections, and managing sales pipelines.",
        whyDegreeFits:
          "B.Com graduates comfortably discuss budgets, pricing, margins, and ROI with small-business and corporate buyers.",
        requiredSkills: ["Consultative Selling", "Pricing & Value Framing", "Lead Qualification", "CRM Hygiene"],
        typicalTools: ["CRM Systems", "Google Sheets", "LinkedIn"],
        communicationLevel: "Confident spoken Hindi + workplace English",
        howToPrepare: "Practice discovery conversations, objection handling, and structured follow-up emails.",
        portfolioExample: "A 40-business B2B outreach pipeline with value-led pitch scripts.",
        additionalQualification: "None required for fresher roles.",
        whereToFindVacancies: "Fintech, SaaS, B2B marketplaces, EdTech, and corporate sales teams.",
        matchedUdayantuTrack: "business-development",
      },
      {
        title: "Customer Relationship & Customer Success Associate",
        whatItInvolves:
          "Managing post-sale client onboarding, answering billing/usage questions, tracking renewals, and resolving account concerns.",
        whyDegreeFits:
          "Combines B.Com commercial clarity with structured client follow-through.",
        requiredSkills: ["Client Onboarding", "Account Tracking", "Empathy", "Escalation Coordination"],
        typicalTools: ["CRM & Ticketing Platforms", "Spreadsheets"],
        communicationLevel: "Clear spoken & written English and Hindi",
        howToPrepare: "Practice structured onboarding walkthroughs and churn-prevention follow-ups.",
        portfolioExample: "A 30-day client onboarding plan and account renewal tracker.",
        additionalQualification: "None required.",
        whereToFindVacancies: "SaaS, fintech, insurance-tech, and subscription businesses.",
        matchedUdayantuTrack: "customer-success",
      },
      {
        title: "HR & Recruitment Coordinator",
        whatItInvolves:
          "Sourcing candidates, coordinating interviews, verifying onboarding documents, and assisting with attendance/HR trackers.",
        whyDegreeFits:
          "B.Com graduates handle structured documentation, compliance checklists, and recruitment funnels smoothly.",
        requiredSkills: ["Resume Screening", "Candidate Calling", "Onboarding Documentation", "Tracker Discipline"],
        typicalTools: ["Job Portals", "Excel/Sheets", "Calendar Tools"],
        communicationLevel: "Polite, clear phone & email communication",
        howToPrepare: "Learn JD breakdown, candidate screening calls, and onboarding checklists.",
        portfolioExample: "A structured recruitment pipeline sheet + new-hire document checklist.",
        additionalQualification: "Dedicated payroll/statutory HR roles may require extra HR compliance training.",
        whereToFindVacancies: "Corporate HR teams, recruitment agencies, startups.",
        matchedUdayantuTrack: "human-resources",
      },
      {
        title: "Project Coordination Associate",
        whatItInvolves:
          "Tracking deliverables, vendor invoices/budgets, project timelines, and weekly stakeholder updates.",
        whyDegreeFits:
          "B.Com graduates bring budget awareness and structured milestone reporting.",
        requiredSkills: ["Milestone Scheduling", "Action-Item Tracking", "Budget Hygiene", "Stakeholder Updates"],
        typicalTools: ["Kanban Boards", "Excel / Sheets", "Status Templates"],
        communicationLevel: "Crisp written status summaries",
        howToPrepare: "Build sample project schedules and practice Agile/Kanban coordination basics.",
        portfolioExample: "A 6-week rollout schedule with milestone owners and risk log.",
        additionalQualification: "None required for fresher coordinator roles.",
        whereToFindVacancies: "Consulting support, IT services, fintech, operations teams.",
        matchedUdayantuTrack: "project-management",
      },
    ],
    specializations: [
      {
        name: "B.Com (General / Pass)",
        hinglishHook: "B.Com General ke baad private job",
        suitableRoles: ["Business Operations Executive", "Business Development Executive", "Customer Success Associate", "HR Coordinator"],
        keyEdge: "Broad foundation across commerce, business law, and economics adaptable to corporate teams.",
        honestCaveat: "Because B.Com General is very common, standing out requires practical Excel + communication portfolio proof.",
      },
      {
        name: "B.Com (Honours — Accounting & Finance)",
        hinglishHook: "B.Com Honours Finance ke baad career",
        suitableRoles: ["MIS & Reporting Executive", "Finance Operations Support", "Banking Operations", "Business Operations"],
        keyEdge: "Stronger grasp of financial statements, ratios, and structured numerical verification.",
        honestCaveat: "Specialist accounting/audit jobs still expect Tally/GST or CA/CMA/MBA credentials alongside the degree.",
      },
      {
        name: "B.Com (Computer Applications / E-Commerce)",
        hinglishHook: "B.Com Computer Applications ke baad jobs",
        suitableRoles: ["MIS & Data Reporting Executive", "Operations Coordinator", "Customer Support / Product Support", "Digital Marketing Associate"],
        keyEdge: "Familiarity with spreadsheets, basic databases, and digital workflows.",
        honestCaveat: "Not equivalent to a B.Tech/CS degree—target MIS, operations, e-commerce coordination, and business support roles.",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Decide Your Track (Accounts vs Corporate Business)",
        focus: "Avoid mixing contradictory preparation tracks",
        actions: [
          "Decide honestly: do you want core accounting (Tally/GST/CA path) OR corporate business roles (Operations, BD, Customer Success, HR, MIS)?",
          "If choosing corporate tracks, master Excel fundamentals (VLOOKUP/XLOOKUP, Pivot Tables, IF/SUMIFS)",
          "Practice 20 minutes daily of clear spoken and written workplace communication",
        ],
      },
      {
        phase: "Days 31–60: Build Commercial Proof of Work",
        focus: "Show employers you can execute on Day 1",
        actions: [
          "Build 2–3 track-specific deliverables (MIS dashboard, CRM outreach tracker, or onboarding SOP)",
          "Update your resume to showcase tools, numbers, and completed assignments",
          "Get external mentor feedback on both technical sheets and spoken explanation",
        ],
      },
      {
        phase: "Days 61–90: Practical Tests & Interview Conversion",
        focus: "Clear Excel assessments, case rounds, and HR interviews",
        actions: [
          "Practice timed 30-minute Excel cleaning and summary tests",
          "Run mock interviews focusing on business clarity and real examples",
          "Apply consistently through verified portals (NCS, LinkedIn, Naukri, placement network)",
        ],
      },
    ],
    resumeGuidance: [
      "Highlight Excel proficiency specifically (e.g., 'Pivot Tables, VLOOKUP, Conditional Formatting, MIS Reporting') rather than writing vague 'MS Office'.",
      "Separate academic commerce coursework from practical projects so recruiters spot job readiness immediately.",
      "Do not list Tally or GST unless you can actually pass a practical test on them.",
    ],
    interviewGuidance: [
      "Be ready to explain basic business concepts cleanly (revenue vs profit, margin, SLA, customer retention) in plain language.",
      "For Operations/MIS roles, expect a short practical Excel test—practice explaining how you verify data accuracy.",
      "For BD/CRM roles, practice explaining a product's benefit calmly without sounding pushy.",
    ],
    regionalInsight:
      "B.Com is one of the highest-enrolment degrees across UP, Bihar, Madhya Pradesh, and Rajasthan. Moving beyond crowded local bookkeeping vacancies into pan-India remote/hybrid Business Operations, MIS, Fintech BD, and Customer Success roles opens dramatically wider employer demand.",
    matchedUdayantuTracks: [
      "operations-management",
      "business-development",
      "customer-success",
      "human-resources",
      "project-management",
    ],
    primaryCtaLabel: "Discover My Best Career After B.Com",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "B.Com ke baad bina Tally ya CA ke private job mil sakti hai?",
        answer:
          "Haan. Agar aap core accounting ki jagah Business Operations, MIS Reporting, Business Development, Customer Success, HR Recruitment ya Project Coordination choose karte hain, toh Tally ya CA zaroori nahi hota—Excel, communication aur workflow discipline matter karta hai.",
      },
      {
        question: "Kya UdaYantu Tally, GST ya banking exam preparation karwata hai?",
        answer:
          "Nahi. UdaYantu Tally, GST filing, statutory accounting ya bank PO coaching nahi deta. UdaYantu corporate career tracks (Business Development, Customer Success, Operations, HR, Marketing, Project Coordination, Customer Support) ke liye practical training deta hai.",
      },
      {
        question: "B.Com freshers ke liye sabse useful practical skill kaun-si hai?",
        answer:
          "Microsoft Excel / Google Sheets (Pivot Tables, Lookups, clean MIS trackers) aur clear business email/phone communication har B.Com corporate role mein sabse zyada kaam aati hai.",
      },
    ],
    relatedBlogSlugs: [
      "tier-3-4-graduates-business-development-roles",
      "first-interview-to-offer-letter-mentorship",
    ],
  },

  // =========================================================================
  // 3. B.SC AFTER GRADUATION
  // =========================================================================
  {
    slug: "bsc",
    path: "/jobs-after-bsc",
    degreeLabel: "B.Sc",
    degreeFullName: "Bachelor of Science (B.Sc)",
    level: "Undergraduate",
    seoTitle: "B.Sc Ke Baad Job Options | Private Jobs & Career Guide | UdaYantu",
    metaDescription:
      "B.Sc ke baad career kaise banayein? Explore realistic private jobs after B.Sc Maths, Statistics, Physics, Chemistry, Biology & CS, additional qualifications, and corporate pathways.",
    h1: "B.Sc ke baad career kaise banayein? Explore practical job opportunities.",
    hindiSubtitle: "बी.एससी के बाद प्राइवेट जॉब्स और प्रैक्टिकल करियर रास्ते",
    primaryKeyword: "BSc ke baad job options",
    secondaryKeywords: [
      "BSc ke baad private job",
      "BSc graduates jobs for freshers",
      "BSc Maths ke baad job",
      "BSc Chemistry ke baad job",
      "BSc ke baad kya kare",
    ],
    directAnswer:
      "B.Sc graduates ke paas do mukhya raste hote hain: (1) Science/Regulated Specialist Pathways (lab QA/QC, pharma, clinical research, teaching, ya software development)—jinke liye aksar M.Sc, B.Ed, D.Pharm/regulated training, ya coding skills chahiye hoti hain; aur (2) Practical Corporate Pathways (Operations & MIS, Customer/Technical Support, Business Development, Product Operations, Project Coordination)—jahan B.Sc students apni strong analytical aur problem-solving habit se turant entry le sakte hain.",
    hinglishContext:
      "Bahut se B.Sc students graduation ke baad confused rehte hain kyunki pure science lab jobs har shehar mein easily nahi milti. Apne analytical dimaag aur structured thinking ko corporate Operations, Support, Analytics-adjacent MIS, aur Business roles mein use karna ek smart aur realistic option hai.",
    quickOverviewPoints: [
      "Clear breakdown across B.Sc Maths, Statistics, Physics, Chemistry, Biology, and Computer Science",
      "Honest separation between regulated lab/healthcare roles (requiring extra credentials) and open corporate pathways",
      "B.Sc graduates bring strong logical reasoning, structured observation, and comfort with metrics",
      "Practical Excel, documentation, and communication skills unlock pan-India fresher hiring",
    ],
    honestBoundaryNotice:
      "Important qualification notice: Regulated clinical lab technician, hospital diagnostics, pharmacy dispensing, and specialist R&D roles require statutory qualifications (e.g., DMLT/BMLT, M.Sc, B.Pharm, or accredited lab training). UdaYantu does NOT provide laboratory, medical, or coding/software-engineering courses—only corporate career tracks where your analytical foundation applies directly.",
    roles: [
      {
        title: "Operations & MIS Analyst (Entry-Level)",
        whatItInvolves:
          "Tracking daily workflows, cleaning operational datasets in spreadsheets, spotting process delays, and preparing structured status reports.",
        whyDegreeFits:
          "B.Sc Maths, Statistics, Physics, and Chemistry graduates already think in terms of variables, accuracy, and root-cause verification.",
        requiredSkills: ["Excel / Google Sheets", "Root-Cause Analysis", "SOP Documentation", "SLA Tracking"],
        typicalTools: ["Microsoft Excel", "Google Sheets", "Operations Dashboards"],
        communicationLevel: "Clear written reporting and structured team coordination",
        howToPrepare: "Learn Pivot Tables, lookup formulas, data cleaning, and 5-Whys process analysis.",
        portfolioExample: "An operational SLA tracker + error root-cause report built from sample dispatch data.",
        additionalQualification: "None required for fresher operations roles.",
        whereToFindVacancies: "Logistics, e-commerce, EdTech, healthcare operations, BFSI on Naukri, NCS, LinkedIn.",
        matchedUdayantuTrack: "operations-management",
      },
      {
        title: "Customer Support & Technical Helpdesk Associate",
        whatItInvolves:
          "Troubleshooting customer account or product issues methodically, documenting steps clearly, and escalating technical bugs cleanly.",
        whyDegreeFits:
          "Scientific troubleshooting habits—observing symptoms, testing steps, documenting results—translate directly to high-quality product/customer support.",
        requiredSkills: ["Structured Troubleshooting", "Clear Email/Chat Writing", "Ticketing Hygiene", "Patience"],
        typicalTools: ["Helpdesk Ticketing Systems", "Knowledge Bases", "Diagnostic Checklists"],
        communicationLevel: "Calm spoken + written English/Hindi clarity",
        howToPrepare: "Practice writing crisp troubleshooting replies and logging clear bug reproduction steps.",
        portfolioExample: "A 10-case troubleshooting log + mini help-center article for a digital app.",
        additionalQualification: "None required; B.Sc CS/Physics graduates have added comfort in L1 tech support.",
        whereToFindVacancies: "SaaS companies, IT service desks, telecom, EdTech, fintech.",
        matchedUdayantuTrack: "customer-support",
      },
      {
        title: "Business Development Executive (EdTech / Healthcare / B2B)",
        whatItInvolves:
          "Connecting with prospective buyers, understanding their requirements, explaining technical or educational offerings simply, and managing follow-ups.",
        whyDegreeFits:
          "B.Sc Biology/Chemistry graduates are often preferred by healthcare/pharma/EdTech teams for explaining structured products clearly.",
        requiredSkills: ["Consultative Communication", "Product Explanation", "Lead Research", "CRM Tracking"],
        typicalTools: ["CRM", "Google Sheets", "LinkedIn"],
        communicationLevel: "Confident Hindi + functional workplace English",
        howToPrepare: "Practice simplifying complex concepts into clear 2-minute benefit explanations.",
        portfolioExample: "A 40-lead prospect sheet + consultative discovery script.",
        additionalQualification: "None required for fresher BDE roles.",
        whereToFindVacancies: "EdTech, healthtech, SaaS, B2B services on LinkedIn, Naukri, NCS.",
        matchedUdayantuTrack: "business-development",
      },
      {
        title: "Product Support / Product Operations Associate",
        whatItInvolves:
          "Testing new features, documenting user bugs, tracking onboarding funnels, and coordinating feedback between users and product teams.",
        whyDegreeFits:
          "B.Sc Maths, Statistics, Physics, and CS graduates enjoy structured logic, funnel numbers, and methodical testing.",
        requiredSkills: ["Funnel Metrics", "Bug Documentation", "User Research Basics", "Structured Testing"],
        typicalTools: ["Sheets Analytics", "Ticketing Tools", "User Flow Diagrams"],
        communicationLevel: "Clear, objective written documentation",
        howToPrepare: "Learn basic funnel metrics (signup → activation → retention) and practice writing clear bug/UX reports.",
        portfolioExample: "A mobile app UX audit + structured UAT testing checklist.",
        additionalQualification: "No coding required for Product Operations/Support; Software Developer roles require separate coding study.",
        whereToFindVacancies: "Startups, SaaS, consumer internet companies on LinkedIn & Internshala.",
        matchedUdayantuTrack: "product-management",
      },
      {
        title: "Project Coordination Associate",
        whatItInvolves:
          "Maintaining timelines, coordinating deliverables across teams, tracking risks, and preparing weekly status updates.",
        whyDegreeFits:
          "Methodical planning and disciplined record-keeping from science labs transfer well to project coordination.",
        requiredSkills: ["Scheduling", "Agile/Kanban Basics", "Risk Logging", "Meeting Notes"],
        typicalTools: ["Kanban Boards", "Google Sheets", "Docs"],
        communicationLevel: "Concise written & spoken updates",
        howToPrepare: "Practice breaking down a multi-step rollout into milestones and weekly status briefs.",
        portfolioExample: "A 6-week mock implementation timeline with dependency tracking.",
        additionalQualification: "None required for fresher coordinator roles.",
        whereToFindVacancies: "IT services, EdTech, agencies, enterprise delivery teams.",
        matchedUdayantuTrack: "project-management",
      },
      {
        title: "Quality Control / Lab / Pharma Trainee (Regulated Pathway)",
        whatItInvolves:
          "Testing raw materials or finished batches in pharma, food, or chemical labs following GMP/GLP documentation standards.",
        whyDegreeFits:
          "Directly uses B.Sc Chemistry, Microbiology, or Life Sciences laboratory coursework.",
        requiredSkills: ["Titration/Analytical Chemistry Basics", "GMP/GLP Documentation", "Lab Safety"],
        typicalTools: ["Laboratory Instruments (HPLC/UV-Vis exposure where trained)", "Batch Logs"],
        communicationLevel: "Accurate technical log documentation",
        howToPrepare: "Revise analytical chemistry fundamentals, GMP standards, and apply to pharma manufacturing hubs.",
        portfolioExample: "Academic lab project report with error analysis and safety compliance notes.",
        additionalQualification: "Often requires M.Sc Chemistry/Microbiology, specialised QA/QC training, or accredited lab credentials depending on the employer (not taught by UdaYantu).",
        whereToFindVacancies: "Pharma & chemical company career portals (Baddi, Hyderabad, Ahmedabad, Pune hubs), NCS.",
      },
    ],
    specializations: [
      {
        name: "B.Sc Mathematics & Statistics",
        hinglishHook: "B.Sc Maths / Statistics ke baad job",
        suitableRoles: ["Operations & MIS Analyst", "Product Operations Associate", "Project Coordinator", "Business Operations"],
        keyEdge: "Strong quantitative reasoning, probability/percentage fluency, and comfort with spreadsheets.",
        honestCaveat: "Data Scientist roles require Python/SQL/ML training—entry-level MIS, Operations, and Product Operations are much faster initial entry doors.",
      },
      {
        name: "B.Sc Physics",
        hinglishHook: "B.Sc Physics ke baad job",
        suitableRoles: ["Technical Support Associate", "Operations Executive", "Project Coordinator", "Product Support"],
        keyEdge: "Logical troubleshooting, systems thinking, and analytical problem solving.",
        honestCaveat: "Core research or teaching roles require M.Sc/NET/B.Ed; corporate technical support and operations welcome B.Sc Physics freshers directly.",
      },
      {
        name: "B.Sc Chemistry",
        hinglishHook: "B.Sc Chemistry ke baad job",
        suitableRoles: ["Pharma/Chemical QA Trainee (subject to lab requirements)", "Operations Executive", "B2B Business Development (Pharma/Industrial)", "Customer Support"],
        keyEdge: "Process discipline, documentation precision, and comfort with technical product specs.",
        honestCaveat: "Senior lab analyst roles generally prefer M.Sc Chemistry; pairing B.Sc Chemistry with corporate operations or B2B communication broadens immediate hiring options.",
      },
      {
        name: "B.Sc Biology / Botany / Zoology",
        hinglishHook: "B.Sc Biology ke baad job",
        suitableRoles: ["Healthcare Operations Support", "EdTech / Healthtech Business Development", "Customer Success Associate", "Customer Support"],
        keyEdge: "Ability to learn detailed domain knowledge and explain concepts empathetically.",
        honestCaveat: "Clinical lab/medical roles require regulated credentials (DMLT/BMLT/Nursing/M.Sc); non-clinical healthtech operations and customer roles are open to B.Sc Bio freshers.",
      },
      {
        name: "B.Sc Computer Science / IT",
        hinglishHook: "B.Sc Computer Science ke baad job",
        suitableRoles: ["L1 Technical & Application Support", "Product Support Analyst", "Operations / MIS Executive", "Project Coordinator"],
        keyEdge: "Familiarity with software interfaces, operating systems, and basic IT concepts.",
        honestCaveat: "Software Engineering roles require strong DSA/coding projects (not taught by UdaYantu); Technical Support and Product Operations leverage your CS background without coding interviews.",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Choose Between Higher Studies vs Corporate Entry",
        focus: "Stop drifting between M.Sc prep and random job applications",
        actions: [
          "Evaluate honestly if you need a job within 4–6 months or plan to pursue M.Sc/B.Ed",
          "Pick a corporate track matching your strength (Operations/MIS for analytical learners; Support/BD/Customer Success for communicators)",
          "Build daily Excel + workplace English clarity routines",
        ],
      },
      {
        phase: "Days 31–60: Practical Workflows & Assignments",
        focus: "Translate science logic into business deliverables",
        actions: [
          "Complete 3 practical assignments (e.g., SLA dashboard, troubleshooting guide, or onboarding SOP)",
          "Practice explaining technical or process steps in simple, non-academic language",
          "Build a clean 1-page corporate resume highlighting tools and projects",
        ],
      },
      {
        phase: "Days 61–90: Mock Interviews & Application Discipline",
        focus: "Prepare for aptitude, Excel, and scenario interview rounds",
        actions: [
          "Complete mock interviews to replace textbook answers with concise workplace examples",
          "Apply consistently on NCS, LinkedIn, Naukri, and employer drives",
          "Track responses weekly and strengthen any recurring weak topic",
        ],
      },
    ],
    resumeGuidance: [
      "Translate academic lab discipline into corporate strengths (accuracy, documentation, troubleshooting, numerical verification).",
      "Feature practical spreadsheet, support, or operations assignments prominently above college extracurriculars.",
      "Clarify your target role at the top of the resume so HR does not assume you only want lab/teaching jobs.",
    ],
    interviewGuidance: [
      "Expect the question: 'Why are you moving from B.Sc into a corporate/operations/support role?' Answer positively: explain how your analytical training prepares you to solve practical business problems.",
      "Demonstrate structured thinking—break scenario answers into Step 1, Step 2, Step 3.",
    ],
    regionalInsight:
      "Thousands of B.Sc graduates from state universities in UP, Bihar, Jharkhand, and MP wait years for limited local lab or teaching vacancies. Remote/hybrid Operations, L1 Technical Support, and EdTech/Healthtech corporate roles offer structured year-round hiring for disciplined science graduates.",
    matchedUdayantuTracks: [
      "operations-management",
      "customer-support",
      "business-development",
      "product-management",
      "project-management",
    ],
    primaryCtaLabel: "Find My Career After B.Sc",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "B.Sc ke baad bina M.Sc kiye private job kaise milegi?",
        answer:
          "B.Sc ke turant baad Operations & MIS, Customer/Technical Support, Product Operations, Project Coordination aur B2B Business Development jaise corporate roles bina M.Sc ke available hote hain—bas Excel, communication aur practical assignments ready hone chahiye.",
      },
      {
        question: "Kya B.Sc Biology ke baad lab ya hospital job bina extra diploma ke mil sakti hai?",
        answer:
          "Zyadatar regulated clinical lab aur hospital diagnostic roles mein DMLT/BMLT ya specific accreditation maanga jaata hai. Non-clinical healthcare operations, customer success aur healthtech support roles B.Sc graduates ke liye directly open rehte hain.",
      },
    ],
    relatedBlogSlugs: [
      "customer-success-101-empathy-and-clarity",
      "first-interview-to-offer-letter-mentorship",
    ],
  },

  // =========================================================================
  // 4. BBA AFTER GRADUATION
  // =========================================================================
  {
    slug: "bba",
    path: "/jobs-after-bba",
    degreeLabel: "BBA",
    degreeFullName: "Bachelor of Business Administration (BBA)",
    level: "Undergraduate",
    seoTitle: "BBA Ke Baad Job Kaise Milegi? Career Options for Freshers | UdaYantu",
    metaDescription:
      "BBA ke baad best career options aur private jobs. Explore Business Development, Sales Management, Marketing, HR, Operations, Customer Success, and Project Coordination roles for freshers.",
    h1: "BBA ke baad best career options aur private jobs.",
    hindiSubtitle: "बीबीए के बाद फ्रेशर्स के लिए बेस्ट प्राइवेट जॉब्स और स्किल्स",
    primaryKeyword: "BBA ke baad job kaise milegi",
    secondaryKeywords: [
      "BBA graduates jobs for freshers",
      "BBA ke baad private job",
      "BBA career options without MBA",
      "BBA fresher roles in India",
    ],
    directAnswer:
      "BBA graduates ko private job ke liye turant MBA karna zaroori nahi hai. BBA ke baad aap directly Business Development, Inside Sales, Marketing Executive, HR Recruiter, Operations Executive, Customer Success Associate, Project Coordinator, aur Business Support roles mein fresher career start kar sakte hain—aur 1–2 saal ke real corporate experience ke baad decide kar sakte hain ki MBA chahiye ya nahi.",
    hinglishContext:
      "BBA mein aapne management, marketing, HR, aur operations ki theory padhi hai, lekin interviews mein companies theory nahi—practical execution (CRM, Excel MIS, campaign reports, screening calls, SOPs) check karti hain. Isi theory-to-execution gap ko fill karne se BBA freshers jaldi shortlist hote hain.",
    quickOverviewPoints: [
      "You do not need an immediate MBA to start a strong corporate career after BBA",
      "Direct alignment across all 8 business-facing fresher tracks: BD, Marketing, HR, Operations, Customer Success & Coordination",
      "Hiring managers test practical execution (Excel, CRM, outreach, screening, campaign reporting) over textbook definitions",
      "1–2 years of real execution experience also makes future MBA or management growth far stronger",
    ],
    honestBoundaryNotice:
      "BBA prepares you for junior executive, associate, and coordinator positions—not senior Manager titles on Day 1. Growth into team leadership comes from consistent execution, communication, and measurable ownership.",
    roles: [
      {
        title: "Business Development & Sales Associate",
        whatItInvolves:
          "Managing outbound/inbound prospect discovery, qualifying leads, presenting solutions, and closing entry-level commercial deals.",
        whyDegreeFits:
          "BBA students already understand customer segmentation, sales funnels, and business revenue models.",
        requiredSkills: ["Consultative Selling", "Pipeline Discipline", "Negotiation Basics", "CRM Hygiene"],
        typicalTools: ["HubSpot / Zoho CRM", "LinkedIn", "Google Sheets"],
        communicationLevel: "Confident bilingual Hindi + English business communication",
        howToPrepare: "Move from sales theory to real mock discovery calls and structured outreach tracking.",
        portfolioExample: "A 50-prospect B2B pipeline with qualification notes and email cadence.",
        additionalQualification: "None required.",
        whereToFindVacancies: "SaaS, fintech, B2B marketplaces, EdTech, FMCG/consumer brands.",
        matchedUdayantuTrack: "business-development",
      },
      {
        title: "Marketing Executive (Digital & Growth)",
        whatItInvolves:
          "Executing content calendars, SEO research, social campaigns, lead-gen landing pages, and weekly analytics summaries.",
        whyDegreeFits:
          "Directly applies BBA Marketing principles (4Ps, positioning, consumer behaviour) to modern digital channels.",
        requiredSkills: ["Audience Positioning", "SEO & Content Basics", "Social Campaigns", "GA4 Reporting"],
        typicalTools: ["Google Analytics 4", "Search Console", "Canva", "Sheets"],
        communicationLevel: "Clear, persuasive written & spoken English/Hindi",
        howToPrepare: "Execute real sample campaigns, SEO briefs, and campaign metric breakdowns.",
        portfolioExample: "A 30-day multi-channel campaign calendar + sample ROI tracking sheet.",
        additionalQualification: "None required; portfolio beats certificates.",
        whereToFindVacancies: "D2C brands, agencies, startups, corporate marketing teams.",
        matchedUdayantuTrack: "marketing-management",
      },
      {
        title: "Human Resources (HR) Recruiter & Coordinator",
        whatItInvolves:
          "Sourcing resumes, conducting screening calls, managing interview schedules, and supporting employee onboarding.",
        whyDegreeFits:
          "BBA HR elective students already know organisational behaviour and recruitment basics.",
        requiredSkills: ["JD Analysis", "Screening Calls", "ATS Tracking", "Onboarding Workflows"],
        typicalTools: ["LinkedIn / Naukri Sourcing", "Sheets/ATS", "Calendars"],
        communicationLevel: "Warm, structured professional communication",
        howToPrepare: "Practice real candidate screening scripts and recruitment funnel trackers.",
        portfolioExample: "3 JD screening scorecards + a simulated campus hiring tracker.",
        additionalQualification: "No MBA required for Junior HR Recruiter/Coordinator roles.",
        whereToFindVacancies: "Startups, IT/BPO staffing firms, corporate HR departments.",
        matchedUdayantuTrack: "human-resources",
      },
      {
        title: "Operations Executive",
        whatItInvolves:
          "Monitoring daily service/supply workflows, solving bottlenecks, coordinating vendors, and tracking SLAs in Excel.",
        whyDegreeFits:
          "BBA Operations and Supply Chain concepts map cleanly to daily process execution.",
        requiredSkills: ["Excel Pivot Tables & Lookups", "SOP Design", "SLA Monitoring", "Vendor Coordination"],
        typicalTools: ["Microsoft Excel", "Google Sheets", "Ops Trackers"],
        communicationLevel: "Clear, timely status reporting",
        howToPrepare: "Build automated Excel trackers and practice 5-Whys root-cause case studies.",
        portfolioExample: "A daily ops SLA dashboard + escalation SOP document.",
        additionalQualification: "None required.",
        whereToFindVacancies: "E-commerce, quick-commerce, logistics, EdTech, healthcare ops.",
        matchedUdayantuTrack: "operations-management",
      },
      {
        title: "Customer Success Associate",
        whatItInvolves:
          "Guiding new B2B/B2C clients through onboarding, tracking adoption health, and driving renewals.",
        whyDegreeFits:
          "BBA graduates balance relationship empathy with business retention thinking.",
        requiredSkills: ["Onboarding Calls", "Account Health Tracking", "De-Escalation", "Retention Metrics"],
        typicalTools: ["CRM", "Ticketing Tools", "Sheets"],
        communicationLevel: "Structured spoken & written English + Hindi",
        howToPrepare: "Build an onboarding playbook and practice handling client escalations calmly.",
        portfolioExample: "A 30-60-90 day client onboarding deck + health-score sheet.",
        additionalQualification: "None required.",
        whereToFindVacancies: "SaaS, EdTech, B2B tech & subscription companies.",
        matchedUdayantuTrack: "customer-success",
      },
      {
        title: "Project Coordinator & Business Support Associate",
        whatItInvolves:
          "Supporting cross-functional project schedules, preparing management decks, documenting meetings, and following up on action items.",
        whyDegreeFits:
          "BBA generalists who like cross-department exposure thrive in PMO and business-support seats.",
        requiredSkills: ["Milestone Planning", "Agile/Kanban Basics", "Executive Summaries", "Deck Building"],
        typicalTools: ["Trello/Jira concepts", "Sheets/Excel", "Slides/PowerPoint"],
        communicationLevel: "Crisp written summaries and polite follow-through",
        howToPrepare: "Practice creating clean project timelines, RAID logs, and 1-page status briefs.",
        portfolioExample: "A 6-week project delivery plan + weekly stakeholder update memo.",
        additionalQualification: "None required for fresher coordinator roles.",
        whereToFindVacancies: "Consulting support, agencies, IT/product delivery teams.",
        matchedUdayantuTrack: "project-management",
      },
    ],
    specializations: [
      {
        name: "BBA Marketing",
        hinglishHook: "BBA Marketing ke baad jobs",
        suitableRoles: ["Marketing Executive", "Business Development Executive", "Customer Success Associate"],
        keyEdge: "Familiarity with positioning, branding, and buyer psychology.",
        honestCaveat: "Pair theory with hands-on GA4, SEO, content calendar, and outreach execution.",
      },
      {
        name: "BBA Human Resources (HR)",
        hinglishHook: "BBA HR ke baad jobs",
        suitableRoles: ["HR Recruiter", "HR Operations Coordinator", "Customer Success Associate"],
        keyEdge: "People focus and HR lifecycle understanding.",
        honestCaveat: "Most fresher HR openings start in Recruitment/TA before moving to HRBP or L&D.",
      },
      {
        name: "BBA Finance / General Management",
        hinglishHook: "BBA General / Finance ke baad jobs",
        suitableRoles: ["Business Operations Executive", "Project Coordinator", "Business Development Executive", "MIS Support"],
        keyEdge: "Broad commercial literacy across budgets, processes, and reporting.",
        honestCaveat: "Investment banking or core equity research typically require CFA/top-tier MBA; target corporate ops, MIS, BD, and coordination directly after BBA.",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Narrow Down From 'General Management' to 1 Core Track",
        focus: "Recruiters hire for specific roles, not vague 'any management role'",
        actions: [
          "Take a career fit assessment across BD, Marketing, HR, Operations, Customer Success, and Coordination",
          "Audit your Excel, writing, and spoken clarity gaps honestly",
          "Study 15 real fresher job descriptions in your chosen track",
        ],
      },
      {
        phase: "Days 31–60: Replace College Theory With Practical Deliverables",
        focus: "Build 3 employer-ready portfolio pieces",
        actions: [
          "Complete hands-on track projects (CRM sheet, campaign plan, Excel MIS dashboard, or HR tracker)",
          "Practice case scenarios and real role-play conversations with mentor feedback",
          "Craft a sharp 1-page role-specific resume",
        ],
      },
      {
        phase: "Days 61–90: Mock Rounds & Focused Hiring Outreach",
        focus: "Turn interviews into concrete fresher offers",
        actions: [
          "Run 5+ mock HR and functional interviews with structured critique",
          "Apply consistently across verified portals and employer connections",
          "Prepare smart questions about KPIs and team workflows to ask interviewers",
        ],
      },
    ],
    resumeGuidance: [
      "Avoid writing 'Seeking a challenging management position'—name your exact target fresher role (e.g., 'Operations Executive' or 'Business Development Executive').",
      "Showcase measurable college internships or practical assignments with tools used.",
      "Keep formatting crisp, clean, and 1 page long.",
    ],
    interviewGuidance: [
      "Interviewers will test whether you can apply BBA concepts in real life—always give a concrete example instead of a textbook definition.",
      "Be prepared to walk through one portfolio assignment you built from scratch.",
    ],
    regionalInsight:
      "BBA graduates from Tier 2–4 cities often feel pressured into expensive local MBA programmes right away. Gaining 12–24 months of real corporate execution experience first gives you income, clarity, and far stronger ROI if you pursue an MBA later.",
    matchedUdayantuTracks: [
      "business-development",
      "marketing-management",
      "human-resources",
      "customer-success",
      "operations-management",
      "project-management",
    ],
    primaryCtaLabel: "Discover My Best Career After BBA",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "BBA ke baad bina MBA ke acchi job mil sakti hai?",
        answer:
          "Haan. Business Development, Marketing, HR Recruitment, Operations, Customer Success aur Project Coordination mein har saal badi sankhya mein BBA freshers bina MBA ke hire hote hain—practical skills aur portfolio zaroori hota hai.",
      },
      {
        question: "BBA freshers ko interview mein sabse common galti kya hoti hai?",
        answer:
          "Bahut se freshers 'any management job' bol dete hain aur textbook definitions sunate hain. Ek specific track choose karke practical assignments dikhana shortlisting chances kaafi badha deta hai.",
      },
    ],
    relatedBlogSlugs: [
      "tier-3-4-graduates-business-development-roles",
      "customer-success-101-empathy-and-clarity",
    ],
  },

  // =========================================================================
  // 5. BCA AFTER GRADUATION
  // =========================================================================
  {
    slug: "bca",
    path: "/jobs-after-bca",
    degreeLabel: "BCA",
    degreeFullName: "Bachelor of Computer Applications (BCA)",
    level: "Undergraduate",
    seoTitle: "BCA Ke Baad Jobs for Freshers | Career Options & Skills | UdaYantu",
    metaDescription:
      "BCA ke baad job kaise milegi? Compare software development vs IT support, technical customer support, application/product support, operations, and project coordination roles for freshers.",
    h1: "BCA ke baad job kaise milegi? Explore technical and non-technical career options.",
    hindiSubtitle: "बीसीए के बाद टेक्निकल सपोर्ट और कॉर्पोरेट जॉब विकल्प",
    primaryKeyword: "BCA ke baad jobs",
    secondaryKeywords: [
      "BCA fresher jobs in India",
      "BCA ke baad private job",
      "BCA non coding jobs for freshers",
      "BCA ke baad job kaise milegi",
    ],
    directAnswer:
      "BCA graduates ke paas teen clear career categories hoti hain: (1) Software Development / Coding Roles (Full-Stack, Backend, QA Automation)—jinke liye strong DSA, coding projects, ya MCA/dedicated coding preparation chahiye; (2) Tech-Adjacent Support & Product Roles (IT Support, Technical Customer Support, Application Support, Product Support, Junior Business Analysis, Project Coordination)—jahan BCA ki tech understanding + structured communication direct advantage deti hai; aur (3) Corporate Operations & Growth Roles.",
    hinglishContext:
      "Har BCA graduate ko heavy coding pasand ho yeh zaroori nahi hai—aur bina coding ke bhi tech companies mein valuable careers hote hain. Technical Support, Product Support, Application Support, Operations, aur Project Coordination aise roles hain jahan aapki computer applications ki samajh aur clear communication milkar strong career banate hain.",
    quickOverviewPoints: [
      "Honest distinction between Software Development (coding), Tech/Product Support, and Corporate Operations roles",
      "BCA graduates hold a natural advantage in Technical Customer Support, Application Support, and Product Operations",
      "Clear transparency: UdaYantu does NOT teach software engineering or coding—we train for tech-adjacent & corporate tracks",
      "Structured troubleshooting, bug documentation, and client communication unlock fast entry into tech companies",
    ],
    honestBoundaryNotice:
      "Important curriculum transparency: UdaYantu does NOT offer software engineering, full-stack coding, Java/Python DSA, or MCA preparation. If you want a coding/developer job, pursue dedicated software-engineering projects and practice. If you want Technical/Product Support, Customer Success, Operations, Business Analysis-adjacent, or Project Coordination careers inside tech companies, UdaYantu's tracks align directly.",
    roles: [
      {
        title: "IT Support & Service Desk Associate (L1)",
        whatItInvolves:
          "Resolving user login, software setup, access, and basic network/application issues via ticketing systems and escalating complex L2/L3 incidents cleanly.",
        whyDegreeFits:
          "BCA coursework in operating systems, DBMS, and networking fundamentals gives you a head start in diagnosing everyday IT issues.",
        requiredSkills: ["Structured Troubleshooting", "Ticketing & SLA Hygiene", "Clear Written Replies", "Escalation Logging"],
        typicalTools: ["ServiceNow / Freshdesk / Zendesk workflows", "Basic OS & Browser Diagnostics", "Knowledge Bases"],
        communicationLevel: "Clear written English + calm phone/chat communication",
        howToPrepare: "Practice diagnosing common software/account errors step-by-step and writing concise ticket summaries.",
        portfolioExample: "A 10-incident troubleshooting playbook + escalation handoff template.",
        additionalQualification: "None required for L1 Service Desk; CompTIA/ITIL/cloud basics can be added later for L2 growth.",
        whereToFindVacancies: "IT services firms, SaaS startups, enterprise IT helpdesks on Naukri, LinkedIn, NCS.",
        matchedUdayantuTrack: "customer-support",
      },
      {
        title: "Technical Customer Support Executive",
        whatItInvolves:
          "Helping B2B/B2C software users troubleshoot app errors, integrations, billing/settings issues, and documenting reproducible bug steps for engineers.",
        whyDegreeFits:
          "SaaS companies value BCA graduates who can read error screenshots/logs calmly and explain fixes to non-technical users.",
        requiredSkills: ["Bug Reproduction", "Empathy & De-Escalation", "Ticket Prioritisation", "Help-Doc Writing"],
        typicalTools: ["Helpdesk Platforms", "Browser DevTools Basics", "CRM & FAQ Docs"],
        communicationLevel: "Clear spoken & written English + Hindi",
        howToPrepare: "Practice writing structured bug reports (Steps to Reproduce, Expected vs Actual) and polite customer replies.",
        portfolioExample: "5 structured bug-reproduction tickets + 5 customer resolution emails.",
        additionalQualification: "None required for entry-level SaaS support.",
        whereToFindVacancies: "SaaS, fintech, EdTech, healthtech companies on LinkedIn & Naukri.",
        matchedUdayantuTrack: "customer-support",
      },
      {
        title: "Application & Product Support Analyst",
        whatItInvolves:
          "Supporting live digital applications, verifying user-reported issues, assisting with feature rollouts/UAT checklists, and tracking recurring friction.",
        whyDegreeFits:
          "Bridges BCA's software familiarity with structured user empathy and product documentation.",
        requiredSkills: ["UAT Checklist Execution", "Issue Triage", "Funnel/Error Tracking", "Stakeholder Updates"],
        typicalTools: ["Ticketing Systems", "Spreadsheets", "User Flow Diagrams"],
        communicationLevel: "Precise written English for engineering & customer handoffs",
        howToPrepare: "Practice auditing mobile/web user flows and writing clear acceptance checklists.",
        portfolioExample: "A complete QA/UAT checklist + user friction report for a live consumer app.",
        additionalQualification: "Basic SQL familiarity is a bonus for some L2 application support roles (can be self-learned alongside).",
        whereToFindVacancies: "Product startups, fintech, IT product companies on LinkedIn & Naukri.",
        matchedUdayantuTrack: "product-management",
      },
      {
        title: "Customer Success Associate (SaaS / Tech)",
        whatItInvolves:
          "Onboarding new software customers, running product walkthrough calls, tracking usage adoption, and coordinating feature feedback.",
        whyDegreeFits:
          "BCA graduates learn new SaaS dashboards quickly and can guide non-technical clients smoothly.",
        requiredSkills: ["Product Walkthroughs", "Account Health Tracking", "Client Empathy", "Retention Hygiene"],
        typicalTools: ["CRM", "Spreadsheet Dashboards", "Presentation Decks"],
        communicationLevel: "Confident spoken & written English + regional fluency",
        howToPrepare: "Record a 3-minute walkthrough explaining a popular web app clearly to a first-time user.",
        portfolioExample: "A 30-day SaaS onboarding playbook + client health tracker.",
        additionalQualification: "None required.",
        whereToFindVacancies: "B2B SaaS, EdTech, cloud software companies.",
        matchedUdayantuTrack: "customer-success",
      },
      {
        title: "Junior Business Analysis & Product Operations Pathway",
        whatItInvolves:
          "Gathering stakeholder requirements, mapping user workflows, writing clear user stories, and tracking operational/product metrics.",
        whyDegreeFits:
          "BCA students understand how software screens and databases connect, making them effective translators between business and tech teams.",
        requiredSkills: ["Requirement Documentation", "Process Flowcharts", "Excel/Funnel Analysis", "Stakeholder Interviews"],
        typicalTools: ["Flowchart/Wireframe Tools", "Excel / Sheets", "Requirement Docs"],
        communicationLevel: "Structured analytical writing and active listening",
        howToPrepare: "Learn user-story formatting ('As a user, I want... so that...') and funnel data analysis.",
        portfolioExample: "A written feature requirement document (BRD/PRD mini-spec) + user flow diagram.",
        additionalQualification: "No coding required; analytical clarity and documentation quality decide shortlisting.",
        whereToFindVacancies: "IT consulting, SaaS, fintech, digital transformation teams.",
        matchedUdayantuTrack: "product-management",
      },
      {
        title: "Operations & Project Coordination Associate",
        whatItInvolves:
          "Managing sprint/delivery boards, coordinating tech-ops workflows, tracking SLAs, and compiling daily MIS reports.",
        whyDegreeFits:
          "Tech-comfortable BCA graduates pick up project boards, spreadsheets, and operational portals effortlessly.",
        requiredSkills: ["Agile/Kanban Tracking", "Excel MIS Reporting", "Risk Logs", "Cross-Team Follow-Up"],
        typicalTools: ["Jira/Trello basics", "Excel / Sheets", "Status Templates"],
        communicationLevel: "Concise written status updates",
        howToPrepare: "Practice maintaining sprint boards, milestone trackers, and SLA dashboards.",
        portfolioExample: "A 6-week software-rollout coordination tracker + RAID log.",
        additionalQualification: "None required for junior coordinator roles.",
        whereToFindVacancies: "IT services, digital agencies, startups, operations centres.",
        matchedUdayantuTrack: "project-management",
      },
      {
        title: "Software Developer / QA Engineer (Separate Coding Pathway)",
        whatItInvolves:
          "Writing production application code (web/mobile/backend) or automated test scripts using programming languages and version control.",
        whyDegreeFits:
          "Direct academic continuation for BCA graduates who genuinely enjoy writing code and debugging algorithms.",
        requiredSkills: ["Programming (JS/Java/Python)", "DSA & Git", "Databases (SQL)", "Deployed Coding Projects"],
        typicalTools: ["VS Code", "GitHub", "SQL", "Frameworks"],
        communicationLevel: "Clear technical code reviews and documentation",
        howToPrepare: "Build 2–3 deployed GitHub coding projects and practice coding problem-solving daily.",
        portfolioExample: "Deployed full-stack web project with clean GitHub repository and README.",
        additionalQualification: "Requires dedicated coding practice or MCA/coding bootcamp—NOT taught by UdaYantu.",
        whereToFindVacancies: "Tech startups, IT services, GitHub/LinkedIn, Naukri.",
      },
    ],
    specializations: [
      {
        name: "BCA (Non-Coding / Support & Product Track)",
        hinglishHook: "BCA ke baad bina coding ke job",
        suitableRoles: ["Technical Customer Support", "Application/Product Support", "Customer Success", "Operations & Project Coordination"],
        keyEdge: "Tech fluency without needing competitive coding interviews.",
        honestCaveat: "Communication clarity, structured documentation, and ticketing/Excel execution become your primary differentiators.",
      },
      {
        name: "BCA (Software / Developer Track)",
        hinglishHook: "BCA coding / developer jobs",
        suitableRoles: ["Junior Web Developer", "QA Tester", "Database/SQL Support"],
        keyEdge: "Direct path into software engineering if you love coding.",
        honestCaveat: "Requires genuine deployed coding projects and DSA practice (outside UdaYantu's non-coding curriculum).",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Choose Coding vs Tech-Adjacent Corporate Track Honestly",
        focus: "Stop half-heartedly cramming syntax if you prefer communication, support, product, or operations",
        actions: [
          "Decide clearly: Software Development (separate coding prep) OR Tech Support / Product Operations / Customer Success / Coordination",
          "Build daily written clarity (emails, bug reports, step-by-step explanations)",
          "Master spreadsheet trackers and structured troubleshooting checklists",
        ],
      },
      {
        phase: "Days 31–60: Build Tech-Adjacent Proof of Work",
        focus: "Show tech companies you understand users AND systems",
        actions: [
          "Create 3 practical deliverables (bug-triage log, product teardown, or SLA/sprint tracker)",
          "Practice explaining technical problems in simple language to non-technical customers",
          "Build a focused 1-page resume matching your chosen role",
        ],
      },
      {
        phase: "Days 61–90: Scenario Interviews & Targeted Applications",
        focus: "Ace troubleshooting, customer-empathy, and coordination rounds",
        actions: [
          "Run mock support/product/operations scenario interviews",
          "Apply to SaaS, IT services, fintech, and EdTech companies on LinkedIn, Naukri, and NCS",
          "Review feedback after every round and refine weak areas",
        ],
      },
    ],
    resumeGuidance: [
      "Clearly state your target track (e.g., 'Technical Support & Product Operations' vs 'Software Developer') so recruiters don't mismatch your profile.",
      "Highlight troubleshooting, documentation, Excel/ticketing workflows, and user-facing projects clearly.",
      "Do not list 10 programming languages you only saw briefly in college exams—list only tools you can confidently answer questions on.",
    ],
    interviewGuidance: [
      "For Technical/Product Support roles, practice explaining how you isolate a bug (browser issue vs account issue vs backend error).",
      "Show calm empathy—tech companies hire support and product associates who stay patient with confused users.",
    ],
    regionalInsight:
      "Many BCA graduates from Tier 2–4 colleges in UP, Bihar, and smaller cities hesitate to apply because they lack advanced coding portfolios. L1 Technical Support, Product Support, Customer Success, and Tech Operations offer legitimate, well-structured entry into India's tech and SaaS ecosystem.",
    matchedUdayantuTracks: [
      "customer-support",
      "product-management",
      "operations-management",
      "customer-success",
      "project-management",
    ],
    primaryCtaLabel: "Find My Best Career After BCA",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "BCA ke baad bina coding ke kaun-si private jobs mil sakti hain?",
        answer:
          "IT Support / Service Desk, Technical Customer Support, Application/Product Support, SaaS Customer Success, Operations/MIS, Junior Business Analysis, aur Project Coordination aisi tech-company jobs hain jahan heavy coding ke bina BCA graduates strong career bana sakte hain.",
      },
      {
        question: "Kya UdaYantu coding ya software development sikhata hai?",
        answer:
          "Nahi. UdaYantu coding ya software engineering nahi sikhata. BCA graduates jo Technical/Customer Support, Product Operations, Customer Success, Operations ya Project Coordination mein career banana chahte hain, unke liye UdaYantu ke 15-week tracks relevant hain.",
      },
    ],
    relatedBlogSlugs: [
      "customer-success-101-empathy-and-clarity",
      "first-interview-to-offer-letter-mentorship",
    ],
  },

  // =========================================================================
  // 6. MA AFTER GRADUATION (P2)
  // =========================================================================
  {
    slug: "ma",
    path: "/jobs-after-ma",
    degreeLabel: "MA",
    degreeFullName: "Master of Arts (MA)",
    level: "Postgraduate",
    seoTitle: "MA Ke Baad Job Options | Private Jobs & Corporate Careers | UdaYantu",
    metaDescription:
      "MA ke baad job options kya hain? Explore realistic private jobs after MA English, Economics, Psychology & Humanities, practical skills needed, and fresher career roadmaps.",
    h1: "MA ke baad kaun-si private jobs mil sakti hain? Practical Career Guide",
    hindiSubtitle: "एमए के बाद प्राइवेट जॉब्स और कॉर्पोरेट करियर गाइड",
    primaryKeyword: "MA ke baad job options",
    secondaryKeywords: [
      "MA English ke baad job",
      "MA ke baad private job",
      "MA graduate jobs for freshers India",
    ],
    directAnswer:
      "MA complete karne ke baad teaching/UGC-NET ke alawa aap corporate sector mein Content & Communications, HR & Talent Acquisition, Customer Success, Marketing Executive, Business Development, aur Operations roles mein career shuru kar sakte hain. Corporate hiring mein MA degree ke saath aapki communication maturity aur practical tool readiness dekhi jaati hai.",
    hinglishContext:
      "Bahut se MA graduates academic exams ya local teaching openings ka wait karte hue 2–3 saal nikal dete hain. Agar aap practical workplace skills aur ek focused portfolio add kar lein, toh India ke startups, EdTech, media, aur service companies mein respectable corporate roles available hain.",
    quickOverviewPoints: [
      "Strong entry fit in Content/Marketing, HR Recruitment, Customer Success, and Consultative Business Development",
      "MA graduates bring writing maturity, research depth, and calmer stakeholder communication",
      "Academic teaching/NET remains a separate pathway requiring UGC-NET/B.Ed qualifications",
      "Practical tools (Excel, CRM, SEO/content briefs, screening trackers) bridge the academic-to-corporate gap",
    ],
    honestBoundaryNotice:
      "University lectureship requires UGC-NET/PhD and school teaching requires B.Ed/TET—UdaYantu does not offer teaching exam coaching. This guide focuses on private corporate pathways open to MA graduates.",
    roles: [
      {
        title: "Content, Editorial & Marketing Associate",
        whatItInvolves: "Researching topics, writing clear long-form guides, managing content calendars, and supporting SEO/brand messaging.",
        whyDegreeFits: "MA English, Journalism, History, and Economics graduates bring strong reading synthesis and structured writing.",
        requiredSkills: ["Clear Business Writing", "SEO Formatting", "Research Synthesis", "Editorial Accuracy"],
        typicalTools: ["Google Docs", "Search Console", "CMS", "Canva"],
        communicationLevel: "High written accuracy in English and/or Hindi",
        howToPrepare: "Convert academic writing into crisp, reader-friendly web articles and marketing copy.",
        portfolioExample: "3 practical career/industry guides + 1 content calendar.",
        additionalQualification: "None required; writing samples decide shortlisting.",
        whereToFindVacancies: "EdTech, digital agencies, SaaS blogs, media companies.",
        matchedUdayantuTrack: "marketing-management",
      },
      {
        title: "HR Recruiter & People Operations Associate",
        whatItInvolves: "Sourcing talent, screening candidates, coordinating interviews, and managing onboarding documentation.",
        whyDegreeFits: "MA Psychology, Sociology, and Humanities graduates excel at structured interviews and empathetic communication.",
        requiredSkills: ["Resume Screening", "Structured Calling", "ATS Trackers", "Onboarding Docs"],
        typicalTools: ["LinkedIn / Job Portals", "Sheets", "Calendars"],
        communicationLevel: "Confident, respectful phone & email communication",
        howToPrepare: "Build JD screening scorecards and practice mock candidate screening calls.",
        portfolioExample: "A recruitment pipeline tracker + Day-1 to Day-30 onboarding checklist.",
        additionalQualification: "None required for Talent Acquisition & HR Coordinator roles.",
        whereToFindVacancies: "Corporate HR teams, staffing firms, startups.",
        matchedUdayantuTrack: "human-resources",
      },
      {
        title: "Customer Success Associate",
        whatItInvolves: "Onboarding clients, explaining product workflows clearly, resolving concerns, and supporting retention.",
        whyDegreeFits: "Postgraduate communication maturity helps build trust quickly with business clients.",
        requiredSkills: ["Onboarding Walkthroughs", "Account Tracking", "De-Escalation", "Retention Metrics"],
        typicalTools: ["CRM", "Google Sheets", "Helpdesk Platforms"],
        communicationLevel: "Strong spoken & written English/Hindi clarity",
        howToPrepare: "Practice structured onboarding calls and customer health tracking.",
        portfolioExample: "A 30-day onboarding playbook and escalation response sheet.",
        additionalQualification: "None required.",
        whereToFindVacancies: "EdTech, SaaS, B2B service firms.",
        matchedUdayantuTrack: "customer-success",
      },
      {
        title: "Business Development & Academic Counselling Associate",
        whatItInvolves: "Understanding learner or client goals, explaining suitable offerings transparently, and managing follow-ups.",
        whyDegreeFits: "MA graduates relate strongly to students, families, and consultative conversations.",
        requiredSkills: ["Consultative Discovery", "Listening", "CRM Follow-Up", "Ethical Persuasion"],
        typicalTools: ["CRM", "Sheets", "Email/WhatsApp"],
        communicationLevel: "Clear bilingual Hindi + English fluency",
        howToPrepare: "Practice needs-first discovery calls and objection handling.",
        portfolioExample: "A 40-lead outreach tracker + consultative call framework.",
        additionalQualification: "None required.",
        whereToFindVacancies: "EdTech, B2B services, SaaS companies.",
        matchedUdayantuTrack: "business-development",
      },
    ],
    specializations: [
      {
        name: "MA English",
        hinglishHook: "MA English ke baad job",
        suitableRoles: ["Content & Marketing Associate", "Customer Success Associate", "HR Recruiter"],
        keyEdge: "High written clarity and strong comprehension.",
        honestCaveat: "Practice concise business writing instead of academic essays.",
      },
      {
        name: "MA Economics / Political Science / Sociology",
        hinglishHook: "MA Economics / Humanities ke baad private job",
        suitableRoles: ["Operations Executive", "Research/Content Associate", "Business Development", "HR Coordinator"],
        keyEdge: "Strong analytical and societal context across Indian markets.",
        honestCaveat: "Pair your subject depth with Excel/CRM skills for corporate interviews.",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Translate Academic Depth Into a Target Corporate Track",
        focus: "Select 1 corporate track aligned to your writing, people, or analytical strengths",
        actions: [
          "Complete a structured career assessment",
          "Learn core workplace tools (Sheets/Excel, Docs, CRM/ticketing basics)",
          "Audit 10 real fresher/junior job descriptions",
        ],
      },
      {
        phase: "Days 31–60: Build Proof of Work",
        focus: "Show practical corporate execution",
        actions: [
          "Publish or assemble 3 practical track assignments",
          "Prepare a crisp 1-page corporate resume (not an academic CV)",
        ],
      },
      {
        phase: "Days 61–90: Mock Interviews & Targeted Outreach",
        focus: "Convert interviews confidently",
        actions: [
          "Run mock interviews addressing any academic gap years honestly and positively",
          "Apply via NCS, LinkedIn, Naukri, and employer networks",
        ],
      },
    ],
    resumeGuidance: [
      "Use a 1-page corporate resume instead of a multi-page academic CV.",
      "Focus on practical projects, tools, and communication outputs rather than thesis chapters.",
    ],
    interviewGuidance: [
      "If asked about shifting from MA or exam preparation to corporate work, explain clearly what practical skills you built and why you are committed to this role long-term.",
    ],
    regionalInsight:
      "MA graduates across UP and Bihar often hold strong Hindi-English bilingual clarity that EdTech, B2B outreach, content, and customer success teams value highly.",
    matchedUdayantuTracks: [
      "human-resources",
      "marketing-management",
      "customer-success",
      "business-development",
      "customer-support",
    ],
    primaryCtaLabel: "Discover My Best Career After MA",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "MA ke baad bina B.Ed ya NET ke private job kaise milegi?",
        answer:
          "Corporate sector mein Content & Marketing, HR Recruitment, Customer Success, Business Development aur Operations ke liye B.Ed ya NET zaroori nahi hota—practical skills, resume clarity aur interview preparation se direct entry milti hai.",
      },
    ],
    relatedBlogSlugs: [
      "customer-success-101-empathy-and-clarity",
      "first-interview-to-offer-letter-mentorship",
    ],
  },

  // =========================================================================
  // 7. M.COM AFTER GRADUATION (P2)
  // =========================================================================
  {
    slug: "mcom",
    path: "/jobs-after-mcom",
    degreeLabel: "M.Com",
    degreeFullName: "Master of Commerce (M.Com)",
    level: "Postgraduate",
    seoTitle: "M.Com Ke Baad Private Jobs & Career Options for Freshers | UdaYantu",
    metaDescription:
      "M.Com ke baad private jobs aur career pathways explore karein: Business Operations, MIS Reporting, Project Coordination, Business Development, and Customer Success.",
    h1: "M.Com ke baad private jobs aur practical career pathways",
    hindiSubtitle: "एम.कॉम के बाद प्राइवेट जॉब्स और कॉर्पोरेट स्किल्स गाइड",
    primaryKeyword: "MCom ke baad private jobs",
    secondaryKeywords: [
      "MCom fresher jobs",
      "MCom ke baad career options",
      "MCom private sector jobs India",
    ],
    directAnswer:
      "M.Com graduates corporate sector mein Business Operations, MIS & Reporting, Project Coordination, B2B Business Development, Customer Success, aur HR Operations jaise roles mein entry le sakte hain. Core accounting/taxation roles ke liye Tally/GST ya professional finance certifications alag se lagti hain.",
    hinglishContext:
      "M.Com ke baad commercial samajh aur numerical discipline aapka bada plus point hota hai. Excel MIS, process coordination, aur client communication add karke aap fast-growing corporate roles mein strong career bana sakte hain.",
    quickOverviewPoints: [
      "Strong commercial and numerical foundation for Business Operations, MIS Reporting, and Project Coordination",
      "Clear separation between corporate business tracks and specialist Tally/GST/accounting paths",
      "Practical Excel dashboards and structured communication accelerate fresher shortlisting",
    ],
    honestBoundaryNotice:
      "UdaYantu does not provide Tally, GST filing, statutory audit, or CA/CMA coaching. Our tracks prepare M.Com graduates for corporate Operations, Project Coordination, Business Development, Customer Success, and HR pathways.",
    roles: [
      {
        title: "Business Operations & MIS Executive",
        whatItInvolves: "Building operational trackers, reconciling workflow reports, monitoring SLAs, and coordinating vendors.",
        whyDegreeFits: "M.Com numerical rigour and business reporting familiarity fit MIS & Operations directly.",
        requiredSkills: ["Advanced Excel", "MIS Dashboards", "SOP Execution", "SLA Reporting"],
        typicalTools: ["Microsoft Excel", "Google Sheets", "Ops Portals"],
        communicationLevel: "Clear written reporting and vendor coordination",
        howToPrepare: "Build automated Excel summary trackers and practice process bottleneck analysis.",
        portfolioExample: "An automated operational KPI & SLA tracker in Excel/Sheets.",
        additionalQualification: "None required for corporate ops/MIS roles.",
        whereToFindVacancies: "BFSI, fintech, logistics, e-commerce, corporate operations.",
        matchedUdayantuTrack: "operations-management",
      },
      {
        title: "Project & Delivery Coordinator",
        whatItInvolves: "Tracking milestones, project schedules, budgets/vendor follow-ups, and stakeholder status briefs.",
        whyDegreeFits: "Combines postgraduate commercial discipline with structured milestone tracking.",
        requiredSkills: ["Scheduling", "Agile/Kanban Basics", "Risk Logs", "Status Updates"],
        typicalTools: ["Kanban Boards", "Excel / Sheets", "Docs"],
        communicationLevel: "Concise written & spoken summaries",
        howToPrepare: "Practice milestone breakdown, RAID logs, and executive recaps.",
        portfolioExample: "A 6-week project schedule + risk and dependency log.",
        additionalQualification: "None required for junior coordinator roles.",
        whereToFindVacancies: "Consulting support, fintech, IT/enterprise teams.",
        matchedUdayantuTrack: "project-management",
      },
      {
        title: "B2B Business Development & Client Relations",
        whatItInvolves: "Engaging business clients, discussing ROI/pricing value clearly, and managing structured pipelines.",
        whyDegreeFits: "M.Com graduates converse comfortably with business owners about margins and ROI.",
        requiredSkills: ["Consultative Discovery", "CRM Hygiene", "Objection Handling", "Follow-Up"],
        typicalTools: ["CRM", "Google Sheets", "LinkedIn"],
        communicationLevel: "Confident Hindi + workplace English",
        howToPrepare: "Practice discovery conversations and B2B outreach sequences.",
        portfolioExample: "A 40-account B2B prospect sheet with personalised outreach.",
        additionalQualification: "None required.",
        whereToFindVacancies: "Fintech, B2B SaaS, corporate services.",
        matchedUdayantuTrack: "business-development",
      },
    ],
    specializations: [
      {
        name: "M.Com (Accounting & Finance)",
        hinglishHook: "M.Com Finance ke baad jobs",
        suitableRoles: ["MIS & Reporting Executive", "Business Operations", "Project Coordinator"],
        keyEdge: "Comfort with financial metrics, reconciliation, and structured reporting.",
        honestCaveat: "Core tax/audit roles require Tally/GST or CA/CMA credentials outside UdaYantu.",
      },
      {
        name: "M.Com (Business Management / Marketing)",
        hinglishHook: "M.Com Management ke baad jobs",
        suitableRoles: ["Business Development", "Customer Success", "HR Coordinator", "Operations"],
        keyEdge: "Broad commercial and stakeholder perspective.",
        honestCaveat: "Demonstrate execution through practical assignments, not just postgraduate theory.",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Pick Your Corporate Track & Master Excel",
        focus: "Focus on one clear entry role",
        actions: ["Take a structured career assessment", "Strengthen Excel lookups, Pivot Tables, and business email writing"],
      },
      {
        phase: "Days 31–60: Practical Portfolio Deliverables",
        focus: "Prove workplace execution",
        actions: ["Build 2–3 track deliverables (MIS tracker, SOP, or B2B outreach plan)", "Update to a sharp 1-page corporate resume"],
      },
      {
        phase: "Days 61–90: Mock Tests & Hiring Drives",
        focus: "Clear practical Excel and scenario interview rounds",
        actions: ["Run mock functional interviews", "Apply selectively via verified job portals and placement drives"],
      },
    ],
    resumeGuidance: [
      "Highlight Excel/MIS tools and practical assignments at the top of your resume.",
      "Clarify whether you are targeting Corporate Operations/BD or Core Accounting so recruiters route your profile accurately.",
    ],
    interviewGuidance: [
      "Be prepared for practical spreadsheet or scenario questions rather than textbook accounting definitions.",
    ],
    regionalInsight:
      "M.Com graduates from Tier 2–4 universities often unlock better growth in pan-India fintech operations, MIS, and B2B client roles than in saturated local clerkships.",
    matchedUdayantuTracks: [
      "operations-management",
      "project-management",
      "business-development",
      "customer-success",
      "human-resources",
    ],
    primaryCtaLabel: "Discover My Best Career After M.Com",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "M.Com freshers ke liye corporate sector mein kaun-se practical roles open hain?",
        answer:
          "Business Operations, MIS & Reporting, Project Coordination, B2B Business Development, Customer Success, aur HR Operations M.Com freshers ke liye strong private-sector options hain.",
      },
    ],
    relatedBlogSlugs: [
      "tier-3-4-graduates-business-development-roles",
      "first-interview-to-offer-letter-mentorship",
    ],
  },

  // =========================================================================
  // 8. M.SC AFTER GRADUATION (P2)
  // =========================================================================
  {
    slug: "msc",
    path: "/jobs-after-msc",
    degreeLabel: "M.Sc",
    degreeFullName: "Master of Science (M.Sc)",
    level: "Postgraduate",
    seoTitle: "M.Sc Ke Baad Jobs | Corporate & Analytical Career Options | UdaYantu",
    metaDescription:
      "M.Sc ke baad jobs aur practical career options: Operations & MIS, Product Operations, Technical Support, Project Coordination, and research-adjacent corporate roles.",
    h1: "M.Sc ke baad jobs aur practical corporate career options",
    hindiSubtitle: "एम.एससी के बाद कॉर्पोरेट और एनालिटिकल करियर गाइड",
    primaryKeyword: "MSc ke baad jobs",
    secondaryKeywords: [
      "MSc ke baad private job",
      "MSc fresher jobs in India",
      "MSc non teaching jobs",
    ],
    directAnswer:
      "M.Sc graduates ke paas research/R&D/teaching ke alawa strong corporate pathways available hain—jaise Operations & MIS Analysis, Product Operations & Support, Technical Customer Support, Project Coordination, aur B2B Consultative Sales (healthtech/EdTech/SaaS). Corporate roles aapki analytical precision aur structured problem solving ko value karte hain.",
    hinglishContext:
      "Agar aap PhD ya NET ke alawa private sector mein stable career build karna chahte hain, toh apni M.Sc analytical training ko spreadsheets, product workflows, aur structured communication ke saath combine karna ek realistic step hai.",
    quickOverviewPoints: [
      "Analytical strength transfers directly to Operations/MIS, Product Operations, Technical Support, and Project Coordination",
      "Transparent separation from regulated pharma R&D/clinical roles and academic PhD/NET pathways",
      "Focused 90-day transition from academic research style to crisp corporate communication",
    ],
    honestBoundaryNotice:
      "UdaYantu does not provide laboratory R&D, clinical trial licensing, CSIR-NET coaching, or software engineering courses. Our tracks support M.Sc graduates transitioning into corporate Operations, Product Operations, Technical Support, and Project Coordination.",
    roles: [
      {
        title: "Operations & Process Analyst (Entry-Level)",
        whatItInvolves: "Analysing operational bottlenecks, maintaining Excel/Sheets KPI trackers, improving SOPs, and coordinating teams.",
        whyDegreeFits: "M.Sc Maths, Statistics, Physics, and Chemistry graduates handle structured data and root-cause analysis naturally.",
        requiredSkills: ["Excel Pivot Tables & Formulas", "Root-Cause Analysis", "SOP Writing", "KPI Reporting"],
        typicalTools: ["Microsoft Excel", "Google Sheets", "Ops Trackers"],
        communicationLevel: "Clear written summaries for business stakeholders",
        howToPrepare: "Build operational dashboards and practice translating data findings into clear 3-bullet action plans.",
        portfolioExample: "An SLA performance dashboard + 5-Whys bottleneck reduction case study.",
        additionalQualification: "None required for corporate ops roles.",
        whereToFindVacancies: "E-commerce, logistics, healthtech, EdTech, enterprise ops.",
        matchedUdayantuTrack: "operations-management",
      },
      {
        title: "Product Operations & Support Analyst",
        whatItInvolves: "Running UAT checklists, triaging user bugs, analysing onboarding funnels, and coordinating releases.",
        whyDegreeFits: "Combines scientific hypothesis testing with structured digital product workflows.",
        requiredSkills: ["Funnel Analysis", "Bug Documentation", "User Research", "UAT Testing"],
        typicalTools: ["Sheets", "Ticketing Systems", "Flow Diagrams"],
        communicationLevel: "Precise written English documentation",
        howToPrepare: "Audit a live app's user journey and build a structured UX/bug report.",
        portfolioExample: "A product teardown + signup funnel drop-off analysis.",
        additionalQualification: "No coding needed for Product Operations/Support.",
        whereToFindVacancies: "SaaS, EdTech, healthtech, digital product startups.",
        matchedUdayantuTrack: "product-management",
      },
      {
        title: "Technical Support & Project Coordinator",
        whatItInvolves: "Solving structured user issues or coordinating cross-functional project timelines and risk logs.",
        whyDegreeFits: "Methodical troubleshooting and disciplined documentation from M.Sc projects.",
        requiredSkills: ["Structured Troubleshooting", "Milestone Tracking", "Clear Client Updates"],
        typicalTools: ["Helpdesk / Kanban Boards", "Sheets", "Docs"],
        communicationLevel: "Calm, concise written & spoken communication",
        howToPrepare: "Practice writing crisp troubleshooting guides and weekly project status notes.",
        portfolioExample: "A 10-case troubleshooting log or 6-week project delivery schedule.",
        additionalQualification: "None required.",
        whereToFindVacancies: "IT services, SaaS, healthtech, EdTech firms.",
        matchedUdayantuTrack: "customer-support",
      },
    ],
    specializations: [
      {
        name: "M.Sc Maths / Statistics / Physics",
        hinglishHook: "M.Sc Maths / Physics ke baad corporate jobs",
        suitableRoles: ["Operations & MIS Analyst", "Product Operations Analyst", "Project Coordinator"],
        keyEdge: "Quantitative comfort and logical modelling.",
        honestCaveat: "Pair your degree with Excel dashboards and clear non-academic communication.",
      },
      {
        name: "M.Sc Chemistry / Life Sciences / Biotech",
        hinglishHook: "M.Sc Chemistry / Biology ke baad jobs",
        suitableRoles: ["Pharma QA/QC (industry-specific)", "Healthcare Operations", "EdTech/Healthtech BD", "Customer Success"],
        keyEdge: "Deep process compliance and domain learning stamina.",
        honestCaveat: "Lab R&D hiring is concentrated in specific pharma hubs; corporate operations and healthtech roles expand pan-India access.",
      },
    ],
    roadmap: [
      {
        phase: "Days 1–30: Bridge Academic Language to Business Language",
        focus: "Pick 1 corporate track aligned to your analytical or communication strengths",
        actions: ["Complete a structured career assessment", "Master Excel/Sheets dashboards and concise email writing"],
      },
      {
        phase: "Days 31–60: Build Corporate Deliverables",
        focus: "Create 3 real-world business assignments",
        actions: ["Build an MIS dashboard, product teardown, or troubleshooting guide", "Prepare a crisp 1-page corporate resume"],
      },
      {
        phase: "Days 61–90: Mock Rounds & Focused Applications",
        focus: "Convert corporate interviews",
        actions: ["Practice explaining why you are excited about practical business roles", "Apply through NCS, LinkedIn, Naukri, and employer networks"],
      },
    ],
    resumeGuidance: [
      "Replace academic thesis abstracts with 1-page corporate project highlights and tools used.",
      "Quantify analytical accuracy, documentation, and problem-solving outcomes clearly.",
    ],
    interviewGuidance: [
      "Explain your transition from M.Sc to corporate work proactively—highlight that you want fast real-world execution impact.",
    ],
    regionalInsight:
      "M.Sc graduates from state universities across North India can access remote and metro-hub analytical operations, product support, and healthtech/EdTech roles without waiting years for scarce academic posts.",
    matchedUdayantuTracks: [
      "operations-management",
      "product-management",
      "project-management",
      "customer-support",
      "customer-success",
    ],
    primaryCtaLabel: "Find My Best Career After M.Sc",
    secondaryCtaLabel: "Explore Career Options",
    faqs: [
      {
        question: "M.Sc ke baad bina PhD ya NET ke corporate job kaise milegi?",
        answer:
          "Operations & MIS, Product Operations, Technical Support, Project Coordination aur Healthtech/EdTech Business Development roles M.Sc graduates ko unki analytical thinking aur practical tool readiness par hire karte hain.",
      },
    ],
    relatedBlogSlugs: [
      "customer-success-101-empathy-and-clarity",
      "first-interview-to-offer-letter-mentorship",
    ],
  },
];

export const DEGREE_GUIDE_BY_SLUG: Record<DegreeSlug, DegreeGuideData> = DEGREE_GUIDES.reduce(
  (acc, item) => {
    acc[item.slug] = item;
    return acc;
  },
  {} as Record<DegreeSlug, DegreeGuideData>
);

export function getDegreeGuideBySlug(slug: string): DegreeGuideData | undefined {
  return DEGREE_GUIDES.find((g) => g.slug === slug);
}
