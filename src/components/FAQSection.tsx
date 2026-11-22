import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import { memo } from "react";

const faqs = [
  {
    question: "Who is eligible to apply?",
    answer: "Final-year students and fresh graduates across India—especially from rural areas and Tier 2, Tier 3, and Tier 4 towns—who are ready to commit to 15 weeks of structured practical training."
  },
  {
    question: "Which degrees are accepted?",
    answer: "BA, B.Com, B.Sc, BBA, BCA, MA, M.Com, M.Sc, and other eligible graduate streams."
  },
  {
    question: "Is fluent English compulsory before joining?",
    answer: "No. We start with bilingual guidance (Hindi + English) and help you build practical workplace English, email writing, and interview clarity during the 15-week track."
  },
  {
    question: "How do upfront admission fees and pay-after-placement fees work?",
    answer: "Students pay the cohort admission/enrollment fee disclosed upfront before joining; eligible tracks offer deferred training fees payable after placement. Complete fee breakdowns and written refund eligibility rules are shared before payment and published on our Refund Policy page."
  },
  {
    question: "How does the written placement-support refund policy work?",
    answer: "Eligible students who complete all 15-week coursework, maintain at least 90% attendance, clear assessments, and actively participate in placement interviews qualify for a written admission-fee refund review if unplaced within 90 days of program completion. Non-refundable items and early withdrawal tiers are detailed on our Refund Policy page."
  },
  {
    question: "What if I struggle with an assessment?",
    answer: "You receive 1:1 mentor feedback, guided revision, and structured reassessment opportunities."
  },
  {
    question: "What happens after I take the Career Assessment or register?",
    answer: "You immediately see your top 3 matched UdaYantu career tracks, receive your syllabus roadmap, and get invited to an orientation session with our student guidance team."
  },
  {
    question: "How can employers hire UdaYantu graduates?",
    answer: "Hiring teams can visit our Employers page (/employers) to share role requirements and connect with our placement team for pre-trained fresher shortlists."
  }
];

export const FAQSection = memo(() => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,hsl(var(--muted)),transparent)] pointer-events-none" />
      
      <div className="container px-4 mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
            <HelpCircle className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Everything you need to know about UdaYantu
          </p>
        </div>
        
        <Card className="border border-border shadow-sm p-2">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-border/60 last:border-0"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold py-5 px-4 hover:text-primary hover:no-underline transition-colors [&[data-state=open]]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground px-4 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Contact CTA */}
        <div className="mt-10 md:mt-12">
          <Card className="bg-gradient-to-br from-muted/80 to-muted border border-border/60 p-6 md:p-8">
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-foreground">Still have questions?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm md:text-base text-muted-foreground">
                <a 
                  href="mailto:support@udayantu.com" 
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@udayantu.com
                </a>
                <span className="hidden sm:inline text-border">|</span>
                <a 
                  href="https://wa.me/message/3ZRKURYKBYOPE1"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";
