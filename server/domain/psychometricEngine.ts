/**
 * Versioned, Deterministic 11-Dimension Psychometric & Career Recommendation Engine.
 *
 * Guidelines enforced:
 * - Evaluates 11 behavioural, work-style, interest, aptitude, and practical English dimensions.
 * - Non-clinical: NEVER diagnoses medical/psychological conditions and NEVER permanently labels
 *   a student as an "introvert" or "extrovert". Frames results as tendencies & preferences.
 * - Maps deterministically to the 8 canonical UdaYantu career tracks.
 * - Career alignment is the primary signal; job availability is displayed separately and
 *   NEVER distorts recommendation rankings.
 * - Supports 20% pre-login result preview and 100% authenticated full report.
 */

export const PSYCHOMETRIC_ENGINE_VERSION = "PSY-2026.2";

export type CanonicalCareerTrackId =
  | "business-development"
  | "customer-success"
  | "project-management"
  | "operations-management"
  | "product-management"
  | "human-resources"
  | "marketing-management"
  | "customer-support";

export type AssessmentDimensionId =
  | "social_energy_tendency"
  | "communication_preference"
  | "collaboration_teamwork"
  | "independent_work_preference"
  | "problem_solving_orientation"
  | "decision_making_tendency"
  | "adaptability"
  | "learning_preference"
  | "career_interests"
  | "basic_aptitude"
  | "foundational_english";

export interface PsychometricOption {
  id: string;
  labelEn: string;
  labelHi: string;
  dimensionContributions: Partial<Record<AssessmentDimensionId, number>>;
  trackAffinities: Partial<Record<CanonicalCareerTrackId, number>>;
  isObjectiveCorrect?: boolean; // For short aptitude & practical English items (scored server-side)
}

export interface PsychometricQuestion {
  id: string;
  order: number;
  category:
    | "Workplace Situation"
    | "Team Collaboration"
    | "Decision Making"
    | "Customer Interaction"
    | "Problem Solving"
    | "Career Preference"
    | "Practical Aptitude"
    | "Foundational English";
  primaryDimension: AssessmentDimensionId;
  promptEn: string;
  promptHi: string;
  estimatedSeconds: number;
  options: PsychometricOption[];
}

export interface PublicPsychometricQuestion {
  id: string;
  order: number;
  category: PsychometricQuestion["category"];
  primaryDimension: AssessmentDimensionId;
  promptEn: string;
  promptHi: string;
  estimatedSeconds: number;
  options: Array<{ id: string; labelEn: string; labelHi: string }>;
}

export interface CanonicalTrackProfile {
  id: CanonicalCareerTrackId;
  name: string;
  hindiName: string;
  summary: string;
  relevantSkills: string[];
  suitableJobFamilies: string[];
  recommendedLearningPath: string[];
  activeEmployerDemandNote: string; // Displayed separately — NEVER alters fit ranking
  dimensionWeights: Record<AssessmentDimensionId, number>;
}

