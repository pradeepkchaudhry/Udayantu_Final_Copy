import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Building2, MapPin, Target, GitBranch, Award, Lock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { motion } from "framer-motion";


interface TrustCardProps {
  icon: typeof Target;
  title: string;
  hindiText?: string;
  description: React.ReactNode;
  index: number;
}

const TrustCard = ({ icon: Icon, title, hindiText, description, index }: TrustCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
  >
    <Card className="group relative bg-card border border-border/40 rounded-2xl hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 h-full">
      <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full">
        {/* Icon with modern container */}
        <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/10 transition-colors duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        
        {/* Title */}
        <h4 className="font-bold text-lg mb-3 text-primary text-center leading-tight">
          {title}
        </h4>
        
        {/* Hindi text if present */}
        {hindiText && (
          <p className="font-semibold text-sm text-secondary mb-3 text-center">
            {hindiText}
          </p>
        )}
        
        {/* Description */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed flex-grow">
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const trustCards = [
  {
    icon: Target,
    title: "Written Refund Protection",
    hindiText: "स्पष्ट और लिखित रिफंड पॉलिसी — कोई छिपी शर्त नहीं।",
    description: <>Complete all 15-week coursework, maintain 90% attendance, and participate in interviews—unplaced within 90 days? <strong className="text-foreground">Request a written refund review.</strong></>
  },
  {
    icon: GitBranch,
    title: "Career Pathways for Every Stream",
    description: <>Built for BA, B.Com, B.Sc, BBA, BCA, MA, M.Com, and M.Sc graduates from rural and Tier 2–4 towns. <strong className="text-foreground">Practical skills matter more than college tier.</strong></>
  },
  {
    icon: Award,
    title: "Portfolio-Backed Completion Certificate",
    description: <>Graduate with real workplace assignments, CRM/Excel deliverables, and an UdaYantu completion certificate. <strong className="text-foreground">Built for practical hiring interviews.</strong></>
  },
  {
    icon: Lock,
    title: "Secure & Student-First",
    description: <>Personalized coaching, bilingual support, and 1:1 career guidance—<strong className="text-foreground">designed specifically for students from small towns.</strong> Your data is safe and never sold.</>
  },
  {
    icon: Home,
    title: "Mentors Who Understand Your Journey",
    description: <>Learn online from your hometown without costly relocation upfront. <strong className="text-foreground">Bridge the gap between your hometown and corporate readiness.</strong></>
  },
  {
    icon: Shield,
    title: "Transparent & Fair Process",
    description: <>No hollow promises, no hidden fees. Every eligibility rule and curriculum milestone is <strong className="text-foreground">documented clearly before enrollment.</strong></>
  }
];

export const TrustSection = () => {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto max-w-6xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary"
        >
          Why UdaYantu
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-lg text-muted-foreground max-w-4xl mx-auto mb-14 leading-relaxed"
        >
          While most platforms focus only on engineering colleges and metro cities, <strong className="text-foreground">UdaYantu builds structured corporate pathways</strong> for BA, B.Com, B.Sc, BBA, BCA, MA, M.Com, and M.Sc graduates from rural India and Tier 2–4 towns.
        </motion.p>

        {/* 3x2 Grid for balanced layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {trustCards.map((card, index) => (
            <TrustCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              hindiText={card.hindiText}
              description={card.description}
              index={index}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-8 py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold max-w-full shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300"
            onClick={() => setShowRegistration(true)}
          >
            Start Your Career Assessment &amp; Registration
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl p-8 md:p-12 border border-border/40 shadow-sm"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-primary">
            Verified Programme Pillars
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-primary/5 rounded-xl">
              <TrendingUp className="w-10 h-10 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold text-primary mb-2">8 Tracks</p>
              <p className="text-sm text-muted-foreground">Structured non-technical career paths</p>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl">
              <Building2 className="w-10 h-10 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold text-primary mb-2">15 Weeks</p>
              <p className="text-sm text-muted-foreground">Guided projects, tools &amp; mock interviews</p>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl">
              <Shield className="w-10 h-10 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold text-primary mb-2">90 Days</p>
              <p className="text-sm text-muted-foreground">Post-completion placement support window</p>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl">
              <MapPin className="w-10 h-10 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold text-primary mb-2">Pan-India</p>
              <p className="text-sm text-muted-foreground">Online access for rural &amp; Tier 2–4 towns</p>
            </div>
          </div>

          <div className="mt-8 text-center p-6 bg-secondary/5 rounded-xl border border-secondary/10">
            <Shield className="w-12 h-12 text-secondary mx-auto mb-3" />
            <p className="text-lg font-semibold text-primary">
              Clear, written placement-support and refund eligibility terms published before enrollment
            </p>
          </div>
        </motion.div>
      </div>

      <AuthModal 
        open={showRegistration}
        onOpenChange={setShowRegistration}
        defaultTab="register"
      />
    </section>
  );
};