export const CANONICAL_TRACK_PROFILES: Record<CanonicalCareerTrackId, CanonicalTrackProfile> = {
  "business-development": {
    id: "business-development",
    name: "Business Development",
    hindiName: "बिज़नेस डेवलपमेंट",
    summary: "Building client relationships, qualifying business needs, and growing structured revenue pipelines.",
    relevantSkills: [
      "Consultative Discovery & Active Listening",
      "Lead Research & Prospect Qualification",
      "CRM Pipeline Discipline",
      "Confident Objection Handling",
    ],
    suitableJobFamilies: [
      "Business Development Executive (BDE)",
      "Inside Sales Associate",
      "Sales Development Representative (SDR)",
      "Client Acquisition Coordinator",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: Buyer psychology & consultative conversation frameworks",
      "Weeks 4–6: Prospect research, outreach writing & CRM hygiene",
      "Weeks 7–10: Live call simulations, objection handling & negotiation",
      "Weeks 11–13: Capstone outreach portfolio, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "Consistent entry-level hiring across SaaS, EdTech, fintech, and B2B services.",
    dimensionWeights: {
      social_energy_tendency: 1.5,
      communication_preference: 1.5,
      collaboration_teamwork: 0.9,
      independent_work_preference: 0.9,
      problem_solving_orientation: 0.8,
      decision_making_tendency: 1.2,
      adaptability: 1.3,
      learning_preference: 0.9,
      career_interests: 1.4,
      basic_aptitude: 0.8,
      foundational_english: 1.1,
    },
  },
  "customer-success": {
    id: "customer-success",
    name: "Customer Success",
    hindiName: "कस्टमर सक्सेस",
    summary: "Onboarding clients smoothly, guiding adoption, solving friction early, and growing long-term trust.",
    relevantSkills: [
      "Client Onboarding & Account Health Tracking",
      "Empathetic Relationship Communication",
      "Structured QBR & Renewal Preparation",
      "Cross-Team Issue Escalation",
    ],
    suitableJobFamilies: [
      "Customer Success Associate",
      "Client Onboarding Specialist",
      "Account Coordinator",
      "Retention Executive",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: Customer lifecycle mapping & onboarding playbooks",
      "Weeks 4–6: Health-score spreadsheets, check-in calls & escalation handling",
      "Weeks 7–10: Client review presentations & retention workshops",
      "Weeks 11–13: Portfolio case study, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "Steady demand in subscription software, B2B platforms, and managed services.",
    dimensionWeights: {
      social_energy_tendency: 1.2,
      communication_preference: 1.5,
      collaboration_teamwork: 1.4,
      independent_work_preference: 0.7,
      problem_solving_orientation: 1.2,
      decision_making_tendency: 1.0,
      adaptability: 1.2,
      learning_preference: 1.0,
      career_interests: 1.2,
      basic_aptitude: 0.9,
      foundational_english: 1.3,
    },
  },
  "project-management": {
    id: "project-management",
    name: "Project Management",
    hindiName: "प्रोजेक्ट मैनेजमेंट",
    summary: "Coordinating milestones, aligning cross-functional teams, managing timelines, and keeping deliveries on track.",
    relevantSkills: [
      "Milestone Planning & Task Breakdown",
      "Stakeholder Follow-Up & Status Reporting",
      "Risk Identification & Schedule Tracking",
      "Project Tools (Trello, Asana, Jira basics)",
    ],
    suitableJobFamilies: [
      "Project Coordinator",
      "Junior PMO Analyst",
      "Delivery Operations Associate",
      "Implementation Coordinator",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: Scope, timelines, WBS & task dependency basics",
      "Weeks 4–6: Sprint boards, tracker dashboards & stakeholder updates",
      "Weeks 7–10: Risk registers, delay recovery & cross-team simulations",
      "Weeks 11–13: Live project plan capstone, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "Hired across IT services, consulting, operations hubs, and digital agencies.",
    dimensionWeights: {
      social_energy_tendency: 0.9,
      communication_preference: 1.2,
      collaboration_teamwork: 1.5,
      independent_work_preference: 1.0,
      problem_solving_orientation: 1.3,
      decision_making_tendency: 1.4,
      adaptability: 1.1,
      learning_preference: 1.0,
      career_interests: 1.2,
      basic_aptitude: 1.2,
      foundational_english: 1.1,
    },
  },
  "operations-management": {
    id: "operations-management",
    name: "Operations Management",
    hindiName: "ऑपरेशंस मैनेजमेंट",
    summary: "Designing reliable daily workflows, maintaining MIS accuracy, tracking SLAs, and improving process efficiency.",
    relevantSkills: [
      "Excel / Google Sheets MIS & Data Hygiene",
      "SOP Documentation & SLA Monitoring",
      "Process Bottleneck Analysis",
      "Vendor & Inventory Coordination",
    ],
    suitableJobFamilies: [
      "Operations Executive",
      "MIS & Process Analyst",
      "Supply Chain / Fulfillment Coordinator",
      "Back-Office Operations Associate",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: Business process mapping, SOPs & SLA fundamentals",
      "Weeks 4–6: Spreadsheet formulas, pivot tables & daily MIS reporting",
      "Weeks 7–10: Quality control audits, exception handling & efficiency projects",
      "Weeks 11–13: Operations dashboard capstone, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "Broad fresher hiring across e-commerce, logistics, BFSI, healthcare, and startups.",
    dimensionWeights: {
      social_energy_tendency: 0.6,
      communication_preference: 0.9,
      collaboration_teamwork: 1.0,
      independent_work_preference: 1.4,
      problem_solving_orientation: 1.5,
      decision_making_tendency: 1.3,
      adaptability: 1.0,
      learning_preference: 1.2,
      career_interests: 1.2,
      basic_aptitude: 1.5,
      foundational_english: 0.9,
    },
  },
  "product-management": {
    id: "product-management",
    name: "Product Management",
    hindiName: "प्रोडक्ट मैनेजमेंट",
    summary: "Understanding user pain points, structuring clear requirements, prioritising improvements, and validating solutions.",
    relevantSkills: [
      "User Research & Problem Framing",
      "Structured Feature Documentation (PRDs)",
      "Basic Metrics & Funnel Thinking",
      "Usability Testing & Prioritisation",
    ],
    suitableJobFamilies: [
      "Associate Product Analyst",
      "Product Operations Associate",
      "Junior Business Analyst",
      "Product Support & QA Coordinator",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: User discovery interviews, journey mapping & problem statements",
      "Weeks 4–6: Wireframe critique, PRD writing & prioritisation frameworks",
      "Weeks 7–10: Funnel metrics, bug triage & release coordination",
      "Weeks 11–13: Product teardown capstone, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "Selective but high-growth entry roles in SaaS, consumer apps, and digital teams.",
    dimensionWeights: {
      social_energy_tendency: 0.8,
      communication_preference: 1.2,
      collaboration_teamwork: 1.2,
      independent_work_preference: 1.2,
      problem_solving_orientation: 1.6,
      decision_making_tendency: 1.5,
      adaptability: 1.2,
      learning_preference: 1.4,
      career_interests: 1.3,
      basic_aptitude: 1.4,
      foundational_english: 1.2,
    },
  },
  "human-resources": {
    id: "human-resources",
    name: "Human Resources",
    hindiName: "ह्यूमन रिसोर्सेज (HR)",
    summary: "Supporting fair hiring, candidate coordination, employee onboarding, documentation, and healthy workplace culture.",
    relevantSkills: [
      "Resume Screening & Interview Coordination",
      "Employee Onboarding & HRIS Documentation",
      "Empathetic Workplace Communication",
      "Attendance, Policy & Compliance Tracking",
    ],
    suitableJobFamilies: [
      "HR Coordinator",
      "Talent Acquisition Associate",
      "People Operations Executive",
      "Onboarding & Recruitment Specialist",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: Hiring funnel, job descriptions & candidate screening rubrics",
      "Weeks 4–6: Interview scheduling, ATS tracking & professional outreach",
      "Weeks 7–10: Onboarding checklists, employee engagement & basic HR policies",
      "Weeks 11–13: Recruitment workflow capstone, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "Consistent entry opportunities across staffing firms, SMEs, and corporate HR teams.",
    dimensionWeights: {
      social_energy_tendency: 1.2,
      communication_preference: 1.4,
      collaboration_teamwork: 1.5,
      independent_work_preference: 0.8,
      problem_solving_orientation: 0.9,
      decision_making_tendency: 1.1,
      adaptability: 1.1,
      learning_preference: 1.0,
      career_interests: 1.3,
      basic_aptitude: 0.8,
      foundational_english: 1.3,
    },
  },
  "marketing-management": {
    id: "marketing-management",
    name: "Marketing Management",
    hindiName: "मार्केटिंग मैनेजमेंट",
    summary: "Crafting clear audience messaging, coordinating campaigns, tracking engagement metrics, and growing brand reach.",
    relevantSkills: [
      "Audience Research & Campaign Messaging",
      "Social Media & Content Calendar Execution",
      "Basic Performance Metrics (CTR, CPL, Funnel)",
      "Landing Page & Email Copy Basics",
    ],
    suitableJobFamilies: [
      "Marketing Executive",
      "Digital Campaign Coordinator",
      "Content & Social Media Associate",
      "Growth Marketing Intern / Analyst",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: Audience personas, value propositions & brand voice",
      "Weeks 4–6: Content calendars, Canva/copy basics & channel workflows",
      "Weeks 7–10: Campaign tracking sheets, SEO fundamentals & reporting",
      "Weeks 11–13: Multi-channel campaign capstone, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "Active hiring in D2C brands, agencies, EdTech, and regional growth teams.",
    dimensionWeights: {
      social_energy_tendency: 1.1,
      communication_preference: 1.4,
      collaboration_teamwork: 1.1,
      independent_work_preference: 1.1,
      problem_solving_orientation: 1.1,
      decision_making_tendency: 1.0,
      adaptability: 1.4,
      learning_preference: 1.3,
      career_interests: 1.5,
      basic_aptitude: 1.0,
      foundational_english: 1.3,
    },
  },
  "customer-support": {
    id: "customer-support",
    name: "Customer Support",
    hindiName: "कस्टमर सपोर्ट",
    summary: "Resolving customer queries calmly and accurately via chat, email, and voice while meeting response standards.",
    relevantSkills: [
      "Calm De-Escalation & Clear Explanations",
      "Ticketing Workflows & SLA Resolution",
      "Accurate Written English & Hindi Support",
      "Root-Cause Logging & Knowledge Base Usage",
    ],
    suitableJobFamilies: [
      "Customer Support Executive",
      "Technical / Product Support Associate",
      "Chat & Email Support Specialist",
      "Service Desk Coordinator",
    ],
    recommendedLearningPath: [
      "Weeks 1–3: Active listening, empathy scripts & professional tone",
      "Weeks 4–6: Ticketing systems, SLA priorities & structured troubleshooting",
      "Weeks 7–10: Live chat/email/call simulations & escalation discipline",
      "Weeks 11–13: Support playbook capstone, mock interviews & final 75% exam",
    ],
    activeEmployerDemandNote: "High year-round fresher intake across SaaS, telecom, fintech, and e-commerce.",
    dimensionWeights: {
      social_energy_tendency: 0.9,
      communication_preference: 1.3,
      collaboration_teamwork: 1.1,
      independent_work_preference: 1.1,
      problem_solving_orientation: 1.3,
      decision_making_tendency: 1.0,
      adaptability: 1.2,
      learning_preference: 1.0,
      career_interests: 1.1,
      basic_aptitude: 1.0,
      foundational_english: 1.4,
    },
  },
};

export const PSYCHOMETRIC_QUESTIONS: PsychometricQuestion[] = [
  {
    id: "q1_energy",
    order: 1,
    category: "Workplace Situation",
    primaryDimension: "social_energy_tendency",
    promptEn: "At the start of a busy workday, which setting helps you feel most energised and productive?",
    promptHi: "एक व्यस्त कार्यदिवस की शुरुआत में, कौन सा माहौल आपको सबसे अधिक ऊर्जावान और उत्पादक बनाता है?",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "Speaking with new clients, pitching ideas, and keeping lively conversations moving",
        labelHi: "नए क्लाइंट्स से बात करना, आइडिया शेयर करना और बातचीत आगे बढ़ाना",
        dimensionContributions: { social_energy_tendency: 5, communication_preference: 5 },
        trackAffinities: { "business-development": 10, "marketing-management": 6 },
      },
      {
        id: "b",
        labelEn: "Collaborating in a focused small team huddle to align on goals and help people",
        labelHi: "एक छोटी टीम के साथ मिलकर लक्ष्य तय करना और लोगों की मदद करना",
        dimensionContributions: { social_energy_tendency: 4, collaboration_teamwork: 5 },
        trackAffinities: { "customer-success": 8, "human-resources": 8, "project-management": 7 },
      },
      {
        id: "c",
        labelEn: "Working quietly on structured trackers, analysis, or workflows with brief team check-ins",
        labelHi: "शांति से डेटा, ट्रैकर या प्रोसेस पर काम करना और जरूरत पर टीम से बात करना",
        dimensionContributions: { social_energy_tendency: 2, independent_work_preference: 5 },
        trackAffinities: { "operations-management": 10, "product-management": 7 },
      },
      {
        id: "d",
        labelEn: "Handling one-to-one customer questions calmly over chat, email, or scheduled calls",
        labelHi: "चैट, ईमेल या कॉल पर एक-एक कस्टमर की समस्या शांति से सुलझाना",
        dimensionContributions: { social_energy_tendency: 3, communication_preference: 4 },
        trackAffinities: { "customer-support": 10, "customer-success": 6 },
      },
    ],
  },
  {
    id: "q2_communication",
    order: 2,
    category: "Customer Interaction",
    primaryDimension: "communication_preference",
    promptEn: "You need to explain a new service update to someone who is confused. How do you naturally prefer to do it?",
    promptHi: "आपको किसी ऐसे व्यक्ति को नया अपडेट समझाना है जो उलझन में है। आप स्वाभाविक रूप से यह कैसे करेंगे?",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "Call them directly, understand what matters most to them, and show the key benefit",
        labelHi: "सीधे कॉल करें, उनकी जरूरत समझें और मुख्य फायदा बताएं",
        dimensionContributions: { communication_preference: 5, social_energy_tendency: 5 },
        trackAffinities: { "business-development": 9, "customer-success": 7 },
      },
      {
        id: "b",
        labelEn: "Write a clean, step-by-step message with examples they can follow at their own pace",
        labelHi: "आसान स्टेप-बाय-स्टेप मैसेज और उदाहरण लिखें ताकि वे आराम से समझ सकें",
        dimensionContributions: { communication_preference: 4, foundational_english: 4 },
        trackAffinities: { "customer-support": 9, "product-management": 7 },
      },
      {
        id: "c",
        labelEn: "Create a short visual summary or story that makes the idea memorable and engaging",
        labelHi: "एक छोटा विज़ुअल या उदाहरण बनाएं जिससे बात आसानी से याद रहे",
        dimensionContributions: { communication_preference: 5, career_interests: 4 },
        trackAffinities: { "marketing-management": 10, "human-resources": 5 },
      },
      {
        id: "d",
        labelEn: "Share a structured checklist with clear timelines and who is responsible for what",
        labelHi: "तारीखों और जिम्मेदारियों के साथ एक स्पष्ट चेकलिस्ट शेयर करें",
        dimensionContributions: { communication_preference: 4, decision_making_tendency: 4 },
        trackAffinities: { "project-management": 9, "operations-management": 8 },
      },
    ],
  },
  {
    id: "q3_teamwork",
    order: 3,
    category: "Team Collaboration",
    primaryDimension: "collaboration_teamwork",
    promptEn: "Your college or office team has 5 days to deliver an event. Two teammates disagree on the plan. What role do you naturally step into?",
    promptHi: "आपकी टीम को 5 दिन में एक इवेंट पूरा करना है और दो साथी प्लान पर असहमत हैं। आप स्वाभाविक रूप से क्या भूमिका निभाएंगे?",
    estimatedSeconds: 30,
    options: [
      {
        id: "a",
        labelEn: "Listen to both perspectives patiently and help everyone agree on a fair middle path",
        labelHi: "दोनों की बात शांति से सुनें और सभी के लिए उचित रास्ता निकालें",
        dimensionContributions: { collaboration_teamwork: 5, communication_preference: 4 },
        trackAffinities: { "human-resources": 10, "customer-success": 7 },
      },
      {
        id: "b",
        labelEn: "Break the remaining 5 days into tasks, owners, and daily checkpoints so deadlines don't slip",
        labelHi: "बचे 5 दिनों को टास्क, जिम्मेदार व्यक्ति और डेली चेकपॉइंट्स में बांटें",
        dimensionContributions: { collaboration_teamwork: 5, decision_making_tendency: 5 },
        trackAffinities: { "project-management": 10, "operations-management": 7 },
      },
      {
        id: "c",
        labelEn: "Compare both ideas against the audience's actual needs and pick the highest-impact approach",
        labelHi: "दोनों विचारों की तुलना दर्शकों की जरूरत से करें और सबसे असरदार विकल्प चुनें",
        dimensionContributions: { collaboration_teamwork: 4, problem_solving_orientation: 5 },
        trackAffinities: { "product-management": 9, "marketing-management": 7 },
      },
      {
        id: "d",
        labelEn: "Take charge of external outreach, sponsors, or attendees while others finalize logistics",
        labelHi: "बाहरी लोगों, स्पॉन्सर्स या प्रतिभागियों से संपर्क की जिम्मेदारी संभालें",
        dimensionContributions: { collaboration_teamwork: 4, social_energy_tendency: 5 },
        trackAffinities: { "business-development": 9, "marketing-management": 6 },
      },
    ],
  },
  {
    id: "q4_independent",
    order: 4,
    category: "Workplace Situation",
    primaryDimension: "independent_work_preference",
    promptEn: "When given a weekly target, how much independent ownership do you enjoy?",
    promptHi: "जब आपको साप्ताहिक लक्ष्य दिया जाता है, तो आप कितना स्वतंत्र रूप से काम करना पसंद करते हैं?",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "High ownership: give me clear data/rules and let me execute thoroughly without micromanagement",
        labelHi: "पूरी जिम्मेदारी: स्पष्ट नियम और डेटा मिल जाए तो मैं शांति से सटीक काम पूरा कर लेता/लेती हूँ",
        dimensionContributions: { independent_work_preference: 5, problem_solving_orientation: 4 },
        trackAffinities: { "operations-management": 9, "product-management": 8 },
      },
      {
        id: "b",
        labelEn: "Goal-driven independence: give me a clear outreach target and flexibility in how I connect",
        labelHi: "लक्ष्य-आधारित स्वतंत्रता: स्पष्ट टारगेट मिले और बातचीत का तरीका तय करने की छूट हो",
        dimensionContributions: { independent_work_preference: 4, social_energy_tendency: 4 },
        trackAffinities: { "business-development": 9, "marketing-management": 7 },
      },
      {
        id: "c",
        labelEn: "Balanced rhythm: clear daily checklist paired with regular collaboration with teammates",
        labelHi: "संतुलित तरीका: स्पष्ट दैनिक चेकलिस्ट और टीम के साथ नियमित तालमेल",
        dimensionContributions: { independent_work_preference: 3, collaboration_teamwork: 5 },
        trackAffinities: { "project-management": 8, "customer-support": 8 },
      },
      {
        id: "d",
        labelEn: "People-connected work: I do best when closely supporting teammates or clients through the week",
        labelHi: "लोगों से जुड़ा काम: जब मैं टीम या ग्राहकों की लगातार मदद करता/करती हूँ तब बेहतर प्रदर्शन होता है",
        dimensionContributions: { independent_work_preference: 2, collaboration_teamwork: 5 },
        trackAffinities: { "customer-success": 9, "human-resources": 8 },
      },
    ],
  },
  {
    id: "q5_problem_solving",
    order: 5,
    category: "Problem Solving",
    primaryDimension: "problem_solving_orientation",
    promptEn: "Customers keep reporting the same issue every Monday morning. What is your first instinct?",
    promptHi: "ग्राहक हर सोमवार सुबह एक ही समस्या की शिकायत करते हैं। आपका पहला कदम क्या होगा?",
    estimatedSeconds: 30,
    options: [
      {
        id: "a",
        labelEn: "Audit the weekend workflow logs and fix the operational bottleneck permanently",
        labelHi: "वीकेंड के प्रोसेस और रिकॉर्ड जांचें ताकि मूल रुकावट स्थायी रूप से ठीक हो सके",
        dimensionContributions: { problem_solving_orientation: 5, independent_work_preference: 4 },
        trackAffinities: { "operations-management": 10, "project-management": 6 },
      },
      {
        id: "b",
        labelEn: "Interview affected users and design a simpler product screen or flow so confusion disappears",
        labelHi: "प्रभावित यूज़र्स से बात करें और स्क्रीन या फ्लो को आसान बनाने का प्रस्ताव बनाएं",
        dimensionContributions: { problem_solving_orientation: 5, learning_preference: 5 },
        trackAffinities: { "product-management": 10, "customer-success": 5 },
      },
      {
        id: "c",
        labelEn: "Reassure affected customers immediately and publish a clear quick-help guide",
        labelHi: "प्रभावित ग्राहकों को तुरंत समाधान दें और एक आसान हेल्प गाइड तैयार करें",
        dimensionContributions: { problem_solving_orientation: 4, communication_preference: 5 },
        trackAffinities: { "customer-support": 10, "customer-success": 8 },
      },
      {
        id: "d",
        labelEn: "Check whether new team members need better onboarding or training for Monday shifts",
        labelHi: "जांचें कि क्या टीम के सदस्यों को बेहतर ट्रेनिंग या स्पष्ट गाइडेंस की जरूरत है",
        dimensionContributions: { problem_solving_orientation: 4, collaboration_teamwork: 5 },
        trackAffinities: { "human-resources": 8, "project-management": 7 },
      },
    ],
  },
  {
    id: "q6_decision_making",
    order: 6,
    category: "Decision Making",
    primaryDimension: "decision_making_tendency",
    promptEn: "You must choose between two competing priorities before 5 PM, and you only have 80% of the information. What do you do?",
    promptHi: "शाम 5 बजे से पहले आपको दो जरूरी कामों में से एक चुनना है और जानकारी 80% ही है। आप क्या करेंगे?",
    estimatedSeconds: 30,
    options: [
      {
        id: "a",
        labelEn: "Weigh business impact vs effort quickly, make a clear call, and document why",
        labelHi: "प्रभाव और समय की तुलना करके स्पष्ट निर्णय लें और कारण नोट करें",
        dimensionContributions: { decision_making_tendency: 5, problem_solving_orientation: 5 },
        trackAffinities: { "product-management": 10, "project-management": 8 },
      },
      {
        id: "b",
        labelEn: "Verify the numbers and SLA deadlines first so the highest-risk task gets zero errors",
        labelHi: "पहले आंकड़े और डेडलाइन जांचें ताकि सबसे जरूरी काम बिना त्रुटि के पूरा हो",
        dimensionContributions: { decision_making_tendency: 5, independent_work_preference: 4 },
        trackAffinities: { "operations-management": 10, "customer-support": 6 },
      },
      {
        id: "c",
        labelEn: "Prioritise the task directly affecting a live client or revenue opportunity",
        labelHi: "उस काम को प्राथमिकता दें जिसका सीधा असर ग्राहक या रेवेन्यू अवसर पर पड़ता है",
        dimensionContributions: { decision_making_tendency: 5, adaptability: 4 },
        trackAffinities: { "business-development": 9, "customer-success": 8 },
      },
      {
        id: "d",
        labelEn: "Check quickly with the people affected so the choice is transparent and fair",
        labelHi: "प्रभावित लोगों से संक्षिप्त चर्चा करें ताकि निर्णय पारदर्शी और उचित रहे",
        dimensionContributions: { decision_making_tendency: 4, collaboration_teamwork: 5 },
        trackAffinities: { "human-resources": 9, "marketing-management": 5 },
      },
    ],
  },
  {
    id: "q7_adaptability",
    order: 7,
    category: "Workplace Situation",
    primaryDimension: "adaptability",
    promptEn: "Mid-week, your manager changes the campaign or process direction based on fresh market feedback. How do you react?",
    promptHi: "सप्ताह के बीच में, नए फीडबैक के आधार पर मैनेजर काम की दिशा बदल देते हैं। आपकी प्रतिक्रिया क्या होगी?",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "Excited — I enjoy testing new angles, experimenting fast, and learning what resonates",
        labelHi: "उत्साहित — मुझे नए तरीके आज़माना और तेजी से सीखना अच्छा लगता है",
        dimensionContributions: { adaptability: 5, learning_preference: 5 },
        trackAffinities: { "marketing-management": 10, "product-management": 7 },
      },
      {
        id: "b",
        labelEn: "Update the plan immediately, re-align timelines, and communicate revised dates to everyone",
        labelHi: "प्लान तुरंत अपडेट करें, नई डेडलाइन तय करें और सभी को स्पष्ट जानकारी दें",
        dimensionContributions: { adaptability: 5, decision_making_tendency: 4 },
        trackAffinities: { "project-management": 10, "operations-management": 6 },
      },
      {
        id: "c",
        labelEn: "Adapt my pitch right away and test the new message in my next client calls",
        labelHi: "अपनी बातचीत का तरीका तुरंत बदलें और अगली कॉल में नया संदेश आज़माएं",
        dimensionContributions: { adaptability: 5, social_energy_tendency: 4 },
        trackAffinities: { "business-development": 9, "customer-success": 7 },
      },
      {
        id: "d",
        labelEn: "Ask clarifying questions to ensure our documentation and support answers stay accurate",
        labelHi: "स्पष्ट प्रश्न पूछें ताकि हमारे गाइड और ग्राहक जवाब बिल्कुल सटीक रहें",
        dimensionContributions: { adaptability: 4, independent_work_preference: 4 },
        trackAffinities: { "customer-support": 8, "human-resources": 7 },
      },
    ],
  },
  {
    id: "q8_learning",
    order: 8,
    category: "Career Preference",
    primaryDimension: "learning_preference",
    promptEn: "When learning a brand-new workplace tool or skill, which method helps you master it fastest?",
    promptHi: "कोई नया ऑफिस टूल या कौशल सीखते समय, कौन सा तरीका आपको सबसे तेजी से सीखने में मदद करता है?",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "Practising hands-on with real datasets, formulas, or step-by-step SOP checklists",
        labelHi: "असली डेटा, फॉर्मूलों और स्टेप-बाय-स्टेप चेकलिस्ट के साथ प्रैक्टिस करना",
        dimensionContributions: { learning_preference: 5, independent_work_preference: 4 },
        trackAffinities: { "operations-management": 9, "project-management": 7 },
      },
      {
        id: "b",
        labelEn: "Exploring real apps/campaigns, tearing down why they work, and building my own version",
        labelHi: "असली ऐप्स या कैंपेन को समझना कि वे क्यों सफल हुए और अपना मॉडल बनाना",
        dimensionContributions: { learning_preference: 5, problem_solving_orientation: 5 },
        trackAffinities: { "product-management": 9, "marketing-management": 9 },
      },
      {
        id: "c",
        labelEn: "Live role-plays, mock calls, and direct mentor feedback on my delivery",
        labelHi: "लाइव रोल-प्ले, मॉक कॉल और मेंटर से सीधा फीडबैक लेना",
        dimensionContributions: { learning_preference: 5, social_energy_tendency: 4 },
        trackAffinities: { "business-development": 9, "customer-success": 8 },
      },
      {
        id: "d",
        labelEn: "Shadowing experienced teammates and practising real ticket or interview scenarios",
        labelHi: "अनुभवी साथियों के साथ काम देखकर असली कस्टमर या इंटरव्यू केस हल करना",
        dimensionContributions: { learning_preference: 4, collaboration_teamwork: 5 },
        trackAffinities: { "customer-support": 8, "human-resources": 9 },
      },
    ],
  },
  {
    id: "q9_interest_1",
    order: 9,
    category: "Career Preference",
    primaryDimension: "career_interests",
    promptEn: "Which of these real workday achievements would make you feel proudest at the end of a month?",
    promptHi: "महीने के अंत में इनमें से कौन सी उपलब्धि आपको सबसे ज्यादा गर्व महसूस कराएगी?",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "Bringing in 12 new business clients through thoughtful outreach and trust-building",
        labelHi: "अच्छी बातचीत और विश्वास बनाकर 12 नए बिज़नेस क्लाइंट जोड़ना",
        dimensionContributions: { career_interests: 5, social_energy_tendency: 5 },
        trackAffinities: { "business-development": 12 },
      },
      {
        id: "b",
        labelEn: "Helping 30 existing customers succeed so every single one renews happily",
        labelHi: "30 मौजूदा ग्राहकों की मदद करना ताकि वे खुशी से सेवा जारी रखें",
        dimensionContributions: { career_interests: 5, collaboration_teamwork: 4 },
        trackAffinities: { "customer-success": 12, "customer-support": 5 },
      },
      {
        id: "c",
        labelEn: "Launching a creative digital campaign that doubled student or customer sign-ups",
        labelHi: "एक क्रिएटिव डिजिटल कैंपेन चलाना जिससे साइन-अप्स दोगुने हो जाएं",
        dimensionContributions: { career_interests: 5, adaptability: 5 },
        trackAffinities: { "marketing-management": 12 },
      },
      {
        id: "d",
        labelEn: "Hiring and smoothly onboarding 10 talented people who love their new team",
        labelHi: "10 योग्य उम्मीदवारों की हायरिंग और शानदार ऑनबोर्डिंग पूरी करना",
        dimensionContributions: { career_interests: 5, communication_preference: 4 },
        trackAffinities: { "human-resources": 12 },
      },
    ],
  },
  {
    id: "q10_interest_2",
    order: 10,
    category: "Career Preference",
    primaryDimension: "career_interests",
    promptEn: "And among these four behind-the-scenes strengths, which one feels closest to what you enjoy doing?",
    promptHi: "और इन चार महत्वपूर्ण भूमिकाओं में से कौन सी आपकी रुचि के सबसे करीब है?",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "Keeping daily Excel trackers, vendor schedules, and SLAs running at 99% accuracy",
        labelHi: "दैनिक एक्सेल ट्रैकर, प्रोसेस और SLA को 99% सटीकता के साथ चलाना",
        dimensionContributions: { career_interests: 5, independent_work_preference: 5 },
        trackAffinities: { "operations-management": 12 },
      },
      {
        id: "b",
        labelEn: "Coordinating 4 teams so a complex project ships cleanly before deadline",
        labelHi: "4 टीमों के बीच तालमेल बिठाकर किसी बड़े प्रोजेक्ट को समय पर पूरा कराना",
        dimensionContributions: { career_interests: 5, collaboration_teamwork: 5 },
        trackAffinities: { "project-management": 12 },
      },
      {
        id: "c",
        labelEn: "Analysing user behaviour and writing clear specs for the next product improvement",
        labelHi: "यूज़र अनुभव को समझकर प्रोडक्ट सुधार की स्पष्ट योजना बनाना",
        dimensionContributions: { career_interests: 5, problem_solving_orientation: 5 },
        trackAffinities: { "product-management": 12 },
      },
      {
        id: "d",
        labelEn: "Solving 40+ customer tickets daily with high satisfaction and zero escalations",
        labelHi: "हर दिन ग्राहकों की समस्याओं को तेजी और विनम्रता से सुलझाना",
        dimensionContributions: { career_interests: 5, communication_preference: 4 },
        trackAffinities: { "customer-support": 12 },
      },
    ],
  },
  {
    id: "q11_aptitude_1",
    order: 11,
    category: "Practical Aptitude",
    primaryDimension: "basic_aptitude",
    promptEn: "Quick Workplace Math: A team resolves 120 customer tickets in 6 hours at a steady pace. How many tickets will they resolve in 9 hours?",
    promptHi: "व्यावहारिक गणित: एक टीम 6 घंटे में 120 टिकट हल करती है। उसी गति से 9 घंटे में कितने टिकट हल होंगे?",
    estimatedSeconds: 35,
    options: [
      {
        id: "a",
        labelEn: "160 tickets",
        labelHi: "160 टिकट",
        dimensionContributions: { basic_aptitude: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "b",
        labelEn: "180 tickets",
        labelHi: "180 टिकट",
        dimensionContributions: { basic_aptitude: 5 },
        trackAffinities: { "operations-management": 4, "product-management": 4, "project-management": 3 },
        isObjectiveCorrect: true,
      },
      {
        id: "c",
        labelEn: "200 tickets",
        labelHi: "200 टिकट",
        dimensionContributions: { basic_aptitude: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "d",
        labelEn: "150 tickets",
        labelHi: "150 टिकट",
        dimensionContributions: { basic_aptitude: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
    ],
  },
  {
    id: "q12_aptitude_2",
    order: 12,
    category: "Practical Aptitude",
    primaryDimension: "basic_aptitude",
    promptEn: "Quick Business Logic: Out of 200 leads contacted, 50 booked a demo and 10 enrolled. What is the demo-to-enrollment conversion rate?",
    promptHi: "व्यावहारिक तर्क: 200 लीड्स में से 50 ने डेमो बुक किया और 10 ने एडमिशन लिया। डेमो से एडमिशन का कन्वर्ज़न प्रतिशत क्या है?",
    estimatedSeconds: 35,
    options: [
      {
        id: "a",
        labelEn: "5%",
        labelHi: "5%",
        dimensionContributions: { basic_aptitude: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "b",
        labelEn: "20%",
        labelHi: "20%",
        dimensionContributions: { basic_aptitude: 5 },
        trackAffinities: { "product-management": 4, "marketing-management": 4, "operations-management": 4 },
        isObjectiveCorrect: true,
      },
      {
        id: "c",
        labelEn: "25%",
        labelHi: "25%",
        dimensionContributions: { basic_aptitude: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "d",
        labelEn: "10%",
        labelHi: "10%",
        dimensionContributions: { basic_aptitude: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
    ],
  },
  {
    id: "q13_english_1",
    order: 13,
    category: "Foundational English",
    primaryDimension: "foundational_english",
    promptEn: "Practical Office English: Choose the most professional email sentence to reply to a client waiting for an update.",
    promptHi: "प्रैक्टिकल इंग्लिश: अपडेट का इंतज़ार कर रहे क्लाइंट को भेजने के लिए सबसे सही प्रोफेशनल वाक्य चुनें।",
    estimatedSeconds: 30,
    options: [
      {
        id: "a",
        labelEn: "Wait please, I am doing it right now and will tell later.",
        labelHi: "Wait please, I am doing it right now and will tell later.",
        dimensionContributions: { foundational_english: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "b",
        labelEn: "Thank you for your patience. We are reviewing your request and will share an update by 4:00 PM today.",
        labelHi: "Thank you for your patience. We are reviewing your request and will share an update by 4:00 PM today.",
        dimensionContributions: { foundational_english: 5 },
        trackAffinities: { "customer-support": 4, "customer-success": 4, "human-resources": 3 },
        isObjectiveCorrect: true,
      },
      {
        id: "c",
        labelEn: "Why you sent reminder again? Team is busy today.",
        labelHi: "Why you sent reminder again? Team is busy today.",
        dimensionContributions: { foundational_english: 1 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "d",
        labelEn: "Update will come soon maybe tomorrow evening.",
        labelHi: "Update will come soon maybe tomorrow evening.",
        dimensionContributions: { foundational_english: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
    ],
  },
  {
    id: "q14_english_2",
    order: 14,
    category: "Foundational English",
    primaryDimension: "foundational_english",
    promptEn: "Practical Office English: Fill in the blank — 'Our team ____ the quarterly report before Friday's meeting.'",
    promptHi: "प्रैक्टिकल इंग्लिश: सही विकल्प चुनें — 'Our team ____ the quarterly report before Friday's meeting.'",
    estimatedSeconds: 25,
    options: [
      {
        id: "a",
        labelEn: "will finalize",
        labelHi: "will finalize",
        dimensionContributions: { foundational_english: 5 },
        trackAffinities: { "marketing-management": 3, "customer-success": 3, "project-management": 3 },
        isObjectiveCorrect: true,
      },
      {
        id: "b",
        labelEn: "finalizing",
        labelHi: "finalizing",
        dimensionContributions: { foundational_english: 2 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "c",
        labelEn: "have finalize",
        labelHi: "have finalize",
        dimensionContributions: { foundational_english: 1 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
      {
        id: "d",
        labelEn: "was finalized tomorrow",
        labelHi: "was finalized tomorrow",
        dimensionContributions: { foundational_english: 1 },
        trackAffinities: {},
        isObjectiveCorrect: false,
      },
    ],
  },
];

export function getPublicPsychometricQuestions(): PublicPsychometricQuestion[] {
  return PSYCHOMETRIC_QUESTIONS.map((q) => ({
    id: q.id,
    order: q.order,
    category: q.category,
    primaryDimension: q.primaryDimension,
    promptEn: q.promptEn,
    promptHi: q.promptHi,
    estimatedSeconds: q.estimatedSeconds,
    options: q.options.map((opt) => ({
      id: opt.id,
      labelEn: opt.labelEn,
      labelHi: opt.labelHi,
    })),
  }));
}

export interface DimensionInsight {
  dimension: AssessmentDimensionId;
  label: string;
  tendencyLabel: string; // Non-clinical preference framing
  scoreOutOf100: number;
  description: string;
}

export interface RankedCareerTrackResult {
  rank: 1 | 2 | 3;
  trackId: CanonicalCareerTrackId;
  name: string;
  hindiName: string;
  alignmentPercent: number;
  summary: string;
  whyItFits: string;
  relevantSkills: string[];
  suitableJobFamilies: string[];
  recommendedLearningPath: string[];
  jobAvailabilityContext: string; // Explicitly separate from alignment score
}

export interface FullPsychometricReport {
  engineVersion: string;
  completedAt: string;
  questionsAnswered: number;
  totalQuestions: number;
  topTracks: RankedCareerTrackResult[];
  strengths: string[];
  developmentOpportunities: string[];
  workStylePreferences: string[];
  dimensionProfiles: DimensionInsight[];
  aptitudeScorePercent: number;
  englishScorePercent: number;
  nonClinicalDisclaimer: string;
}

export interface PreviewPsychometricReport {
  engineVersion: string;
  previewSharePercent: 20;
  completedAt: string;
  questionsAnswered: number;
  totalQuestions: number;
  primaryTrack: {
    trackId: CanonicalCareerTrackId;
    name: string;
    hindiName: string;
    alignmentPercent: number;
    summary: string;
    whyItFits: string;
  };
  keyBehaviouralInsights: string[];
  briefStrengthsSummary: string[];
  developmentOpportunity: string;
  fullReportIncludes: string[];
  nonClinicalDisclaimer: string;
}

const DIMENSION_METADATA: Record<
  AssessmentDimensionId,
  { label: string; highTendency: string; balancedTendency: string; reflectiveTendency: string }
> = {
  social_energy_tendency: {
    label: "Interaction & Energy Preference",
    highTendency: "Energised by frequent outward conversations and active client/people engagement",
    balancedTendency: "Comfortable alternating between collaborative interactions and focused quiet work",
    reflectiveTendency: "Tends to do deepest thinking in calm, structured, distraction-free settings",
  },
  communication_preference: {
    label: "Communication Style",
    highTendency: "Natural preference for expressive, persuasive, and relationship-forward communication",
    balancedTendency: "Adapts well between spoken discussions and clear written summaries",
    reflectiveTendency: "Prefers concise, structured written communication and clear documentation",
  },
  collaboration_teamwork: {
    label: "Team Collaboration Preference",
    highTendency: "Thrives in coordinated group workflows, cross-team alignment, and shared goals",
    balancedTendency: "Works smoothly both alongside teammates and on individually owned deliverables",
    reflectiveTendency: "Prefers clearly separated individual responsibilities with periodic team syncs",
  },
  independent_work_preference: {
    label: "Independent Ownership",
    highTendency: "Strong preference for owning structured tasks and executing thoroughly with autonomy",
    balancedTendency: "Comfortable with guided ownership and regular check-ins",
    reflectiveTendency: "Prefers frequent feedback loops and closely partnered teamwork",
  },
  problem_solving_orientation: {
    label: "Problem-Solving Orientation",
    highTendency: "Root-cause focused — naturally looks for structural and workflow improvements",
    balancedTendency: "Balances immediate practical fixes with longer-term process improvements",
    reflectiveTendency: "Focuses first on immediate responsiveness and supporting people affected",
  },
  decision_making_tendency: {
    label: "Decision-Making Style",
    highTendency: "Structured and prioritisation-led even when working under time pressure",
    balancedTendency: "Weighs practical data alongside stakeholder input before committing",
    reflectiveTendency: "Prefers consultative consensus and thorough verification before deciding",
  },
  adaptability: {
    label: "Adaptability & Change Comfort",
    highTendency: "Comfortable pivoting quickly when priorities, campaigns, or workflows shift",
    balancedTendency: "Adapts steadily once goals and timelines are clarified",
    reflectiveTendency: "Values predictable routines and clear advance notice before major changes",
  },
  learning_preference: {
    label: "Learning Style Preference",
    highTendency: "Learns rapidly through hands-on experimentation, teardowns, and active practice",
    balancedTendency: "Combines structured instruction with guided practical assignments",
    reflectiveTendency: "Prefers step-by-step demonstrations and shadowing before independent practice",
  },
  career_interests: {
    label: "Role & Career Interest Signal",
    highTendency: "Clear functional enthusiasm aligned with your top recommended corporate tracks",
    balancedTendency: "Open across multiple complementary business functions",
    reflectiveTendency: "Exploring across domains — guided career mapping will add clarity",
  },
  basic_aptitude: {
    label: "Practical Workplace Aptitude",
    highTendency: "Strong practical comfort with workplace ratios, conversion math, and logical checks",
    balancedTendency: "Solid foundational logic that will sharpen further with guided spreadsheet drills",
    reflectiveTendency: "Will benefit from structured daily business-math and analytical practice modules",
  },
  foundational_english: {
    label: "Foundational Workplace English",
    highTendency: "Clear, polite, and structured professional English ready for client & team communication",
    balancedTendency: "Functional workplace English that can grow quickly with guided email/call coaching",
    reflectiveTendency: "Priority opportunity to build practical spoken and written workplace English confidence",
  },
};

const ALL_DIMENSIONS = Object.keys(DIMENSION_METADATA) as AssessmentDimensionId[];
const ALL_TRACKS = Object.keys(CANONICAL_TRACK_PROFILES) as CanonicalCareerTrackId[];

/**
 * Deterministic scoring engine:
 * Maps submitted answers to all 11 dimensions and ranks the 8 canonical tracks
 * strictly on career alignment (never job vacancy counts).
 */
export function evaluatePsychometricAssessment(
  answers: Record<string, string>,
  completedAt = new Date().toISOString()
): { fullReport: FullPsychometricReport; previewReport: PreviewPsychometricReport } {
  const dimSums: Record<AssessmentDimensionId, number> = {} as Record<AssessmentDimensionId, number>;
  const dimCounts: Record<AssessmentDimensionId, number> = {} as Record<AssessmentDimensionId, number>;
  for (const d of ALL_DIMENSIONS) {
    dimSums[d] = 0;
    dimCounts[d] = 0;
  }

  const directTrackBoost: Record<CanonicalCareerTrackId, number> = {} as Record<
    CanonicalCareerTrackId,
    number
  >;
  for (const t of ALL_TRACKS) {
    directTrackBoost[t] = 0;
  }

  let answeredCount = 0;
  let aptitudeCorrect = 0;
  let aptitudeTotal = 0;
  let englishCorrect = 0;
  let englishTotal = 0;

  for (const question of PSYCHOMETRIC_QUESTIONS) {
    const selectedOptionId = answers[question.id];
    const selected = question.options.find((o) => o.id === selectedOptionId);
    if (question.primaryDimension === "basic_aptitude") aptitudeTotal += 1;
    if (question.primaryDimension === "foundational_english") englishTotal += 1;
    if (!selected) continue;

    answeredCount += 1;
    if (question.primaryDimension === "basic_aptitude" && selected.isObjectiveCorrect) {
      aptitudeCorrect += 1;
    }
    if (question.primaryDimension === "foundational_english" && selected.isObjectiveCorrect) {
      englishCorrect += 1;
    }

    for (const [dimKey, val] of Object.entries(selected.dimensionContributions)) {
      const dim = dimKey as AssessmentDimensionId;
      dimSums[dim] += val ?? 0;
      dimCounts[dim] += 1;
    }

    for (const [trackKey, val] of Object.entries(selected.trackAffinities)) {
      const track = trackKey as CanonicalCareerTrackId;
      directTrackBoost[track] += val ?? 0;
    }
  }

  // Normalized 0..100 score per dimension (default neutral 60 if unmeasured)
  const dimensionScores: Record<AssessmentDimensionId, number> = {} as Record<
    AssessmentDimensionId,
    number
  >;
  const dimensionProfiles: DimensionInsight[] = ALL_DIMENSIONS.map((dim) => {
    const count = dimCounts[dim];
    const avgOutOf5 = count > 0 ? dimSums[dim] / count : 3;
    const scoreOutOf100 = Math.round(Math.max(25, Math.min(100, (avgOutOf5 / 5) * 100)));
    dimensionScores[dim] = scoreOutOf100;

    const meta = DIMENSION_METADATA[dim];
    let tendencyLabel = "Balanced Tendency";
    let description = meta.balancedTendency;
    if (scoreOutOf100 >= 78) {
      tendencyLabel = "Strong Preference";
      description = meta.highTendency;
    } else if (scoreOutOf100 <= 52) {
      tendencyLabel = "Reflective / Developing Tendency";
      description = meta.reflectiveTendency;
    }

    return {
      dimension: dim,
      label: meta.label,
      tendencyLabel,
      scoreOutOf100,
      description,
    };
  });

  const aptitudeScorePercent =
    aptitudeTotal > 0 ? Math.round((aptitudeCorrect / aptitudeTotal) * 100) : 0;
  const englishScorePercent =
    englishTotal > 0 ? Math.round((englishCorrect / englishTotal) * 100) : 0;

  // Score each of the 8 canonical tracks deterministically
  const maxDirectBoost = Math.max(1, ...ALL_TRACKS.map((t) => directTrackBoost[t]));
  const trackScores = ALL_TRACKS.map((trackId) => {
    const profile = CANONICAL_TRACK_PROFILES[trackId];
    let weightedSum = 0;
    let totalWeight = 0;
    for (const dim of ALL_DIMENSIONS) {
      const w = profile.dimensionWeights[dim];
      weightedSum += dimensionScores[dim] * w;
      totalWeight += w;
    }
    const dimensionFit = weightedSum / totalWeight; // 0..100
    const scenarioFit = (directTrackBoost[trackId] / maxDirectBoost) * 100; // 0..100
    // 55% direct scenario alignment + 45% weighted 11-dimension alignment
    const combinedRaw = scenarioFit * 0.55 + dimensionFit * 0.45;
    const alignmentPercent = Math.round(Math.max(48, Math.min(96, combinedRaw)));
    return {
      trackId,
      profile,
      combinedRaw,
      alignmentPercent,
    };
  });

  // Deterministic tie-breaking by trackId if raw scores match
  trackScores.sort((a, b) =>
    b.combinedRaw !== a.combinedRaw ? b.combinedRaw - a.combinedRaw : a.trackId.localeCompare(b.trackId)
  );

  const sortedDims = [...dimensionProfiles].sort((a, b) => b.scoreOutOf100 - a.scoreOutOf100);
  const topStrengthDims = sortedDims.slice(0, 3);
  const growthDims = [...dimensionProfiles]
    .sort((a, b) => a.scoreOutOf100 - b.scoreOutOf100)
    .slice(0, 2);

  const topTracks: RankedCareerTrackResult[] = trackScores.slice(0, 3).map((entry, idx) => ({
    rank: (idx + 1) as 1 | 2 | 3,
    trackId: entry.trackId,
    name: entry.profile.name,
    hindiName: entry.profile.hindiName,
    alignmentPercent: entry.alignmentPercent,
    summary: entry.profile.summary,
    whyItFits: `Matches your preference for ${topStrengthDims[0].label.toLowerCase()} and ${topStrengthDims[1].label.toLowerCase()} across workplace scenarios.`,
    relevantSkills: entry.profile.relevantSkills,
    suitableJobFamilies: entry.profile.suitableJobFamilies,
    recommendedLearningPath: entry.profile.recommendedLearningPath,
    jobAvailabilityContext: entry.profile.activeEmployerDemandNote,
  }));

  const strengths = topStrengthDims.map((d) => `${d.label}: ${d.description}`);
  const developmentOpportunities = growthDims.map((d) => {
    if (d.dimension === "foundational_english") {
      return "Foundational Workplace English: Practising concise daily business emails and structured call responses will significantly boost interview readiness.";
    }
    if (d.dimension === "basic_aptitude") {
      return "Practical Workplace Aptitude: Building confidence in percentages, conversion ratios, and basic spreadsheet metrics will open more analytical roles.";
    }
    return `${d.label}: Structured guided practice in your 90-day cohort will help you stretch comfortably in this area.`;
  });

  const workStylePreferences = [
    dimensionProfiles.find((d) => d.dimension === "social_energy_tendency")!.description,
    dimensionProfiles.find((d) => d.dimension === "collaboration_teamwork")!.description,
    dimensionProfiles.find((d) => d.dimension === "decision_making_tendency")!.description,
  ];

  const nonClinicalDisclaimer =
    "This career discovery assessment highlights workplace tendencies, preferences, and foundational readiness to guide career exploration. It is not a medical or psychological diagnosis, and preferences can grow with training and practice.";

  const fullReport: FullPsychometricReport = {
    engineVersion: PSYCHOMETRIC_ENGINE_VERSION,
    completedAt,
    questionsAnswered: answeredCount,
    totalQuestions: PSYCHOMETRIC_QUESTIONS.length,
    topTracks,
    strengths,
    developmentOpportunities,
    workStylePreferences,
    dimensionProfiles,
    aptitudeScorePercent,
    englishScorePercent,
    nonClinicalDisclaimer,
  };

  const previewReport: PreviewPsychometricReport = {
    engineVersion: PSYCHOMETRIC_ENGINE_VERSION,
    previewSharePercent: 20,
    completedAt,
    questionsAnswered: answeredCount,
    totalQuestions: PSYCHOMETRIC_QUESTIONS.length,
    primaryTrack: {
      trackId: topTracks[0].trackId,
      name: topTracks[0].name,
      hindiName: topTracks[0].hindiName,
      alignmentPercent: topTracks[0].alignmentPercent,
      summary: topTracks[0].summary,
      whyItFits: topTracks[0].whyItFits,
    },
    keyBehaviouralInsights: workStylePreferences.slice(0, 2),
    briefStrengthsSummary: strengths.slice(0, 2),
    developmentOpportunity: developmentOpportunities[0],
    fullReportIncludes: [
      "All Top 3 recommended career tracks ranked by transparent fit criteria",
      "Complete 11-dimension work-style, communication, aptitude & English breakdown",
      "Suitable entry-level job families & practical skills checklist",
      "Personalised 90-day learning roadmap aligned to your strengths",
    ],
    nonClinicalDisclaimer,
  };

  return { fullReport, previewReport };
}
